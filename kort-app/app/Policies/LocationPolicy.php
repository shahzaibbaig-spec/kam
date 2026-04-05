<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class LocationPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('locations.view');
    }

    public function view(User $user, Location $location): bool
    {
        return $user->can('locations.view');
    }

    public function create(User $user): bool
    {
        return $user->can('locations.create');
    }

    public function update(User $user, Location $location): bool
    {
        return $user->can('locations.update');
    }

    public function delete(User $user, Location $location): bool
    {
        return $user->can('locations.delete');
    }
}
