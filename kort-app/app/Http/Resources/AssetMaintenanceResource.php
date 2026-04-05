<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetMaintenanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'ticket_number' => $this->ticket_number,
            'maintenance_type' => $this->maintenance_type,
            'status' => $this->status,
            'fault_report' => $this->fault_report,
            'started_at' => $this->started_at?->toDateTimeString(),
            'completed_at' => $this->completed_at?->toDateTimeString(),
            'downtime_minutes' => $this->downtime_minutes,
            'cost' => $this->cost,
            'spare_parts_used' => collect($this->spare_parts_used ?? [])->filter()->values()->all(),
            'resolution_notes' => $this->resolution_notes,
            'fit_status' => $this->fit_status,
            'warranty_claim' => $this->warranty_claim,
            'reported_by_id' => $this->reported_by_id,
            'reported_by_name' => $this->reportedBy?->name,
            'engineer_id' => $this->engineer_id,
            'engineer_name' => $this->engineer?->name,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier?->supplier_name,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'asset_name' => $this->asset?->asset_name,
            'asset_code' => $this->asset?->asset_code,
            'asset_serial_number' => $this->asset?->serial_number,
            'department_name' => $this->asset?->department?->name,
            'location_name' => $this->asset?->location?->name,
            'asset' => $this->whenLoaded('asset', fn () => [
                'id' => $this->asset?->id,
                'asset_name' => $this->asset?->asset_name,
                'asset_code' => $this->asset?->asset_code,
                'serial_number' => $this->asset?->serial_number,
                'tag_number' => $this->asset?->tag_number,
                'brand' => $this->asset?->brand,
                'model' => $this->asset?->model,
                'department_name' => $this->asset?->department?->name,
                'location_name' => $this->asset?->location?->name,
                'room_or_area' => $this->asset?->room_or_area,
                'assigned_user_name' => $this->asset?->assignedUser?->name,
                'supplier_name' => $this->asset?->supplier?->supplier_name,
                'status' => $this->asset?->asset_status?->value ?? $this->asset?->asset_status,
                'condition_status' => $this->asset?->condition_status?->value ?? $this->asset?->condition_status,
                'last_issued_at' => $this->asset?->last_issued_at?->toDateTimeString(),
                'last_returned_at' => $this->asset?->last_returned_at?->toDateTimeString(),
            ]),
            'recent_history' => $this->whenLoaded('asset', fn () => $this->asset?->maintenances
                ?->where('id', '!=', $this->id)
                ->take(6)
                ->map(fn ($maintenance) => [
                    'id' => $maintenance->id,
                    'ticket_number' => $maintenance->ticket_number,
                    'status' => $maintenance->status,
                    'maintenance_type' => $maintenance->maintenance_type,
                    'completed_at' => $maintenance->completed_at?->toDateTimeString(),
                    'created_at' => $maintenance->created_at?->toDateTimeString(),
                    'engineer_name' => $maintenance->engineer?->name,
                ])
                ->values()
                ->all()),
            'next_calibration' => $this->whenLoaded('asset', function () {
                $calibration = $this->asset?->calibrations
                    ?->where('status', '!=', 'completed')
                    ->sortBy('due_at')
                    ->first();

                if (! $calibration) {
                    return null;
                }

                return [
                    'id' => $calibration->id,
                    'status' => $calibration->status,
                    'due_at' => $calibration->due_at?->toDateTimeString(),
                    'performed_at' => $calibration->performed_at?->toDateTimeString(),
                    'certificate_number' => $calibration->certificate_number,
                ];
            }),
        ];
    }
}
