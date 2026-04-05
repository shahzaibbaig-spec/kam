<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseRequisitionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'requisition_number' => $this->requisition_number,
            'requisition_type' => $this->requisition_type?->value ?? $this->requisition_type,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'requested_by' => $this->requested_by,
            'requested_by_name' => $this->requestedBy?->name,
            'request_date' => $this->request_date?->toDateString(),
            'priority' => $this->priority?->value ?? $this->priority,
            'purpose' => $this->purpose,
            'remarks' => $this->remarks,
            'total_estimated_amount' => $this->total_estimated_amount,
            'status' => $this->status?->value ?? $this->status,
            'current_approval_level' => $this->current_approval_level,
            'final_approved_at' => $this->final_approved_at?->toDateTimeString(),
            'rejected_at' => $this->rejected_at?->toDateTimeString(),
            'rejected_by_name' => $this->rejectedBy?->name,
            'rejection_reason' => $this->rejection_reason,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'item_type' => $item->item_type?->value ?? $item->item_type,
                'asset_category_id' => $item->asset_category_id,
                'asset_category_name' => $item->assetCategory?->name,
                'inventory_item_id' => $item->inventory_item_id,
                'inventory_item_name' => $item->inventoryItem?->item_name,
                'inventory_item_code' => $item->inventoryItem?->item_code,
                'item_description' => $item->item_description,
                'quantity' => $item->quantity,
                'unit_of_measure' => $item->unit_of_measure,
                'estimated_unit_cost' => $item->estimated_unit_cost,
                'estimated_total' => $item->estimated_total,
                'preferred_supplier_id' => $item->preferred_supplier_id,
                'preferred_supplier_name' => $item->preferredSupplier?->supplier_name,
                'needed_by_date' => $item->needed_by_date?->toDateString(),
                'remarks' => $item->remarks,
                'ordered_quantity' => $item->ordered_quantity,
                'received_quantity' => $item->received_quantity,
                'status' => $item->status?->value ?? $item->status,
            ])->values()),
            'approval_history' => $this->whenLoaded('approvals', fn () => $this->approvals->map(fn ($approval) => [
                'id' => $approval->id,
                'approval_level' => $approval->approval_level,
                'action' => $approval->action?->value ?? $approval->action,
                'acted_by_name' => $approval->actedBy?->name,
                'acted_at' => $approval->acted_at?->toDateTimeString(),
                'comments' => $approval->comments,
            ])->values()),
            'purchase_orders' => $this->whenLoaded('purchaseOrders', fn () => $this->purchaseOrders->map(fn ($purchaseOrder) => [
                'id' => $purchaseOrder->id,
                'po_number' => $purchaseOrder->po_number,
                'status' => $purchaseOrder->status?->value ?? $purchaseOrder->status,
                'supplier_name' => $purchaseOrder->supplier?->supplier_name,
                'po_date' => $purchaseOrder->po_date?->toDateString(),
                'total_amount' => $purchaseOrder->total_amount,
            ])->values()),
        ];
    }
}
