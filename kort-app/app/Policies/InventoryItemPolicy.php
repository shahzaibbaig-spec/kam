<?php

namespace App\Policies;

use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InventoryItemPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('inventory-item.view');
    }

    public function view(User $user, InventoryItem $item): bool
    {
        return $user->can('inventory-item.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory-item.create');
    }

    public function update(User $user, InventoryItem $item): bool
    {
        return $user->can('inventory-item.edit');
    }

    public function delete(User $user, InventoryItem $item): bool
    {
        return $user->can('inventory-item.delete');
    }

    public function viewLedger(User $user, InventoryItem $item): bool
    {
        return $user->can('inventory-ledger.view');
    }

    public function scan(User $user): bool
    {
        return $user->can('inventory-item.scan');
    }
}
