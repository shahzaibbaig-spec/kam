<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetStatusLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'old_status' => $this->old_status,
            'new_status' => $this->new_status,
            'old_condition' => $this->old_condition,
            'new_condition' => $this->new_condition,
            'changed_by' => $this->changedBy?->name,
            'changed_at' => $this->changed_at?->toDateTimeString(),
            'reason' => $this->reason,
        ];
    }
}
