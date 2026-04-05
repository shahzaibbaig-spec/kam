<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'po_number' => $this->po_number,
            'purchase_requisition_id' => $this->purchase_requisition_id,
            'requisition_number' => $this->requisition?->requisition_number,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier?->supplier_name,
            'po_date' => $this->po_date?->toDateString(),
            'expected_delivery_date' => $this->expected_delivery_date?->toDateString(),
            'currency' => $this->currency,
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'discount_amount' => $this->discount_amount,
            'total_amount' => $this->total_amount,
            'payment_terms' => $this->payment_terms,
            'remarks' => $this->remarks,
            'status' => $this->status?->value ?? $this->status,
            'approved_by_name' => $this->approvedBy?->name,
            'approved_at' => $this->approved_at?->toDateTimeString(),
            'issued_by_name' => $this->issuedBy?->name,
            'issued_at' => $this->issued_at?->toDateTimeString(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'purchase_requisition_item_id' => $item->purchase_requisition_item_id,
                'requisition_item_description' => $item->requisitionItem?->item_description,
                'item_type' => $item->item_type?->value ?? $item->item_type,
                'asset_category_id' => $item->asset_category_id,
                'asset_category_name' => $item->assetCategory?->name,
                'inventory_item_id' => $item->inventory_item_id,
                'inventory_item_name' => $item->inventoryItem?->item_name,
                'inventory_item_code' => $item->inventoryItem?->item_code,
                'item_description' => $item->item_description,
                'quantity_ordered' => $item->quantity_ordered,
                'quantity_received' => $item->quantity_received,
                'unit_of_measure' => $item->unit_of_measure,
                'unit_price' => $item->unit_price,
                'line_total' => $item->line_total,
                'remarks' => $item->remarks,
                'status' => $item->status?->value ?? $item->status,
                'remaining_quantity' => $item->remainingQuantity(),
            ])->values()),
            'goods_receipts' => $this->whenLoaded('goodsReceipts', fn () => $this->goodsReceipts->map(fn ($goodsReceipt) => [
                'id' => $goodsReceipt->id,
                'grn_number' => $goodsReceipt->grn_number,
                'status' => $goodsReceipt->status?->value ?? $goodsReceipt->status,
                'receipt_date' => $goodsReceipt->receipt_date?->toDateString(),
            ])->values()),
        ];
    }
}
