<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\StockIssue;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StockIssueService
{
    public function __construct(
        protected InventoryCodeService $codes,
        protected BatchService $batches,
        protected InventoryTransactionService $transactions,
        protected FefoAllocationService $allocator,
    ) {
    }

    public function issue(array $payload, User $actor): StockIssue
    {
        return DB::transaction(function () use ($payload, $actor) {
            $issue = StockIssue::query()->create([
                'issue_number' => $this->codes->generateIssueNumber($payload['issue_date']),
                'issue_date' => $payload['issue_date'],
                'issue_type' => $payload['issue_type'],
                'department_id' => $payload['department_id'] ?? null,
                'location_id' => $payload['location_id'] ?? null,
                'room_or_area' => $payload['room_or_area'] ?? null,
                'issued_to_user_id' => $payload['issued_to_user_id'] ?? null,
                'issued_by' => $payload['issued_by'] ?? $actor->id,
                'remarks' => $payload['remarks'] ?? null,
                'status' => 'posted',
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            foreach ($payload['items'] as $line) {
                $item = InventoryItem::query()->findOrFail($line['inventory_item_id']);
                $beforeItemQuantity = (float) $item->current_quantity;
                $allocations = $this->allocator->allocate($item, (float) $line['quantity'], $line['inventory_batch_id'] ?? null);

                foreach ($allocations as $allocation) {
                    $batch = InventoryBatch::query()->findOrFail($allocation['batch_id']);
                    $allocatedQuantity = (float) $allocation['allocated_quantity'];
                    $beforeBatchQuantity = (float) $batch->available_quantity;

                    $batch->forceFill([
                        'available_quantity' => (float) $batch->available_quantity - $allocatedQuantity,
                        'issued_quantity' => (float) $batch->issued_quantity + $allocatedQuantity,
                        'updated_by' => $actor->id,
                    ])->save();

                    $this->batches->refreshStatus($batch);

                    $issueItem = $issue->items()->create([
                        'inventory_item_id' => $item->id,
                        'inventory_batch_id' => $batch->id,
                        'quantity' => $allocatedQuantity,
                        'unit_of_measure' => $line['unit_of_measure'] ?? $item->unit_of_measure,
                        'remarks' => $line['remarks'] ?? null,
                    ]);

                    $item = $this->batches->recalculateItem($item, $actor);

                    $this->transactions->record($item, $batch, InventoryTransactionType::Issued, $allocatedQuantity, $actor, [
                        'before_quantity' => $beforeItemQuantity,
                        'after_quantity' => (float) $item->current_quantity,
                        'before_batch_quantity' => $beforeBatchQuantity,
                        'after_batch_quantity' => (float) $batch->available_quantity,
                        'from_location_id' => $batch->store_location_id,
                        'to_location_id' => $issue->location_id,
                        'to_department_id' => $issue->department_id,
                        'issued_to_user_id' => $issue->issued_to_user_id,
                        'reference_type' => StockIssue::class,
                        'reference_id' => $issue->id,
                        'reference_number' => $issue->issue_number,
                        'transaction_datetime' => Carbon::parse($payload['issue_date'])->startOfDay(),
                        'remarks' => $line['remarks'] ?? $issue->remarks,
                    ]);

                    $beforeItemQuantity = (float) $item->current_quantity;

                    activity('inventory')
                        ->performedOn($item)
                        ->causedBy($actor)
                        ->event('stock-issued')
                        ->withProperties([
                            'issue_id' => $issue->id,
                            'issue_item_id' => $issueItem->id,
                            'batch_id' => $batch->id,
                            'quantity' => $allocatedQuantity,
                        ])
                        ->log('Stock issued');
                }
            }

            return $issue->load('items.item', 'items.batch');
        });
    }
}
