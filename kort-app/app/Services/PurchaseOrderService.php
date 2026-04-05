<?php

namespace App\Services;

use App\Enums\PurchaseOrderItemStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\PurchaseRequisitionItemStatus;
use App\Enums\PurchaseRequisitionStatus;
use App\Models\AssetCategory;
use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseRequisition;
use App\Models\PurchaseRequisitionItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PurchaseOrderService
{
    public function __construct(
        protected PurchaseOrderNumberService $numbers,
    ) {
    }

    public function create(array $payload, User $actor): PurchaseOrder
    {
        return DB::transaction(function () use ($payload, $actor) {
            $purchaseOrder = PurchaseOrder::query()->create([
                'po_number' => $this->numbers->generate($payload['po_date']),
                'purchase_requisition_id' => $payload['purchase_requisition_id'] ?? null,
                'supplier_id' => $payload['supplier_id'],
                'po_date' => $payload['po_date'],
                'expected_delivery_date' => $payload['expected_delivery_date'] ?? null,
                'currency' => $payload['currency'] ?? config('kort.procurement_currency', 'PKR'),
                'payment_terms' => $payload['payment_terms'] ?? null,
                'remarks' => $payload['remarks'] ?? null,
                'tax_amount' => $payload['tax_amount'] ?? 0,
                'discount_amount' => $payload['discount_amount'] ?? 0,
                'status' => PurchaseOrderStatus::Draft->value,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            $this->syncItems($purchaseOrder, $payload['items']);
            $this->refreshTotals($purchaseOrder, $actor);
            $this->refreshLinkedRequisitionProgress($purchaseOrder);

            activity('procurement')
                ->performedOn($purchaseOrder)
                ->causedBy($actor)
                ->event('purchase-order-created')
                ->log('Purchase order created');

            return $purchaseOrder->load(['supplier', 'requisition', 'items.requisitionItem', 'items.assetCategory', 'items.inventoryItem']);
        });
    }

    public function update(PurchaseOrder $purchaseOrder, array $payload, User $actor): PurchaseOrder
    {
        return DB::transaction(function () use ($purchaseOrder, $payload, $actor) {
            $linkedItemIds = $purchaseOrder->items()->pluck('purchase_requisition_item_id')->filter()->values()->all();

            $purchaseOrder->update([
                'purchase_requisition_id' => $payload['purchase_requisition_id'] ?? null,
                'supplier_id' => $payload['supplier_id'],
                'po_date' => $payload['po_date'],
                'expected_delivery_date' => $payload['expected_delivery_date'] ?? null,
                'currency' => $payload['currency'] ?? $purchaseOrder->currency,
                'payment_terms' => $payload['payment_terms'] ?? null,
                'remarks' => $payload['remarks'] ?? null,
                'tax_amount' => $payload['tax_amount'] ?? 0,
                'discount_amount' => $payload['discount_amount'] ?? 0,
                'updated_by' => $actor->id,
            ]);

            $purchaseOrder->items()->delete();
            $this->syncItems($purchaseOrder, $payload['items']);
            $this->refreshTotals($purchaseOrder, $actor);
            $this->refreshLinkedRequisitionProgress($purchaseOrder, $linkedItemIds);

            activity('procurement')
                ->performedOn($purchaseOrder)
                ->causedBy($actor)
                ->event('purchase-order-updated')
                ->log('Purchase order updated');

            return $purchaseOrder->load(['supplier', 'requisition', 'items.requisitionItem', 'items.assetCategory', 'items.inventoryItem']);
        });
    }

    public function issue(PurchaseOrder $purchaseOrder, User $actor, ?string $remarks = null): PurchaseOrder
    {
        $purchaseOrder->forceFill([
            'status' => PurchaseOrderStatus::Issued->value,
            'approved_by' => $actor->id,
            'approved_at' => now(),
            'issued_by' => $actor->id,
            'issued_at' => now(),
            'remarks' => trim(collect([$purchaseOrder->remarks, $remarks])->filter()->implode("\n")),
            'updated_by' => $actor->id,
        ])->save();

        activity('procurement')
            ->performedOn($purchaseOrder)
            ->causedBy($actor)
            ->event('purchase-order-issued')
            ->withProperties(['remarks' => $remarks])
            ->log('Purchase order issued');

        return $purchaseOrder->fresh();
    }

    public function cancel(PurchaseOrder $purchaseOrder, User $actor, ?string $reason = null): PurchaseOrder
    {
        if ($purchaseOrder->items()->where('quantity_received', '>', 0)->exists()) {
            throw new \DomainException('Purchase orders with received quantities cannot be cancelled.');
        }

        $purchaseOrder->items()->update(['status' => PurchaseOrderItemStatus::Cancelled->value]);
        $purchaseOrder->forceFill([
            'status' => PurchaseOrderStatus::Cancelled->value,
            'remarks' => trim(collect([$purchaseOrder->remarks, $reason])->filter()->implode("\n")),
            'updated_by' => $actor->id,
        ])->save();

        $this->refreshLinkedRequisitionProgress($purchaseOrder);

        activity('procurement')
            ->performedOn($purchaseOrder)
            ->causedBy($actor)
            ->event('purchase-order-cancelled')
            ->withProperties(['reason' => $reason])
            ->log('Purchase order cancelled');

        return $purchaseOrder->fresh();
    }

    public function close(PurchaseOrder $purchaseOrder, User $actor, ?string $remarks = null): PurchaseOrder
    {
        if ($purchaseOrder->status !== PurchaseOrderStatus::FullyReceived) {
            throw new \DomainException('Only fully received purchase orders can be closed.');
        }

        $purchaseOrder->forceFill([
            'status' => PurchaseOrderStatus::Closed->value,
            'remarks' => trim(collect([$purchaseOrder->remarks, $remarks])->filter()->implode("\n")),
            'updated_by' => $actor->id,
        ])->save();

        activity('procurement')
            ->performedOn($purchaseOrder)
            ->causedBy($actor)
            ->event('purchase-order-closed')
            ->withProperties(['remarks' => $remarks])
            ->log('Purchase order closed');

        return $purchaseOrder->fresh();
    }

    public function refreshAfterReceipt(PurchaseOrder $purchaseOrder): PurchaseOrder
    {
        foreach ($purchaseOrder->items as $item) {
            $status = PurchaseOrderItemStatus::Pending;

            if ($item->status === PurchaseOrderItemStatus::Cancelled) {
                $status = PurchaseOrderItemStatus::Cancelled;
            } elseif ((float) $item->quantity_received >= (float) $item->quantity_ordered && (float) $item->quantity_ordered > 0) {
                $status = PurchaseOrderItemStatus::FullyReceived;
            } elseif ((float) $item->quantity_received > 0) {
                $status = PurchaseOrderItemStatus::PartiallyReceived;
            }

            $item->forceFill(['status' => $status->value])->save();
        }

        $statuses = $purchaseOrder->items()->pluck('status');

        if ($statuses->isNotEmpty() && $statuses->every(fn ($status) => $this->normalizePurchaseOrderItemStatus($status) === PurchaseOrderItemStatus::FullyReceived)) {
            $purchaseOrder->forceFill(['status' => PurchaseOrderStatus::FullyReceived->value])->save();
        } elseif ($purchaseOrder->items()->where('quantity_received', '>', 0)->exists()) {
            $purchaseOrder->forceFill(['status' => PurchaseOrderStatus::PartiallyReceived->value])->save();
        }

        $this->refreshLinkedRequisitionProgress($purchaseOrder);

        return $purchaseOrder->fresh('items');
    }

    protected function syncItems(PurchaseOrder $purchaseOrder, array $items): void
    {
        foreach ($items as $line) {
            $description = $this->resolveDescription($line);
            $lineTotal = $line['line_total'] ?? ((float) $line['quantity_ordered'] * (float) ($line['unit_price'] ?? 0));

            $purchaseOrder->items()->create([
                'purchase_requisition_item_id' => $line['purchase_requisition_item_id'] ?? null,
                'item_type' => $line['item_type'],
                'asset_category_id' => $line['asset_category_id'] ?? null,
                'inventory_item_id' => $line['inventory_item_id'] ?? null,
                'item_description' => $description,
                'quantity_ordered' => $line['quantity_ordered'],
                'unit_of_measure' => $line['unit_of_measure'] ?? $this->resolveUnitOfMeasure($line),
                'unit_price' => $line['unit_price'] ?? null,
                'line_total' => $lineTotal,
                'remarks' => $line['remarks'] ?? null,
                'status' => PurchaseOrderItemStatus::Pending->value,
            ]);
        }
    }

    public function refreshLinkedRequisitionProgress(PurchaseOrder $purchaseOrder, array $additionalItemIds = []): void
    {
        $itemIds = $purchaseOrder->items()->pluck('purchase_requisition_item_id')
            ->merge($additionalItemIds)
            ->filter()
            ->unique()
            ->values();

        if ($itemIds->isEmpty()) {
            return;
        }

        $requisitionItems = PurchaseRequisitionItem::query()
            ->with('requisition')
            ->whereIn('id', $itemIds)
            ->get();

        foreach ($requisitionItems as $requisitionItem) {
            $ordered = PurchaseOrderItem::query()
                ->where('purchase_requisition_item_id', $requisitionItem->id)
                ->whereHas('purchaseOrder', fn ($query) => $query->where('status', '!=', PurchaseOrderStatus::Cancelled->value))
                ->sum('quantity_ordered');

            $received = PurchaseOrderItem::query()
                ->where('purchase_requisition_item_id', $requisitionItem->id)
                ->whereHas('purchaseOrder', fn ($query) => $query->where('status', '!=', PurchaseOrderStatus::Cancelled->value))
                ->sum('quantity_received');

            $status = PurchaseRequisitionItemStatus::Approved;

            if ((float) $ordered >= (float) $requisitionItem->quantity && (float) $requisitionItem->quantity > 0) {
                $status = PurchaseRequisitionItemStatus::FullyOrdered;
            } elseif ((float) $ordered > 0) {
                $status = PurchaseRequisitionItemStatus::PartiallyOrdered;
            }

            $requisitionItem->forceFill([
                'ordered_quantity' => $ordered,
                'received_quantity' => $received,
                'status' => $status->value,
            ])->save();
        }

        $requisitionItems->pluck('requisition')->filter()->unique('id')->each(function (PurchaseRequisition $requisition) {
            if (in_array($requisition->status->value, [
                PurchaseRequisitionStatus::Draft->value,
                PurchaseRequisitionStatus::Submitted->value,
                PurchaseRequisitionStatus::UnderReview->value,
                PurchaseRequisitionStatus::Rejected->value,
                PurchaseRequisitionStatus::Cancelled->value,
            ], true)) {
                return;
            }

            $statuses = $requisition->items()->pluck('status');

            if ($statuses->isNotEmpty() && $statuses->every(fn ($status) => $this->normalizePurchaseRequisitionItemStatus($status) === PurchaseRequisitionItemStatus::FullyOrdered)) {
                $requisition->forceFill(['status' => PurchaseRequisitionStatus::FullyOrdered->value])->save();
            } elseif ($requisition->items()->where('ordered_quantity', '>', 0)->exists()) {
                $requisition->forceFill(['status' => PurchaseRequisitionStatus::PartiallyOrdered->value])->save();
            } else {
                $requisition->forceFill(['status' => PurchaseRequisitionStatus::Approved->value])->save();
            }
        });
    }

    protected function normalizePurchaseOrderItemStatus(PurchaseOrderItemStatus|string $status): PurchaseOrderItemStatus
    {
        return $status instanceof PurchaseOrderItemStatus
            ? $status
            : PurchaseOrderItemStatus::from((string) $status);
    }

    protected function normalizePurchaseRequisitionItemStatus(PurchaseRequisitionItemStatus|string $status): PurchaseRequisitionItemStatus
    {
        return $status instanceof PurchaseRequisitionItemStatus
            ? $status
            : PurchaseRequisitionItemStatus::from((string) $status);
    }

    protected function refreshTotals(PurchaseOrder $purchaseOrder, User $actor): void
    {
        $subtotal = (float) $purchaseOrder->items()->sum('line_total');
        $taxAmount = (float) ($purchaseOrder->tax_amount ?? 0);
        $discountAmount = (float) ($purchaseOrder->discount_amount ?? 0);

        $purchaseOrder->forceFill([
            'subtotal' => $subtotal,
            'total_amount' => $subtotal + $taxAmount - $discountAmount,
            'updated_by' => $actor->id,
        ])->save();
    }

    protected function resolveDescription(array $line): string
    {
        if (filled($line['item_description'] ?? null)) {
            return (string) $line['item_description'];
        }

        if (filled($line['purchase_requisition_item_id'] ?? null)) {
            return PurchaseRequisitionItem::query()->find($line['purchase_requisition_item_id'])?->item_description ?? 'Purchase order item';
        }

        if (filled($line['inventory_item_id'] ?? null)) {
            return InventoryItem::query()->find($line['inventory_item_id'])?->item_name ?? 'Inventory item';
        }

        if (filled($line['asset_category_id'] ?? null)) {
            return AssetCategory::query()->find($line['asset_category_id'])?->name ?? 'Asset item';
        }

        return 'Purchase order item';
    }

    protected function resolveUnitOfMeasure(array $line): ?string
    {
        if (filled($line['unit_of_measure'] ?? null)) {
            return $line['unit_of_measure'];
        }

        if (filled($line['purchase_requisition_item_id'] ?? null)) {
            return PurchaseRequisitionItem::query()->find($line['purchase_requisition_item_id'])?->unit_of_measure;
        }

        return filled($line['inventory_item_id'] ?? null)
            ? InventoryItem::query()->find($line['inventory_item_id'])?->unit_of_measure
            : 'unit';
    }
}
