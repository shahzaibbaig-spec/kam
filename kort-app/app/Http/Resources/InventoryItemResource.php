<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $nearExpiryCutoff = now()->addDays((int) config('kort.inventory_near_expiry_days', 60));
        $batches = $this->whenLoaded('batches');
        $nearExpiryCount = $this->relationLoaded('batches')
            ? $this->batches->filter(fn ($batch) => $batch->expiry_date && $batch->expiry_date->between(now(), $nearExpiryCutoff))->count()
            : null;

        return [
            'id' => $this->id,
            'item_uuid' => $this->item_uuid,
            'item_name' => $this->item_name,
            'item_code' => $this->item_code,
            'inventory_category_id' => $this->inventory_category_id,
            'category_name' => $this->category?->name,
            'category_code' => $this->category?->code,
            'subcategory' => $this->subcategory,
            'barcode_value' => $this->barcode_value,
            'sku' => $this->sku,
            'unit_of_measure' => $this->unit_of_measure,
            'pack_size' => $this->pack_size,
            'reorder_level' => $this->reorder_level,
            'minimum_level' => $this->minimum_level,
            'maximum_level' => $this->maximum_level,
            'current_quantity' => $this->current_quantity,
            'reserved_quantity' => $this->reserved_quantity,
            'issued_quantity' => $this->issued_quantity,
            'damaged_quantity' => $this->damaged_quantity,
            'quarantined_quantity' => $this->quarantined_quantity,
            'expired_quantity' => $this->expired_quantity,
            'available_balance' => $this->availableBalance(),
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier?->name,
            'store_location_id' => $this->store_location_id,
            'store_location_name' => $this->storeLocation?->name,
            'storage_zone' => $this->storage_zone,
            'temperature_sensitive' => (bool) $this->temperature_sensitive,
            'sterile_item' => (bool) $this->sterile_item,
            'high_risk_item' => (bool) $this->high_risk_item,
            'controlled_use' => (bool) $this->controlled_use,
            'is_active' => (bool) $this->is_active,
            'notes' => $this->notes,
            'is_low_stock' => $this->isLowStock(),
            'near_expiry_batch_count' => $nearExpiryCount,
            'batches' => $this->whenLoaded('batches', fn () => InventoryBatchResource::collection($batches)),
            'transactions' => $this->whenLoaded('transactions', fn () => InventoryTransactionResource::collection($this->transactions)),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
