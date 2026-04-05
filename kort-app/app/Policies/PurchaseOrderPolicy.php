<?php

namespace App\Policies;

use App\Enums\PurchaseOrderStatus;
use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PurchaseOrderPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('purchase-order.view');
    }

    public function view(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->can('purchase-order.view');
    }

    public function create(User $user): bool
    {
        return $user->can('purchase-order.create');
    }

    public function update(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->can('purchase-order.edit') && $purchaseOrder->status === PurchaseOrderStatus::Draft;
    }

    public function delete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->can('purchase-order.cancel');
    }

    public function issue(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->can('purchase-order.issue');
    }

    public function cancel(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->can('purchase-order.cancel');
    }

    public function close(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->can('purchase-order.close');
    }
}
