<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'supplier_code' => $this->supplier_code,
            'supplier_name' => $this->supplier_name,
            'supplier_type' => $this->supplier_type,
            'contact_person' => $this->contact_person,
            'phone' => $this->phone,
            'alternate_phone' => $this->alternate_phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'tax_number' => $this->tax_number,
            'registration_number' => $this->registration_number,
            'payment_terms' => $this->payment_terms,
            'lead_time_days' => $this->lead_time_days,
            'is_active' => $this->is_active,
            'notes' => $this->notes,
            'purchase_orders_count' => $this->whenCounted('purchaseOrders'),
            'goods_receipts_count' => $this->whenCounted('goodsReceipts'),
            'requisition_items_count' => $this->whenCounted('purchaseRequisitionItems'),
            'recent_purchase_orders' => $this->whenLoaded('purchaseOrders', fn () => $this->purchaseOrders->map(fn ($purchaseOrder) => [
                'id' => $purchaseOrder->id,
                'po_number' => $purchaseOrder->po_number,
                'status' => $purchaseOrder->status?->value ?? $purchaseOrder->status,
                'po_date' => $purchaseOrder->po_date?->toDateString(),
                'total_amount' => $purchaseOrder->total_amount,
            ])->values()),
            'recent_goods_receipts' => $this->whenLoaded('goodsReceipts', fn () => $this->goodsReceipts->map(fn ($goodsReceipt) => [
                'id' => $goodsReceipt->id,
                'grn_number' => $goodsReceipt->grn_number,
                'status' => $goodsReceipt->status?->value ?? $goodsReceipt->status,
                'receipt_date' => $goodsReceipt->receipt_date?->toDateString(),
            ])->values()),
            'recent_requisitions' => $this->whenLoaded('purchaseRequisitionItems', fn () => $this->purchaseRequisitionItems
                ->map(fn ($item) => $item->purchaseRequisition)
                ->filter()
                ->unique('id')
                ->take(5)
                ->map(fn ($requisition) => [
                    'id' => $requisition->id,
                    'requisition_number' => $requisition->requisition_number,
                    'status' => $requisition->status?->value ?? $requisition->status,
                    'request_date' => $requisition->request_date?->toDateString(),
                    'department_name' => $requisition->department?->name,
                ])
                ->values()),
        ];
    }
}
