<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Enums\StockReturnCondition;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\StockIssue;
use App\Models\StockReturn;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockReturnService
{
    public function __construct(
        protected InventoryCodeService $codes,
        protected BatchService $batches,
        protected InventoryTransactionService $transactions,
    ) {
    }

    public function receive(array $payload, User $actor): StockReturn
    {
        return DB::transaction(function () use ($payload, $actor) {
            $stockReturn = StockReturn::query()->create([
                'return_number' => $this->codes->generateReturnNumber($payload['return_date']),
                'return_date' => $payload['return_date'],
                'source_issue_id' => $payload['source_issue_id'] ?? null,
                'returned_by' => $payload['returned_by'] ?? null,
                'received_by' => $payload['received_by'] ?? $actor->id,
                'department_id' => $payload['department_id'] ?? null,
                'location_id' => $payload['location_id'] ?? null,
                'room_or_area' => $payload['room_or_area'] ?? null,
                'remarks' => $payload['remarks'] ?? null,
                'status' => 'posted',
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            foreach ($payload['items'] as $line) {
                $item = InventoryItem::query()->findOrFail($line['inventory_item_id']);
                $batch = $this->resolveReturnBatch($line, $payload);
                $beforeItemQuantity = (float) $item->current_quantity;
                $beforeBatchAvailable = (float) $batch->available_quantity;
                $quantity = (float) $line['quantity'];
                $condition = StockReturnCondition::from($line['return_condition']);
                $receivingBatch = $batch;

                if ($payload['location_id'] && (int) $payload['location_id'] !== (int) $batch->store_location_id) {
                    $receivingBatch = $this->batches->prepareTransferBatch($batch, (int) $payload['location_id'], $actor, $batch->storage_zone);
                    $beforeBatchAvailable = (float) $receivingBatch->available_quantity;
                }

                match ($condition) {
                    StockReturnCondition::Usable => $receivingBatch->forceFill([
                        'available_quantity' => (float) $receivingBatch->available_quantity + $quantity,
                        'returned_quantity' => (float) $receivingBatch->returned_quantity + $quantity,
                        'updated_by' => $actor->id,
                    ])->save(),
                    StockReturnCondition::Damaged => $receivingBatch->forceFill([
                        'damaged_quantity' => (float) $receivingBatch->damaged_quantity + $quantity,
                        'returned_quantity' => (float) $receivingBatch->returned_quantity + $quantity,
                        'updated_by' => $actor->id,
                    ])->save(),
                    StockReturnCondition::Contaminated => $receivingBatch->forceFill([
                        'quarantined_quantity' => (float) $receivingBatch->quarantined_quantity + $quantity,
                        'returned_quantity' => (float) $receivingBatch->returned_quantity + $quantity,
                        'updated_by' => $actor->id,
                    ])->save(),
                    StockReturnCondition::Expired => $receivingBatch->forceFill([
                        'expired_quantity' => (float) $receivingBatch->expired_quantity + $quantity,
                        'returned_quantity' => (float) $receivingBatch->returned_quantity + $quantity,
                        'updated_by' => $actor->id,
                    ])->save(),
                };

                $this->batches->refreshStatus($receivingBatch);
                $item = $this->batches->recalculateItem($item, $actor);

                $returnItem = $stockReturn->items()->create([
                    'inventory_item_id' => $item->id,
                    'inventory_batch_id' => $receivingBatch->id,
                    'quantity' => $quantity,
                    'return_condition' => $condition->value,
                    'remarks' => $line['remarks'] ?? null,
                ]);

                $transactionType = match ($condition) {
                    StockReturnCondition::Usable => InventoryTransactionType::Returned,
                    StockReturnCondition::Damaged => InventoryTransactionType::Damaged,
                    StockReturnCondition::Contaminated => InventoryTransactionType::Quarantined,
                    StockReturnCondition::Expired => InventoryTransactionType::Expired,
                };

                $this->transactions->record($item, $receivingBatch, $transactionType, $quantity, $actor, [
                    'before_quantity' => $beforeItemQuantity,
                    'after_quantity' => (float) $item->current_quantity,
                    'before_batch_quantity' => $beforeBatchAvailable,
                    'after_batch_quantity' => (float) $receivingBatch->available_quantity,
                    'to_location_id' => $receivingBatch->store_location_id,
                    'to_department_id' => $stockReturn->department_id,
                    'received_from_user_id' => $stockReturn->returned_by,
                    'reference_type' => StockReturn::class,
                    'reference_id' => $stockReturn->id,
                    'reference_number' => $stockReturn->return_number,
                    'transaction_datetime' => Carbon::parse($payload['return_date'])->startOfDay(),
                    'remarks' => $line['remarks'] ?? $stockReturn->remarks,
                ]);

                activity('inventory')
                    ->performedOn($item)
                    ->causedBy($actor)
                    ->event('stock-returned')
                    ->withProperties([
                        'return_id' => $stockReturn->id,
                        'return_item_id' => $returnItem->id,
                        'batch_id' => $receivingBatch->id,
                        'condition' => $condition->value,
                        'quantity' => $quantity,
                    ])
                    ->log('Stock returned');
            }

            return $stockReturn->load('items.item', 'items.batch');
        });
    }

    protected function resolveReturnBatch(array $line, array $payload): InventoryBatch
    {
        if (! empty($line['inventory_batch_id'])) {
            return InventoryBatch::query()->findOrFail($line['inventory_batch_id']);
        }

        if (empty($payload['source_issue_id'])) {
            throw ValidationException::withMessages([
                'items' => 'Batch selection is required when a source issue is not provided.',
            ]);
        }

        $sourceIssue = StockIssue::query()->with('items')->findOrFail($payload['source_issue_id']);
        $matchingItems = $sourceIssue->items->where('inventory_item_id', $line['inventory_item_id'])->values();

        if ($matchingItems->count() !== 1 || ! $matchingItems->first()?->inventory_batch_id) {
            throw ValidationException::withMessages([
                'items' => 'Select the specific batch for returns when the original issue used multiple batches.',
            ]);
        }

        return InventoryBatch::query()->findOrFail($matchingItems->first()->inventory_batch_id);
    }
}
