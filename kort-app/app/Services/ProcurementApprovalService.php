<?php

namespace App\Services;

use App\Enums\ProcurementApprovalAction;
use App\Enums\PurchaseRequisitionItemStatus;
use App\Enums\PurchaseRequisitionStatus;
use App\Models\PurchaseRequisition;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProcurementApprovalService
{
    public function submit(PurchaseRequisition $requisition, User $actor, ?string $comments = null): void
    {
        $this->record($requisition, 1, ProcurementApprovalAction::Submitted, $actor, $comments);
    }

    public function approve(PurchaseRequisition $requisition, User $actor, ?string $comments = null): PurchaseRequisition
    {
        return DB::transaction(function () use ($requisition, $actor, $comments) {
            $level = $requisition->current_approval_level ?? 1;

            if (! $this->canApproveLevel($actor, $level)) {
                throw new \DomainException('You are not authorized to approve this requisition at the current approval stage.');
            }

            $this->record($requisition, $level, ProcurementApprovalAction::Approved, $actor, $comments);

            if ($level >= $this->requiredLevels($requisition)) {
                $requisition->forceFill([
                    'status' => PurchaseRequisitionStatus::Approved->value,
                    'current_approval_level' => null,
                    'final_approved_at' => now(),
                    'updated_by' => $actor->id,
                ])->save();

                $requisition->items()
                    ->where('status', PurchaseRequisitionItemStatus::Pending->value)
                    ->update(['status' => PurchaseRequisitionItemStatus::Approved->value]);
            } else {
                $requisition->forceFill([
                    'status' => PurchaseRequisitionStatus::UnderReview->value,
                    'current_approval_level' => $level + 1,
                    'updated_by' => $actor->id,
                ])->save();
            }

            activity('procurement')
                ->performedOn($requisition)
                ->causedBy($actor)
                ->event('requisition-approved')
                ->withProperties(['level' => $level, 'comments' => $comments])
                ->log('Purchase requisition approved');

            return $requisition->fresh();
        });
    }

    public function reject(PurchaseRequisition $requisition, User $actor, string $reason): PurchaseRequisition
    {
        return DB::transaction(function () use ($requisition, $actor, $reason) {
            $level = $requisition->current_approval_level ?? 1;

            if (! $this->canApproveLevel($actor, $level)) {
                throw new \DomainException('You are not authorized to reject this requisition at the current approval stage.');
            }

            $this->record($requisition, $level, ProcurementApprovalAction::Rejected, $actor, $reason);

            $requisition->forceFill([
                'status' => PurchaseRequisitionStatus::Rejected->value,
                'current_approval_level' => null,
                'rejected_at' => now(),
                'rejected_by' => $actor->id,
                'rejection_reason' => $reason,
                'updated_by' => $actor->id,
            ])->save();

            activity('procurement')
                ->performedOn($requisition)
                ->causedBy($actor)
                ->event('requisition-rejected')
                ->withProperties(['level' => $level, 'reason' => $reason])
                ->log('Purchase requisition rejected');

            return $requisition->fresh();
        });
    }

    public function requiredLevels(PurchaseRequisition $requisition): int
    {
        return $requisition->requiresHospitalAdminApproval() ? 2 : 1;
    }

    public function stageLabel(?int $level): ?string
    {
        return match ($level) {
            1 => 'Department Head Approval',
            2 => 'Hospital Admin Approval',
            default => null,
        };
    }

    protected function canApproveLevel(User $actor, int $level): bool
    {
        if ($actor->hasRole('Super Admin')) {
            return true;
        }

        return match ($level) {
            1 => $actor->hasRole('Burn Center Manager / Department Head') || $actor->hasRole('Hospital Admin'),
            2 => $actor->hasRole('Hospital Admin'),
            default => false,
        };
    }

    protected function record(PurchaseRequisition $requisition, int $level, ProcurementApprovalAction $action, User $actor, ?string $comments = null): void
    {
        $requisition->approvals()->create([
            'approval_level' => $level,
            'action' => $action->value,
            'acted_by' => $actor->id,
            'acted_at' => now(),
            'comments' => $comments,
        ]);
    }
}
