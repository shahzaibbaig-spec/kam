<?php

namespace App\Http\Controllers\Procurement;

use App\Enums\PurchaseRequisitionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\PurchaseRequisitionRequest;
use App\Http\Resources\PurchaseRequisitionResource;
use App\Models\PurchaseRequisition;
use App\Services\ProcurementApprovalService;
use App\Services\ProcurementOptionsService;
use App\Services\PurchaseRequisitionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseRequisitionController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(PurchaseRequisition::class, 'requisition');
    }

    public function index(Request $request, ProcurementOptionsService $options): Response
    {
        $filters = $request->only(['search', 'status', 'requisition_type', 'department_id', 'priority']);

        $requisitions = PurchaseRequisition::query()
            ->with(['department', 'requestedBy'])
            ->withCount('items')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('requisition_number', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%"));
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['requisition_type'] ?? null, fn ($query, string $type) => $query->where('requisition_type', $type))
            ->when($filters['department_id'] ?? null, fn ($query, string $departmentId) => $query->where('department_id', $departmentId))
            ->when($filters['priority'] ?? null, fn ($query, string $priority) => $query->where('priority', $priority))
            ->latest('request_date')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Procurement/Requisitions/Index', [
            'filters' => $filters,
            'requisitions' => PurchaseRequisitionResource::collection($requisitions),
            'filterOptions' => [
                'types' => $options->requisitionOptions()['types'],
                'priorities' => $options->requisitionOptions()['priorities'],
                'statuses' => $options->requisitionOptions()['statuses'],
                'departments' => $options->requisitionOptions()['departments'],
            ],
            'permissions' => [
                'create' => $request->user()?->can('requisition.create') ?? false,
            ],
        ]);
    }

    public function create(ProcurementOptionsService $options): Response
    {
        return Inertia::render('Procurement/Requisitions/Form', [
            'requisition' => null,
            'options' => $options->requisitionOptions(),
            'currentUserId' => request()->user()->id,
        ]);
    }

    public function store(PurchaseRequisitionRequest $request, PurchaseRequisitionService $service): RedirectResponse
    {
        $requisition = $service->create($request->validated(), $request->user());

        return redirect()->route('procurement.requisitions.show', $requisition)->with('success', 'Purchase requisition saved as draft.');
    }

    public function show(PurchaseRequisition $requisition, ProcurementApprovalService $approvals): Response
    {
        $requisition->load([
            'department',
            'requestedBy',
            'rejectedBy',
            'items.assetCategory',
            'items.inventoryItem',
            'items.preferredSupplier',
            'approvals.actedBy',
            'purchaseOrders.supplier',
        ]);

        return Inertia::render('Procurement/Requisitions/Show', [
            'requisition' => PurchaseRequisitionResource::make($requisition),
            'permissions' => [
                'edit' => request()->user()->can('requisition.edit') && $requisition->status === PurchaseRequisitionStatus::Draft,
                'submit' => request()->user()->can('requisition.submit') && $requisition->status === PurchaseRequisitionStatus::Draft,
                'approve' => request()->user()->can('requisition.approve') && in_array($requisition->status->value, [PurchaseRequisitionStatus::Submitted->value, PurchaseRequisitionStatus::UnderReview->value], true),
                'reject' => request()->user()->can('requisition.reject') && in_array($requisition->status->value, [PurchaseRequisitionStatus::Submitted->value, PurchaseRequisitionStatus::UnderReview->value], true),
                'cancel' => request()->user()->can('requisition.cancel') && ! in_array($requisition->status->value, [PurchaseRequisitionStatus::Cancelled->value, PurchaseRequisitionStatus::Rejected->value], true),
                'createPo' => request()->user()->can('purchase-order.create') && in_array($requisition->status->value, [PurchaseRequisitionStatus::Approved->value, PurchaseRequisitionStatus::PartiallyOrdered->value], true),
            ],
            'currentStageLabel' => $approvals->stageLabel($requisition->current_approval_level),
        ]);
    }

    public function edit(PurchaseRequisition $requisition, ProcurementOptionsService $options): Response
    {
        return Inertia::render('Procurement/Requisitions/Form', [
            'requisition' => PurchaseRequisitionResource::make($requisition->load(['department', 'requestedBy', 'items.assetCategory', 'items.inventoryItem', 'items.preferredSupplier'])),
            'options' => $options->requisitionOptions(),
            'currentUserId' => request()->user()->id,
        ]);
    }

    public function update(PurchaseRequisitionRequest $request, PurchaseRequisition $requisition, PurchaseRequisitionService $service): RedirectResponse
    {
        $service->update($requisition, $request->validated(), $request->user());

        return redirect()->route('procurement.requisitions.show', $requisition)->with('success', 'Purchase requisition updated successfully.');
    }

    public function submit(Request $request, PurchaseRequisition $requisition, PurchaseRequisitionService $service, ProcurementApprovalService $approvals): RedirectResponse
    {
        $this->authorize('submit', $requisition);
        $validated = $request->validate(['comments' => ['nullable', 'string', 'max:5000']]);

        try {
            $service->submit($requisition, $request->user(), $validated['comments'] ?? null);
            $approvals->submit($requisition->fresh(), $request->user(), $validated['comments'] ?? null);
        } catch (\DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('procurement.requisitions.show', $requisition)->with('success', 'Purchase requisition submitted for approval.');
    }

    public function cancel(Request $request, PurchaseRequisition $requisition, PurchaseRequisitionService $service): RedirectResponse
    {
        $this->authorize('cancel', $requisition);
        $validated = $request->validate(['reason' => ['nullable', 'string', 'max:5000']]);
        $service->cancel($requisition, $request->user(), $validated['reason'] ?? null);

        return redirect()->route('procurement.requisitions.show', $requisition)->with('success', 'Purchase requisition cancelled.');
    }
}
