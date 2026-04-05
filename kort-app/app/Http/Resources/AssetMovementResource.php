<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'movement_type' => $this->movement_type?->value ?? $this->movement_type,
            'from_department' => $this->fromDepartment?->name,
            'to_department' => $this->toDepartment?->name,
            'from_location' => $this->fromLocation?->name,
            'to_location' => $this->toLocation?->name,
            'from_user' => $this->fromUser?->name,
            'to_user' => $this->toUser?->name,
            'from_room_or_area' => $this->from_room_or_area,
            'to_room_or_area' => $this->to_room_or_area,
            'movement_datetime' => $this->movement_datetime?->toDateTimeString(),
            'performed_by' => $this->performedBy?->name,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'notes' => $this->notes,
        ];
    }
}
