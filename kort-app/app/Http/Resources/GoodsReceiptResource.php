<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoodsReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'grn_number' => $this->grn_number,
            'purchase_order_id' => $this->purchase_order_id,
            'purchase_order_number' => $this->purchaseOrder?->po_number,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier?->supplier_name,
            'receipt_date' => $this->receipt_date?->toDateString(),
            'invoice_reference' => $this->invoice_reference,
            'delivery_note_number' => $this->delivery_note_number,
            'received_by_name' => $this->receivedBy?->name,
            'inspected_by_name' => $this->inspectedBy?->name,
            'remarks' => $this->remarks,
            'status' => $this->status?->value ?? $this->status,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'purchase_order_item_id' => $item->purchase_order_item_id,
                'item_type' => $item->item_type?->value ?? $item->item_type,
                'asset_category_name' => $item->assetCategory?->name,
                'inventory_item_name' => $item->inventoryItem?->item_name,
                'item_description' => $item->item_description,
                'quantity_received' => $item->quantity_received,
                'quantity_accepted' => $item->quantity_accepted,
                'quantity_rejected' => $item->quantity_rejected,
                'rejection_reason' => $item->rejection_reason,
                'batch_number' => $item->batch_number,
                'manufacture_date' => $item->manufacture_date?->toDateString(),
                'expiry_date' => $item->expiry_date?->toDateString(),
                'serial_number' => $item->serial_number,
                'unit_cost' => $item->unit_cost,
                'storage_location_name' => $item->storageLocation?->name,
                'room_or_area' => $item->room_or_area,
                'remarks' => $item->remarks,
                'has_discrepancy' => $item->hasDiscrepancy(),
            ])->values()),
        ];
    }
}
