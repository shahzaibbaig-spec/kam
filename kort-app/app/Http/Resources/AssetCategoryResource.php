<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'parent_id' => $this->parent_id,
            'parent_name' => $this->parent?->name,
            'is_active' => $this->is_active,
            'assets_count' => $this->whenCounted('assets'),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
