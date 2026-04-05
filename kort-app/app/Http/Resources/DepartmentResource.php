<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'type' => $this->type,
            'cost_center' => $this->cost_center,
            'description' => $this->description,
            'phone' => $this->phone,
            'email' => $this->email,
            'manager_user_id' => $this->manager_user_id,
            'manager_name' => $this->manager?->name,
            'is_active' => $this->is_active,
            'is_clinical' => $this->is_clinical,
            'users_count' => $this->whenCounted('users'),
            'locations_count' => $this->whenCounted('locations'),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
