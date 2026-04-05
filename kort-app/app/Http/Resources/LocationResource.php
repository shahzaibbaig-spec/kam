<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'parent_id' => $this->parent_id,
            'parent_name' => $this->parent?->name,
            'name' => $this->name,
            'code' => $this->code,
            'building' => $this->building,
            'floor' => $this->floor,
            'room' => $this->room,
            'storage_type' => $this->storage_type,
            'description' => $this->description,
            'barcode' => $this->barcode,
            'is_active' => $this->is_active,
            'is_isolation' => $this->is_isolation,
            'is_emergency_reserve' => $this->is_emergency_reserve,
            'is_sterile_storage' => $this->is_sterile_storage,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
