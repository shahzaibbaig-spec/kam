<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Models\InventoryItem;
use App\Models\StockReceipt;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StockReceiptService
{
    public function __construct(
        protected InventoryCodeService $codes,
        protected BatchService $batches,
        protected InventoryTransactionService $transactions,
    ) {
    }

    public function receive(array $payload, User $actor): StockReceipt
    {
        return DB::transaction(function () use ($payload, $actor) {
            $receipt = StockReceipt::query()->create([
                'receipt_number' => $this->codes->generateReceiptNumber($payload['receipt_date']),
                'supplier_id' => $payload['supplier_id'] ?? null,
                'department_id' => $payload['department_id'] ?? null,
                'store_location_id' => $payload['store_location_id'] ?? null,
                'receipt_date' => $payload['receipt_date'],
                'invoice_reference' => $payload['invoice_reference'] ?? null,
                'delivery_note_number' => $payload['delivery_note_number'] ?? null,
                'received_by' => $payload['received_by'] ?? $actor->id,
                'remarks' => $payload['remarks'] ?? null,
                'status' => 'posted',
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            foreach ($payload['items'] as $line) {
                $item = InventoryItem::query()->findOrFail($line['inventory_item_id']);
                $beforeItemQuantity = (float) $item->current_quantity;

                $batch = $this->batches->firstOrCreateBatch(
                    $item,
                    $line['batch_number'],
                    $payload['store_location_id'] ?? $item->store_location_id,
                    $actor,
                    [
                        'lot_number' => $line['lot_number'] ?? null,
                        'manufacture_date' => $line['manufacture_date'] ?? null,
                        'expiry_date' => $line['expiry_date'] ?? null,
                        'unit_cost' => $line['unit_cost'] ?? null,
                        'supplier_id' => $payload['supplier_id'] ?? $item->supplier_id,
                        'received_at' => Carbon::parse($payload['receipt_date'])->startOfDay(),
                        'storage_zone' => $line['storage_zone'] ?? $item->storage_zone,
                        'notes' => $line['remarks'] ?? null,
                    ],
                );

                $beforeBatchQuantity = (float) $batch->available_quantity;
                $quantity = (float) $line['quantity'];

                $batch->forceFill([
                    'received_quantity' => (float) $batch->received_quantity + $quantity,
                    'available_quantity' => (float) $batch->available_quantity + $quantity,
                    'updated_by' => $actor->id,
                ])->save();

                $this->batches->refreshStatus($batch);
                $item = $this->batches->recalculateItem($item, $actor);

                $receiptItem = $receipt->items()->create([
                    'inventory_item_id' => $item->id,
                    'inventory_batch_id' => $batch->id,
                    'batch_number' => $line['batch_number'],
                    'manufacture_date' => $line['manufacture_date'] ?? null,
                    'expiry_date' => $line['expiry_date'] ?? null,
                    'quantity' => $quantity,
                    'unit_cost' => $line['unit_cost'] ?? null,
                    'line_total' => isset($line['unit_cost']) ? $quantity * (float) $line['unit_cost'] : null,
                    'storage_zone' => $line['storage_zone'] ?? $item->storage_zone,
                    'remarks' => $line['remarks'] ?? null,
                ]);

                $this->transactions->record($item, $batch, InventoryTransactionType::Received, $quantity, $actor, [
                    'before_quantity' => $beforeItemQuantity,
                    'after_quantity' => (float) $item->current_quantity,
                    'before_batch_quantity' => $beforeBatchQuantity,
                    'after_batch_quantity' => (float) $batch->available_quantity,
                    'to_location_id' => $receipt->store_location_id,
                    'to_department_id' => $receipt->department_id,
                    'reference_type' => StockReceipt::class,
                    'reference_id' => $receipt->id,
                    'reference_number' => $receipt->receipt_number,
                    'transaction_datetime' => Carbon::parse($payload['receipt_date'])->startOfDay(),
                    'remarks' => $line['remarks'] ?? $receipt->remarks,
                ]);

                activity('inventory')
                    ->performedOn($item)
                    ->causedBy($actor)
                    ->event('stock-received')
                    ->withProperties([
                        'receipt_id' => $receipt->id,
                        'receipt_item_id' => $receiptItem->id,
                        'batch_id' => $batch->id,
                        'quantity' => $quantity,
                    ])
                    ->log('Stock received');
            }

            return $receipt->load('items.item', 'items.batch');
        });
    }
}
