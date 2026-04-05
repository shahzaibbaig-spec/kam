<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockTransferService
{
    public function __construct(
        protected InventoryCodeService $codes,
        protected BatchService $batches,
        protected InventoryTransactionService $transactions,
    ) {
    }

    public function transfer(array $payload, User $actor): StockTransfer
    {
        return DB::transaction(function () use ($payload, $actor) {
            $transfer = StockTransfer::query()->create([
                'transfer_number' => $this->codes->generateTransferNumber($payload['transfer_date']),
                'transfer_date' => $payload['transfer_date'],
                'from_location_id' => $payload['from_location_id'],
                'to_location_id' => $payload['to_location_id'],
                'from_department_id' => $payload['from_department_id'] ?? null,
                'to_department_id' => $payload['to_department_id'] ?? null,
                'remarks' => $payload['remarks'] ?? null,
                'status' => 'posted',
                'performed_by' => $payload['performed_by'] ?? $actor->id,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            foreach ($payload['items'] as $line) {
                $item = InventoryItem::query()->findOrFail($line['inventory_item_id']);
                $sourceBatch = InventoryBatch::query()->findOrFail($line['inventory_batch_id']);
                $quantity = (float) $line['quantity'];

                if ((int) $sourceBatch->store_location_id !== (int) $transfer->from_location_id) {
                    throw ValidationException::withMessages([
                        'items' => 'Selected batch '.$sourceBatch->batch_number.' is not stored in the chosen source location.',
                    ]);
                }

                if (! $sourceBatch->isIssuable()) {
                    throw ValidationException::withMessages([
                        'items' => 'Only active, non-expired, non-quarantined stock can be transferred.',
                    ]);
                }

                if ((float) $sourceBatch->available_quantity < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => 'Transfer quantity exceeds available stock for batch '.$sourceBatch->batch_number.'.',
                    ]);
                }

                $beforeItemQuantity = (float) $item->current_quantity;
                $beforeSourceQuantity = (float) $sourceBatch->available_quantity;
                $targetBatch = $this->batches->prepareTransferBatch($sourceBatch, (int) $transfer->to_location_id, $actor, $line['storage_zone'] ?? null);
                $beforeTargetQuantity = (float) $targetBatch->available_quantity;

                $sourceBatch->forceFill([
                    'available_quantity' => (float) $sourceBatch->available_quantity - $quantity,
                    'updated_by' => $actor->id,
                ])->save();

                $targetBatch->forceFill([
                    'available_quantity' => (float) $targetBatch->available_quantity + $quantity,
                    'updated_by' => $actor->id,
                ])->save();

                $this->batches->refreshStatus($sourceBatch);
                $this->batches->refreshStatus($targetBatch);
                $item = $this->batches->recalculateItem($item, $actor);

                $transferItem = $transfer->items()->create([
                    'inventory_item_id' => $item->id,
                    'inventory_batch_id' => $sourceBatch->id,
                    'quantity' => $quantity,
                    'remarks' => $line['remarks'] ?? null,
                ]);

                $this->transactions->record($item, $sourceBatch, InventoryTransactionType::TransferredOut, $quantity, $actor, [
                    'before_quantity' => $beforeItemQuantity,
                    'after_quantity' => (float) $item->current_quantity,
                    'before_batch_quantity' => $beforeSourceQuantity,
                    'after_batch_quantity' => (float) $sourceBatch->available_quantity,
                    'from_location_id' => $transfer->from_location_id,
                    'to_location_id' => $transfer->to_location_id,
                    'from_department_id' => $transfer->from_department_id,
                    'to_department_id' => $transfer->to_department_id,
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'reference_number' => $transfer->transfer_number,
                    'transaction_datetime' => Carbon::parse($payload['transfer_date'])->startOfDay(),
                    'remarks' => $line['remarks'] ?? $transfer->remarks,
                ]);

                $this->transactions->record($item, $targetBatch, InventoryTransactionType::TransferredIn, $quantity, $actor, [
                    'before_quantity' => $beforeItemQuantity,
                    'after_quantity' => (float) $item->current_quantity,
                    'before_batch_quantity' => $beforeTargetQuantity,
                    'after_batch_quantity' => (float) $targetBatch->available_quantity,
                    'from_location_id' => $transfer->from_location_id,
                    'to_location_id' => $transfer->to_location_id,
                    'from_department_id' => $transfer->from_department_id,
                    'to_department_id' => $transfer->to_department_id,
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'reference_number' => $transfer->transfer_number,
                    'transaction_datetime' => Carbon::parse($payload['transfer_date'])->startOfDay(),
                    'remarks' => $line['remarks'] ?? $transfer->remarks,
                ]);

                activity('inventory')
                    ->performedOn($item)
                    ->causedBy($actor)
                    ->event('stock-transferred')
                    ->withProperties([
                        'transfer_id' => $transfer->id,
                        'transfer_item_id' => $transferItem->id,
                        'source_batch_id' => $sourceBatch->id,
                        'target_batch_id' => $targetBatch->id,
                        'quantity' => $quantity,
                    ])
                    ->log('Stock transferred');
            }

            return $transfer->load('items.item', 'items.batch');
        });
    }
}
