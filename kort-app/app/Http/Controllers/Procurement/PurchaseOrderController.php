<?php

namespace App\Http\Controllers\Procurement;

use App\Enums\PurchaseOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\PurchaseOrderActionRequest;
use App\Http\Requests\Procurement\PurchaseOrderRequest;
use App\Http\Resources\PurchaseOrderResource;
use App\Http\Resources\PurchaseRequisitionResource;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequisition;
use App\Services\ProcurementOptionsService;
use App\Services\PurchaseOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(PurchaseOrder::class, 'purchaseOrder');
    }

    public function index(Request $request, ProcurementOptionsService $options): Response
    {
        $filters = $request->only(['search', 'status', 'supplier_id', 'purchase_requisition_id']);

        $purchaseOrders = PurchaseOrder::query()
            ->with(['supplier', 'requisition'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('po_number', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%"));
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['supplier_id'] ?? null, fn ($query, string $supplierId) => $query->where('supplier_id', $supplierId))
            ->when($filters['purchase_requisition_id'] ?? null, fn ($query, string $requisitionId) => $query->where('purchase_requisition_id', $requisitionId))
            ->latest('po_date')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Procurement/PurchaseOrders/Index', [
            'filters' => $filters,
            'purchaseOrders' => PurchaseOrderResource::collection($purchaseOrders),
            'filterOptions' => [
                'statuses' => $options->purchaseOrderOptions()['statuses'],
                'suppliers' => $options->purchaseOrderOptions()['suppliers'],
                'requisitions' => collect($options->purchaseOrderOptions()['approvedRequisitions'])
                    ->map(fn (PurchaseRequisition $requisition) => [
                        'id' => $requisition->id,
                        'name' => $requisition->requisition_number,
                        'code' => $requisition->department?->code,
                    ])
                    ->values()
                    ->all(),
            ],
            'permissions' => [
                'create' => $request->user()?->can('purchase-order.create') ?? false,
            ],
        ]);
    }

    public function create(Request $request, ProcurementOptionsService $options): Response
    {
        $selectedRequisition = null;

        if ($request->filled('requisition')) {
            $selectedRequisition = PurchaseRequisition::query()
                ->with(['department', 'requestedBy', 'items.assetCategory', 'items.inventoryItem', 'items.preferredSupplier'])
                ->findOrFail($request->integer('requisition'));
        }

        return Inertia::render('Procurement/PurchaseOrders/Form', [
            'purchaseOrder' => null,
            'options' => $options->purchaseOrderOptions(),
            'selectedRequisition' => $selectedRequisition ? PurchaseRequisitionResource::make($selectedRequisition) : null,
        ]);
    }

    public function store(PurchaseOrderRequest $request, PurchaseOrderService $service): RedirectResponse
    {
        $purchaseOrder = $service->create($request->validated(), $request->user());

        return redirect()->route('procurement.purchase-orders.show', $purchaseOrder)->with('success', 'Purchase order saved as draft.');
    }

    public function show(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load([
            'supplier',
            'requisition.department',
            'requisition.requestedBy',
            'items.requisitionItem',
            'items.assetCategory',
            'items.inventoryItem',
            'goodsReceipts.receivedBy',
        ]);

        return Inertia::render('Procurement/PurchaseOrders/Show', [
            'purchaseOrder' => PurchaseOrderResource::make($purchaseOrder),
            'permissions' => [
                'edit' => request()->user()->can('purchase-order.edit') && $purchaseOrder->status === PurchaseOrderStatus::Draft,
                'issue' => request()->user()->can('purchase-order.issue') && $purchaseOrder->status === PurchaseOrderStatus::Draft,
                'cancel' => request()->user()->can('purchase-order.cancel') && ! in_array($purchaseOrder->status->value, [PurchaseOrderStatus::Cancelled->value, PurchaseOrderStatus::Closed->value], true),
                'close' => request()->user()->can('purchase-order.close') && $purchaseOrder->status === PurchaseOrderStatus::FullyReceived,
                'receive' => request()->user()->can('goods-receipt.create') && in_array($purchaseOrder->status->value, [PurchaseOrderStatus::Issued->value, PurchaseOrderStatus::PartiallyReceived->value], true),
            ],
        ]);
    }

    public function edit(PurchaseOrder $purchaseOrder, ProcurementOptionsService $options): Response
    {
        return Inertia::render('Procurement/PurchaseOrders/Form', [
            'purchaseOrder' => PurchaseOrderResource::make($purchaseOrder->load(['supplier', 'requisition', 'items.requisitionItem', 'items.assetCategory', 'items.inventoryItem'])),
            'options' => $options->purchaseOrderOptions(),
            'selectedRequisition' => $purchaseOrder->requisition
                ? PurchaseRequisitionResource::make($purchaseOrder->requisition->load(['department', 'requestedBy', 'items.assetCategory', 'items.inventoryItem', 'items.preferredSupplier']))
                : null,
        ]);
    }

    public function update(PurchaseOrderRequest $request, PurchaseOrder $purchaseOrder, PurchaseOrderService $service): RedirectResponse
    {
        $service->update($purchaseOrder, $request->validated(), $request->user());

        return redirect()->route('procurement.purchase-orders.show', $purchaseOrder)->with('success', 'Purchase order updated successfully.');
    }

    public function issue(PurchaseOrderActionRequest $request, PurchaseOrder $purchaseOrder, PurchaseOrderService $service): RedirectResponse
    {
        $this->authorize('issue', $purchaseOrder);
        $service->issue($purchaseOrder, $request->user(), $request->validated('remarks'));

        return redirect()->route('procurement.purchase-orders.show', $purchaseOrder)->with('success', 'Purchase order issued successfully.');
    }

    public function cancel(PurchaseOrderActionRequest $request, PurchaseOrder $purchaseOrder, PurchaseOrderService $service): RedirectResponse
    {
        $this->authorize('cancel', $purchaseOrder);

        try {
            $service->cancel($purchaseOrder, $request->user(), $request->validated('reason'));
        } catch (\DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('procurement.purchase-orders.show', $purchaseOrder)->with('success', 'Purchase order cancelled.');
    }

    public function close(PurchaseOrderActionRequest $request, PurchaseOrder $purchaseOrder, PurchaseOrderService $service): RedirectResponse
    {
        $this->authorize('close', $purchaseOrder);

        try {
            $service->close($purchaseOrder, $request->user(), $request->validated('remarks'));
        } catch (\DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('procurement.purchase-orders.show', $purchaseOrder)->with('success', 'Purchase order closed.');
    }
}
