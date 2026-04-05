<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\RequisitionApprovalRequest;
use App\Models\PurchaseRequisition;
use App\Services\ProcurementApprovalService;
use Illuminate\Http\RedirectResponse;

class ProcurementApprovalController extends Controller
{
    public function store(RequisitionApprovalRequest $request, PurchaseRequisition $requisition, ProcurementApprovalService $approvals): RedirectResponse
    {
        if ($request->validated('action') === 'approve') {
            $this->authorize('approve', $requisition);

            try {
                $approvals->approve($requisition, $request->user(), $request->validated('comments'));
            } catch (\DomainException $exception) {
                return back()->with('error', $exception->getMessage());
            }

            return redirect()->route('procurement.requisitions.show', $requisition)->with('success', 'Requisition approved successfully.');
        }

        $this->authorize('reject', $requisition);

        try {
            $approvals->reject($requisition, $request->user(), $request->validated('reason'));
        } catch (\DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('procurement.requisitions.show', $requisition)->with('success', 'Requisition rejected successfully.');
    }
}
