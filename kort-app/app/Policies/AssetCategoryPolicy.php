<?php

namespace App\Policies;

use App\Models\AssetCategory;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssetCategoryPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('asset-category.view');
    }

    public function view(User $user, AssetCategory $assetCategory): bool
    {
        return $user->can('asset-category.view');
    }

    public function create(User $user): bool
    {
        return $user->can('asset-category.create');
    }

    public function update(User $user, AssetCategory $assetCategory): bool
    {
        return $user->can('asset-category.edit');
    }

    public function delete(User $user, AssetCategory $assetCategory): bool
    {
        return $user->can('asset-category.delete');
    }
}
