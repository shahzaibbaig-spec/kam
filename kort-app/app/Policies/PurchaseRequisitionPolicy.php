<?php

namespace App\Policies;

use App\Enums\PurchaseRequisitionStatus;
use App\Models\PurchaseRequisition;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PurchaseRequisitionPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('requisition.view');
    }

    public function view(User $user, PurchaseRequisition $requisition): bool
    {
        return $user->can('requisition.view');
    }

    public function create(User $user): bool
    {
        return $user->can('requisition.create');
    }

    public function update(User $user, PurchaseRequisition $requisition): bool
    {
        return $user->can('requisition.edit') && $requisition->status === PurchaseRequisitionStatus::Draft;
    }

    public function delete(User $user, PurchaseRequisition $requisition): bool
    {
        return $user->can('requisition.cancel');
    }

    public function submit(User $user, PurchaseRequisition $requisition): bool
    {
        return $user->can('requisition.submit') && $requisition->status === PurchaseRequisitionStatus::Draft;
    }

    public function approve(User $user, PurchaseRequisition $requisition): bool
    {
        return $user->can('requisition.approve');
    }

    public function reject(User $user, PurchaseRequisition $requisition): bool
    {
        return $user->can('requisition.reject');
    }

    public function cancel(User $user, PurchaseRequisition $requisition): bool
    {
        return $user->can('requisition.cancel');
    }
}
