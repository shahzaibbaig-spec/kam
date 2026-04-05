<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\User;
use Illuminate\Support\Carbon;

class AssetMovementService
{
    public function record(Asset $asset, User $actor, array $attributes): AssetMovement
    {
        return $asset->movements()->create([
            'movement_type' => $attributes['movement_type'],
            'from_department_id' => $attributes['from_department_id'] ?? null,
            'to_department_id' => $attributes['to_department_id'] ?? null,
            'from_location_id' => $attributes['from_location_id'] ?? null,
            'to_location_id' => $attributes['to_location_id'] ?? null,
            'from_user_id' => $attributes['from_user_id'] ?? null,
            'to_user_id' => $attributes['to_user_id'] ?? null,
            'from_room_or_area' => $attributes['from_room_or_area'] ?? null,
            'to_room_or_area' => $attributes['to_room_or_area'] ?? null,
            'movement_datetime' => $attributes['movement_datetime'] ?? Carbon::now(),
            'performed_by' => $actor->id,
            'reference_type' => $attributes['reference_type'] ?? null,
            'reference_id' => $attributes['reference_id'] ?? null,
            'notes' => $attributes['notes'] ?? null,
        ]);
    }
}
