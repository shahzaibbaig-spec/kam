<?php

namespace App\Http\Resources;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->asset_status instanceof AssetStatus ? $this->asset_status->value : $this->asset_status;
        $condition = $this->condition_status instanceof AssetConditionStatus ? $this->condition_status->value : $this->condition_status;

        return [
            'id' => $this->id,
            'asset_uuid' => $this->asset_uuid,
            'asset_name' => $this->asset_name,
            'asset_code' => $this->asset_code,
            'asset_category_id' => $this->asset_category_id,
            'category_name' => $this->category?->name,
            'category_code' => $this->category?->code,
            'tag_number' => $this->tag_number,
            'barcode_value' => $this->barcode_value,
            'qr_value' => $this->qr_value,
            'brand' => $this->brand,
            'model' => $this->model,
            'serial_number' => $this->serial_number,
            'manufacturer' => $this->manufacturer,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier?->name,
            'purchase_date' => $this->purchase_date?->toDateString(),
            'warranty_start' => $this->warranty_start?->toDateString(),
            'warranty_end' => $this->warranty_end?->toDateString(),
            'purchase_cost' => $this->purchase_cost,
            'depreciation_method' => $this->depreciation_method,
            'useful_life_years' => $this->useful_life_years,
            'residual_value' => $this->residual_value,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'location_id' => $this->location_id,
            'location_name' => $this->location?->name,
            'room_or_area' => $this->room_or_area,
            'assigned_user_id' => $this->assigned_user_id,
            'assigned_user_name' => $this->assignedUser?->name,
            'assigned_department_id' => $this->assigned_department_id,
            'assigned_department_name' => $this->assignedDepartment?->name,
            'assigned_location_id' => $this->assigned_location_id,
            'assigned_location_name' => $this->assignedLocation?->name,
            'custodian_name' => $this->custodian_name,
            'condition_status' => $condition,
            'asset_status' => $status,
            'notes' => $this->notes,
            'image_path' => $this->image_path,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'last_issued_at' => $this->last_issued_at?->toDateTimeString(),
            'last_returned_at' => $this->last_returned_at?->toDateTimeString(),
            'tag_generated' => filled($this->tag_number),
            'active_tag' => $this->whenLoaded('activeTag', fn () => AssetTagResource::make($this->activeTag)),
            'assignment_history' => $this->whenLoaded('assignments', fn () => AssetAssignmentResource::collection($this->assignments)),
            'movement_history' => $this->whenLoaded('movements', fn () => AssetMovementResource::collection($this->movements)),
            'status_history' => $this->whenLoaded('statusLogs', fn () => AssetStatusLogResource::collection($this->statusLogs)),
            'active_assignment' => $this->whenLoaded('activeAssignment', fn () => AssetAssignmentResource::make($this->activeAssignment)),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
