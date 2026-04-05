<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'default_location_id' => $this->default_location_id,
            'default_location_name' => $this->defaultLocation?->name,
            'name' => $this->name,
            'email' => $this->email,
            'employee_id' => $this->employee_id,
            'phone' => $this->phone,
            'designation' => $this->designation,
            'status' => $this->status?->value ?? $this->status,
            'two_factor_required' => $this->two_factor_required,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()),
            'permissions' => $this->whenLoaded('permissions', fn () => $this->permissions->pluck('name')->values()),
            'last_login_at' => $this->last_login_at?->toDateTimeString(),
        ];
    }
}
