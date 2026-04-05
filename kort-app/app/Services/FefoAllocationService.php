<?php

namespace App\Services;

use App\Enums\InventoryBatchStatus;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class FefoAllocationService
{
    public function preview(InventoryItem $item, float $requestedQuantity, ?int $preferredBatchId = null): array
    {
        $validBatches = $this->validBatchesQuery($item)->get();
        $availableQuantity = (float) $validBatches->sum('available_quantity');
        $remaining = $requestedQuantity;
        $allocations = collect();

        if ($preferredBatchId) {
            $preferredBatch = $validBatches->firstWhere('id', $preferredBatchId);

            if ($preferredBatch) {
                $allocated = min($remaining, (float) $preferredBatch->available_quantity);

                if ($allocated > 0) {
                    $allocations->push($this->allocationPayload($preferredBatch, $allocated));
                    $remaining -= $allocated;
                    $validBatches = $validBatches->reject(fn (InventoryBatch $batch) => $batch->id === $preferredBatchId)->values();
                }
            }
        }

        $validBatches->each(function (InventoryBatch $batch) use (&$remaining, $allocations): void {
            if ($remaining <= 0) {
                return;
            }

            $allocated = min($remaining, (float) $batch->available_quantity);

            if ($allocated <= 0) {
                return;
            }

            $allocations->push($this->allocationPayload($batch, $allocated));
            $remaining -= $allocated;
        });

        return [
            'requested_quantity' => $requestedQuantity,
            'available_quantity' => $availableQuantity,
            'shortfall_quantity' => max(0, $remaining),
            'allocations' => $allocations->all(),
        ];
    }

    public function allocate(InventoryItem $item, float $requestedQuantity, ?int $preferredBatchId = null): Collection
    {
        $preview = $this->preview($item, $requestedQuantity, $preferredBatchId);

        if ($preview['shortfall_quantity'] > 0) {
            throw ValidationException::withMessages([
                'items' => 'Insufficient valid stock for '.$item->item_name.'. Only '.$preview['available_quantity'].' '.$item->unit_of_measure.' available for issue after FEFO validation.',
            ]);
        }

        return collect($preview['allocations']);
    }

    protected function validBatchesQuery(InventoryItem $item)
    {
        return $item->batches()
            ->where('available_quantity', '>', 0)
            ->whereNotIn('status', [
                InventoryBatchStatus::Quarantined->value,
                InventoryBatchStatus::Damaged->value,
                InventoryBatchStatus::Expired->value,
                InventoryBatchStatus::Exhausted->value,
            ])
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                    ->orWhereDate('expiry_date', '>=', now()->toDateString());
            })
            ->orderByRaw('CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('expiry_date')
            ->orderBy('received_at')
            ->orderBy('id');
    }

    protected function allocationPayload(InventoryBatch $batch, float $quantity): array
    {
        return [
            'batch_id' => $batch->id,
            'batch_number' => $batch->batch_number,
            'expiry_date' => $batch->expiry_date?->toDateString(),
            'available_quantity' => (float) $batch->available_quantity,
            'allocated_quantity' => $quantity,
            'store_location_id' => $batch->store_location_id,
            'store_location_name' => $batch->storeLocation?->name,
        ];
    }
}
