<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetTagResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tag_number' => $this->tag_number,
            'tag_format' => $this->tag_format,
            'barcode_value' => $this->barcode_value,
            'qr_value' => $this->qr_value,
            'printed_count' => $this->printed_count,
            'last_printed_at' => $this->last_printed_at?->toDateTimeString(),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
