<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assignment_type' => $this->assignment_type?->value ?? $this->assignment_type,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'location_id' => $this->location_id,
            'location_name' => $this->location?->name,
            'assigned_user_id' => $this->assigned_user_id,
            'assigned_user_name' => $this->assignedUser?->name,
            'room_or_area' => $this->room_or_area,
            'custodian_name' => $this->custodian_name,
            'issued_by_name' => $this->issuedBy?->name,
            'received_by_name' => $this->receivedBy?->name,
            'assigned_at' => $this->assigned_at?->toDateTimeString(),
            'expected_return_at' => $this->expected_return_at?->toDateTimeString(),
            'returned_at' => $this->returned_at?->toDateTimeString(),
            'status' => $this->status?->value ?? $this->status,
            'remarks' => $this->remarks,
        ];
    }
}
