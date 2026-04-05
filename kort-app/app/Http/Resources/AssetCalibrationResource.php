<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetCalibrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'asset_name' => $this->asset?->asset_name,
            'asset_code' => $this->asset?->asset_code,
            'serial_number' => $this->asset?->serial_number,
            'department_name' => $this->asset?->department?->name,
            'location_name' => $this->asset?->location?->name,
            'performed_by_id' => $this->performed_by_id,
            'performed_by_name' => $this->performedBy?->name,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier?->supplier_name,
            'certificate_number' => $this->certificate_number,
            'performed_at' => $this->performed_at?->toDateTimeString(),
            'due_at' => $this->due_at?->toDateTimeString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
