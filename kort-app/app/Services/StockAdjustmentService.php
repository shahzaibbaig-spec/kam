<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Enums\StockAdjustmentType;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\StockAdjustment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockAdjustmentService
{
    public function __construct(
        protected InventoryCodeService $codes,
        protected BatchService $batches,
        protected InventoryTransactionService $transactions,
    ) {
    }

    public function adjust(array $payload, User $actor): StockAdjustment
    {
        return DB::transaction(function () use ($payload, $actor) {
            $type = StockAdjustmentType::from($payload['adjustment_type']);

            $adjustment = StockAdjustment::query()->create([
                'adjustment_number' => $this->codes->generateAdjustmentNumber($payload['adjustment_date']),
                'adjustment_date' => $payload['adjustment_date'],
                'adjustment_type' => $type->value,
                'reason' => $payload['reason'],
                'location_id' => $payload['location_id'] ?? null,
                'department_id' => $payload['department_id'] ?? null,
                'remarks' => $payload['remarks'] ?? null,
                'performed_by' => $payload['performed_by'] ?? $actor->id,
                'approved_by' => $actor->can('stock-adjustment.approve') ? $actor->id : null,
                'status' => 'posted',
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            foreach ($payload['items'] as $line) {
                $item = InventoryItem::query()->findOrFail($line['inventory_item_id']);
                $batch = InventoryBatch::query()->findOrFail($line['inventory_batch_id']);
                $beforeItemQuantity = (float) $item->current_quantity;
                $beforeBatchQuantity = (float) $batch->available_quantity;
                $systemQuantity = (float) $line['system_quantity'];
                $physicalQuantity = isset($line['physical_quantity']) ? (float) $line['physical_quantity'] : null;
                $quantity = (float) $line['adjustment_quantity'];

                $transactionType = match ($type) {
                    StockAdjustmentType::Increase => InventoryTransactionType::AdjustedIn,
                    StockAdjustmentType::Release => InventoryTransactionType::ReleasedFromQuarantine,
                    StockAdjustmentType::Damage => InventoryTransactionType::Damaged,
                    StockAdjustmentType::Expiry => InventoryTransactionType::Expired,
                    StockAdjustmentType::Quarantine => InventoryTransactionType::Quarantined,
                    StockAdjustmentType::Decrease, StockAdjustmentType::Recount => InventoryTransactionType::AdjustedOut,
                };

                match ($type) {
                    StockAdjustmentType::Increase => $batch->forceFill([
                        'available_quantity' => (float) $batch->available_quantity + $quantity,
                        'updated_by' => $actor->id,
                    ])->save(),
                    StockAdjustmentType::Decrease => $this->decreaseAvailable($batch, $quantity, $actor),
                    StockAdjustmentType::Recount => $this->applyRecount($batch, $systemQuantity, $physicalQuantity, $actor),
                    StockAdjustmentType::Damage => $this->moveBetweenQuantities($batch, 'available_quantity', 'damaged_quantity', $quantity, $actor),
                    StockAdjustmentType::Expiry => $this->moveBetweenQuantities($batch, 'available_quantity', 'expired_quantity', $quantity, $actor),
                    StockAdjustmentType::Quarantine => $this->moveBetweenQuantities($batch, 'available_quantity', 'quarantined_quantity', $quantity, $actor),
                    StockAdjustmentType::Release => $this->moveBetweenQuantities($batch, 'quarantined_quantity', 'available_quantity', $quantity, $actor),
                };

                $this->batches->refreshStatus($batch);
                $item = $this->batches->recalculateItem($item, $actor);

                $adjustmentItem = $adjustment->items()->create([
                    'inventory_item_id' => $item->id,
                    'inventory_batch_id' => $batch->id,
                    'system_quantity' => $systemQuantity,
                    'physical_quantity' => $physicalQuantity,
                    'adjustment_quantity' => $type === StockAdjustmentType::Recount ? ($physicalQuantity - $systemQuantity) : $quantity,
                    'unit_of_measure' => $line['unit_of_measure'] ?? $item->unit_of_measure,
                    'remarks' => $line['remarks'] ?? null,
                ]);

                $this->transactions->record($item, $batch, $transactionType, abs((float) $adjustmentItem->adjustment_quantity), $actor, [
                    'before_quantity' => $beforeItemQuantity,
                    'after_quantity' => (float) $item->current_quantity,
                    'before_batch_quantity' => $beforeBatchQuantity,
                    'after_batch_quantity' => (float) $batch->available_quantity,
                    'to_location_id' => $adjustment->location_id,
                    'to_department_id' => $adjustment->department_id,
                    'reference_type' => StockAdjustment::class,
                    'reference_id' => $adjustment->id,
                    'reference_number' => $adjustment->adjustment_number,
                    'transaction_datetime' => Carbon::parse($payload['adjustment_date'])->startOfDay(),
                    'remarks' => $line['remarks'] ?? $adjustment->remarks,
                ]);

                activity('inventory')
                    ->performedOn($item)
                    ->causedBy($actor)
                    ->event('stock-adjusted')
                    ->withProperties([
                        'adjustment_id' => $adjustment->id,
                        'adjustment_item_id' => $adjustmentItem->id,
                        'batch_id' => $batch->id,
                        'adjustment_type' => $type->value,
                        'adjustment_quantity' => $adjustmentItem->adjustment_quantity,
                    ])
                    ->log('Stock adjusted');
            }

            return $adjustment->load('items.item', 'items.batch');
        });
    }

    protected function decreaseAvailable(InventoryBatch $batch, float $quantity, User $actor): void
    {
        if ((float) $batch->available_quantity < $quantity) {
            throw ValidationException::withMessages([
                'items' => 'Adjustment quantity exceeds available stock for batch '.$batch->batch_number.'.',
            ]);
        }

        $batch->forceFill([
            'available_quantity' => (float) $batch->available_quantity - $quantity,
            'updated_by' => $actor->id,
        ])->save();
    }

    protected function applyRecount(InventoryBatch $batch, float $systemQuantity, ?float $physicalQuantity, User $actor): void
    {
        if ($physicalQuantity === null) {
            throw ValidationException::withMessages([
                'items' => 'Physical quantity is required for recount adjustments.',
            ]);
        }

        $delta = $physicalQuantity - $systemQuantity;

        if ($delta >= 0) {
            $batch->forceFill([
                'available_quantity' => (float) $batch->available_quantity + $delta,
                'updated_by' => $actor->id,
            ])->save();

            return;
        }

        $this->decreaseAvailable($batch, abs($delta), $actor);
    }

    protected function moveBetweenQuantities(InventoryBatch $batch, string $fromField, string $toField, float $quantity, User $actor): void
    {
        if ((float) $batch->{$fromField} < $quantity) {
            throw ValidationException::withMessages([
                'items' => 'Adjustment quantity exceeds stock held in '.$fromField.' for batch '.$batch->batch_number.'.',
            ]);
        }

        $batch->forceFill([
            $fromField => (float) $batch->{$fromField} - $quantity,
            $toField => (float) $batch->{$toField} + $quantity,
            'updated_by' => $actor->id,
        ])->save();
    }
}
