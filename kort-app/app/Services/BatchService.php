<?php

namespace App\Services;

use App\Enums\InventoryBatchStatus;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\User;

class BatchService
{
    public function firstOrCreateBatch(
        InventoryItem $item,
        string $batchNumber,
        ?int $storeLocationId,
        User $actor,
        array $attributes = [],
    ): InventoryBatch {
        $batch = InventoryBatch::query()->firstOrNew([
            'inventory_item_id' => $item->id,
            'batch_number' => $batchNumber,
            'store_location_id' => $storeLocationId,
        ]);

        if (! $batch->exists) {
            $batch->created_by = $actor->id;
        }

        $batch->fill($attributes + ['updated_by' => $actor->id]);
        $batch->save();

        return $this->refreshStatus($batch);
    }

    public function prepareTransferBatch(
        InventoryBatch $sourceBatch,
        int $targetLocationId,
        User $actor,
        ?string $storageZone = null,
    ): InventoryBatch {
        return $this->firstOrCreateBatch(
            $sourceBatch->item,
            $sourceBatch->batch_number,
            $targetLocationId,
            $actor,
            [
                'lot_number' => $sourceBatch->lot_number,
                'manufacture_date' => $sourceBatch->manufacture_date,
                'expiry_date' => $sourceBatch->expiry_date,
                'unit_cost' => $sourceBatch->unit_cost,
                'supplier_id' => $sourceBatch->supplier_id,
                'received_at' => $sourceBatch->received_at,
                'storage_zone' => $storageZone ?: $sourceBatch->storage_zone,
                'notes' => $sourceBatch->notes,
            ],
        );
    }

    public function refreshStatus(InventoryBatch $batch, bool $save = true): InventoryBatch
    {
        $batch->loadMissing('item');

        $availableQuantity = (float) $batch->available_quantity;
        $status = InventoryBatchStatus::Active;

        if ($batch->expiry_date?->isPast()) {
            $status = InventoryBatchStatus::Expired;
        } elseif ((float) $batch->quarantined_quantity > 0 && $availableQuantity <= 0) {
            $status = InventoryBatchStatus::Quarantined;
        } elseif ((float) $batch->damaged_quantity > 0 && $availableQuantity <= 0) {
            $status = InventoryBatchStatus::Damaged;
        } elseif ($availableQuantity <= 0) {
            $status = InventoryBatchStatus::Exhausted;
        } elseif ($availableQuantity <= max(1, min(10, (int) round((float) $batch->item?->reorder_level)))) {
            $status = InventoryBatchStatus::LowStock;
        }

        $batch->status = $status;

        if ($save) {
            $batch->save();
        }

        return $batch;
    }

    public function recalculateItem(InventoryItem $item, ?User $actor = null): InventoryItem
    {
        $totals = InventoryBatch::query()
            ->where('inventory_item_id', $item->id)
            ->selectRaw('COALESCE(SUM(available_quantity), 0) as available_total')
            ->selectRaw('COALESCE(SUM(reserved_quantity), 0) as reserved_total')
            ->selectRaw('COALESCE(SUM(issued_quantity), 0) as issued_total')
            ->selectRaw('COALESCE(SUM(damaged_quantity), 0) as damaged_total')
            ->selectRaw('COALESCE(SUM(quarantined_quantity), 0) as quarantined_total')
            ->selectRaw('COALESCE(SUM(expired_quantity), 0) as expired_total')
            ->first();

        $item->forceFill([
            'current_quantity' => (float) $totals->available_total + (float) $totals->reserved_total + (float) $totals->damaged_total + (float) $totals->quarantined_total + (float) $totals->expired_total,
            'reserved_quantity' => $totals->reserved_total,
            'issued_quantity' => $totals->issued_total,
            'damaged_quantity' => $totals->damaged_total,
            'quarantined_quantity' => $totals->quarantined_total,
            'expired_quantity' => $totals->expired_total,
            'updated_by' => $actor?->id ?? $item->updated_by,
        ])->save();

        return $item->fresh();
    }

    public function refreshStatusesForItem(InventoryItem $item): void
    {
        InventoryBatch::query()
            ->where('inventory_item_id', $item->id)
            ->get()
            ->each(fn (InventoryBatch $batch) => $this->refreshStatus($batch));
    }
}
