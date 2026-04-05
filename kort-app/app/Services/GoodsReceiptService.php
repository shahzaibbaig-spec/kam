<?php

namespace App\Services;

use App\Enums\GoodsReceiptStatus;
use App\Enums\ProcurementItemType;
use App\Enums\PurchaseOrderItemStatus;
use App\Enums\PurchaseOrderStatus;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class GoodsReceiptService
{
    public function __construct(
        protected GoodsReceiptNumberService $numbers,
        protected ProcurementIntegrationService $integration,
        protected PurchaseOrderService $purchaseOrders,
    ) {
    }

    public function receive(array $payload, User $actor): GoodsReceipt
    {
        return DB::transaction(function () use ($payload, $actor) {
            $purchaseOrder = PurchaseOrder::query()
                ->with(['supplier', 'items.requisitionItem'])
                ->findOrFail($payload['purchase_order_id']);

            if (! in_array($purchaseOrder->status->value, [
                PurchaseOrderStatus::Issued->value,
                PurchaseOrderStatus::PartiallyReceived->value,
            ], true)) {
                throw new \DomainException('Goods can only be received against issued or partially received purchase orders.');
            }

            $goodsReceipt = GoodsReceipt::query()->create([
                'grn_number' => $this->numbers->generate($payload['receipt_date']),
                'purchase_order_id' => $purchaseOrder->id,
                'supplier_id' => $payload['supplier_id'] ?? $purchaseOrder->supplier_id,
                'receipt_date' => $payload['receipt_date'],
                'invoice_reference' => $payload['invoice_reference'] ?? null,
                'delivery_note_number' => $payload['delivery_note_number'] ?? null,
                'received_by' => $payload['received_by'] ?? $actor->id,
                'inspected_by' => $payload['inspected_by'] ?? null,
                'remarks' => $payload['remarks'] ?? null,
                'status' => GoodsReceiptStatus::Received->value,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            $flagged = false;

            foreach ($payload['items'] as $line) {
                /** @var PurchaseOrderItem|null $purchaseOrderItem */
                $purchaseOrderItem = $purchaseOrder->items->firstWhere('id', (int) $line['purchase_order_item_id']);

                if (! $purchaseOrderItem) {
                    throw new \DomainException('One or more goods receipt lines do not belong to the selected purchase order.');
                }

                if ($purchaseOrderItem->status === PurchaseOrderItemStatus::Cancelled) {
                    throw new \DomainException('Cancelled purchase order lines cannot be received.');
                }

                $remainingQuantity = (float) $purchaseOrderItem->quantity_ordered - (float) $purchaseOrderItem->quantity_received;

                if ((float) $line['quantity_received'] > $remainingQuantity) {
                    throw new \DomainException('Received quantity exceeds the remaining open quantity for one or more purchase order lines.');
                }

                $receiptItem = $goodsReceipt->items()->create([
                    'purchase_order_item_id' => $purchaseOrderItem->id,
                    'item_type' => $line['item_type'],
                    'asset_category_id' => $line['asset_category_id'] ?? $purchaseOrderItem->asset_category_id,
                    'inventory_item_id' => $line['inventory_item_id'] ?? $purchaseOrderItem->inventory_item_id,
                    'item_description' => $line['item_description'] ?? $purchaseOrderItem->item_description,
                    'quantity_received' => $line['quantity_received'],
                    'quantity_accepted' => $line['quantity_accepted'],
                    'quantity_rejected' => $line['quantity_rejected'] ?? 0,
                    'rejection_reason' => $line['rejection_reason'] ?? null,
                    'batch_number' => $line['batch_number'] ?? null,
                    'manufacture_date' => $line['manufacture_date'] ?? null,
                    'expiry_date' => $line['expiry_date'] ?? null,
                    'serial_number' => $line['serial_number'] ?? null,
                    'unit_cost' => $line['unit_cost'] ?? $purchaseOrderItem->unit_price,
                    'storage_location_id' => $line['storage_location_id'] ?? null,
                    'room_or_area' => $line['room_or_area'] ?? null,
                    'remarks' => $line['remarks'] ?? null,
                ]);

                if ($receiptItem->hasDiscrepancy()) {
                    $flagged = true;
                }

                if ((float) $receiptItem->quantity_accepted > 0) {
                    if ($receiptItem->item_type === ProcurementItemType::Inventory) {
                        $this->integration->receiveInventoryLine($goodsReceipt, $receiptItem->load('inventoryItem'), $actor);
                    } else {
                        $this->integration->receiveAssetLine($goodsReceipt, $receiptItem, $purchaseOrder->supplier, $actor);
                    }
                }

                $purchaseOrderItem->forceFill([
                    'quantity_received' => (float) $purchaseOrderItem->quantity_received + (float) $receiptItem->quantity_accepted,
                ])->save();
            }

            $this->purchaseOrders->refreshAfterReceipt($purchaseOrder->fresh('items'));

            $goodsReceipt->forceFill([
                'status' => $flagged ? GoodsReceiptStatus::Flagged->value : GoodsReceiptStatus::Completed->value,
                'updated_by' => $actor->id,
            ])->save();

            activity('procurement')
                ->performedOn($goodsReceipt)
                ->causedBy($actor)
                ->event('goods-receipt-processed')
                ->withProperties([
                    'purchase_order_id' => $purchaseOrder->id,
                    'flagged' => $flagged,
                ])
                ->log('Goods receipt processed');

            return $goodsReceipt->load([
                'supplier',
                'purchaseOrder.supplier',
                'purchaseOrder.items',
                'receivedBy',
                'inspectedBy',
                'items.purchaseOrderItem',
                'items.assetCategory',
                'items.inventoryItem',
                'items.storageLocation',
            ]);
        });
    }
}
