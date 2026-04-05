<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssetPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('asset.view');
    }

    public function view(User $user, Asset $asset): bool
    {
        return $user->can('asset.view');
    }

    public function create(User $user): bool
    {
        return $user->can('asset.create');
    }

    public function update(User $user, Asset $asset): bool
    {
        return $user->can('asset.edit');
    }

    public function delete(User $user, Asset $asset): bool
    {
        return $user->can('asset.delete');
    }

    public function generateTag(User $user, Asset $asset): bool
    {
        return $user->can('asset-tag.generate');
    }

    public function regenerateTag(User $user, Asset $asset): bool
    {
        return $user->can('asset-tag.regenerate');
    }

    public function printTag(User $user, Asset $asset): bool
    {
        return $user->can('asset-tag.print');
    }

    public function viewTag(User $user, Asset $asset): bool
    {
        return $user->can('asset-tag.view');
    }

    public function issue(User $user, Asset $asset): bool
    {
        return $user->can('asset-issue.create');
    }

    public function returnAsset(User $user, Asset $asset): bool
    {
        return $user->can('asset-return.create');
    }

    public function transfer(User $user, Asset $asset): bool
    {
        return $user->can('asset-transfer.create');
    }

    public function viewHistory(User $user, Asset $asset): bool
    {
        return $user->can('asset-history.view');
    }

    public function changeStatus(User $user, Asset $asset): bool
    {
        return $user->can('asset-status.change');
    }
}
