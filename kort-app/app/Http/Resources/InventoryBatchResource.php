<?php

namespace App\Http\Resources;

use App\Enums\InventoryBatchStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryBatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof InventoryBatchStatus ? $this->status->value : $this->status;

        return [
            'id' => $this->id,
            'inventory_item_id' => $this->inventory_item_id,
            'batch_number' => $this->batch_number,
            'lot_number' => $this->lot_number,
            'manufacture_date' => $this->manufacture_date?->toDateString(),
            'expiry_date' => $this->expiry_date?->toDateString(),
            'unit_cost' => $this->unit_cost,
            'received_quantity' => $this->received_quantity,
            'available_quantity' => $this->available_quantity,
            'reserved_quantity' => $this->reserved_quantity,
            'issued_quantity' => $this->issued_quantity,
            'returned_quantity' => $this->returned_quantity,
            'damaged_quantity' => $this->damaged_quantity,
            'quarantined_quantity' => $this->quarantined_quantity,
            'expired_quantity' => $this->expired_quantity,
            'status' => $status,
            'supplier_name' => $this->supplier?->name,
            'store_location_id' => $this->store_location_id,
            'store_location_name' => $this->storeLocation?->name,
            'storage_zone' => $this->storage_zone,
            'notes' => $this->notes,
            'is_expired' => $this->isExpired(),
            'is_issuable' => $this->isIssuable(),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
