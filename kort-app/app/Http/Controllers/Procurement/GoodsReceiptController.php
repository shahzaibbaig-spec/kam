<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\GoodsReceiptRequest;
use App\Http\Resources\GoodsReceiptResource;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Services\GoodsReceiptService;
use App\Services\ProcurementOptionsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoodsReceiptController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(GoodsReceipt::class, 'goodsReceipt');
    }

    public function index(Request $request, ProcurementOptionsService $options): Response
    {
        $filters = $request->only(['search', 'status', 'supplier_id', 'purchase_order_id']);

        $goodsReceipts = GoodsReceipt::query()
            ->with(['supplier', 'purchaseOrder', 'receivedBy'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('grn_number', 'like', "%{$search}%")
                    ->orWhere('invoice_reference', 'like', "%{$search}%")
                    ->orWhere('delivery_note_number', 'like', "%{$search}%"));
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['supplier_id'] ?? null, fn ($query, string $supplierId) => $query->where('supplier_id', $supplierId))
            ->when($filters['purchase_order_id'] ?? null, fn ($query, string $purchaseOrderId) => $query->where('purchase_order_id', $purchaseOrderId))
            ->latest('receipt_date')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Procurement/GoodsReceipts/Index', [
            'filters' => $filters,
            'goodsReceipts' => GoodsReceiptResource::collection($goodsReceipts),
            'filterOptions' => [
                'statuses' => $options->goodsReceiptOptions()['statuses'],
                'suppliers' => $options->goodsReceiptOptions()['suppliers'],
                'purchaseOrders' => collect($options->goodsReceiptOptions()['purchaseOrders'])
                    ->map(fn (PurchaseOrder $purchaseOrder) => [
                        'id' => $purchaseOrder->id,
                        'name' => $purchaseOrder->po_number,
                        'code' => $purchaseOrder->supplier?->supplier_code,
                    ])
                    ->values()
                    ->all(),
            ],
            'permissions' => [
                'create' => $request->user()?->can('goods-receipt.create') ?? false,
            ],
        ]);
    }

    public function create(Request $request, ProcurementOptionsService $options): Response
    {
        $selectedPurchaseOrder = null;

        if ($request->filled('purchase_order')) {
            $selectedPurchaseOrder = PurchaseOrder::query()
                ->with(['supplier', 'items.requisitionItem', 'items.assetCategory', 'items.inventoryItem'])
                ->findOrFail($request->integer('purchase_order'));
        }

        return Inertia::render('Procurement/GoodsReceipts/Form', [
            'goodsReceipt' => null,
            'options' => $options->goodsReceiptOptions(),
            'selectedPurchaseOrder' => $selectedPurchaseOrder ? PurchaseOrderResource::make($selectedPurchaseOrder) : null,
        ]);
    }

    public function store(GoodsReceiptRequest $request, GoodsReceiptService $service): RedirectResponse
    {
        try {
            $goodsReceipt = $service->receive($request->validated(), $request->user());
        } catch (\DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('procurement.goods-receipts.show', $goodsReceipt)->with('success', 'Goods receipt processed successfully.');
    }

    public function show(GoodsReceipt $goodsReceipt): Response
    {
        $goodsReceipt->load([
            'supplier',
            'purchaseOrder.supplier',
            'receivedBy',
            'inspectedBy',
            'items.purchaseOrderItem',
            'items.assetCategory',
            'items.inventoryItem',
            'items.storageLocation',
        ]);

        return Inertia::render('Procurement/GoodsReceipts/Show', [
            'goodsReceipt' => GoodsReceiptResource::make($goodsReceipt),
            'permissions' => [
                'viewPurchaseOrder' => $goodsReceipt->purchaseOrder
                    ? request()->user()?->can('view', $goodsReceipt->purchaseOrder)
                    : false,
            ],
        ]);
    }
}
