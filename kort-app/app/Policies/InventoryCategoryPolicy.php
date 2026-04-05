<?php

namespace App\Policies;

use App\Models\InventoryCategory;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InventoryCategoryPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('inventory-category.view');
    }

    public function view(User $user, InventoryCategory $category): bool
    {
        return $user->can('inventory-category.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory-category.create');
    }

    public function update(User $user, InventoryCategory $category): bool
    {
        return $user->can('inventory-category.edit');
    }

    public function delete(User $user, InventoryCategory $category): bool
    {
        return $user->can('inventory-category.delete');
    }
}
