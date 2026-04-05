<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\User;

class InventoryTransactionService
{
    public function record(
        InventoryItem $item,
        ?InventoryBatch $batch,
        InventoryTransactionType|string $type,
        float $quantity,
        User $actor,
        array $context = [],
    ): InventoryTransaction {
        $transactionType = $type instanceof InventoryTransactionType ? $type->value : $type;

        return InventoryTransaction::query()->create([
            'inventory_item_id' => $item->id,
            'inventory_batch_id' => $batch?->id,
            'transaction_type' => $transactionType,
            'quantity' => $quantity,
            'unit_of_measure' => $context['unit_of_measure'] ?? $item->unit_of_measure,
            'before_quantity' => $context['before_quantity'] ?? $item->current_quantity,
            'after_quantity' => $context['after_quantity'] ?? $item->current_quantity,
            'before_batch_quantity' => $context['before_batch_quantity'] ?? $batch?->available_quantity,
            'after_batch_quantity' => $context['after_batch_quantity'] ?? $batch?->available_quantity,
            'from_location_id' => $context['from_location_id'] ?? null,
            'to_location_id' => $context['to_location_id'] ?? null,
            'from_department_id' => $context['from_department_id'] ?? null,
            'to_department_id' => $context['to_department_id'] ?? null,
            'issued_to_user_id' => $context['issued_to_user_id'] ?? null,
            'received_from_user_id' => $context['received_from_user_id'] ?? null,
            'reference_type' => $context['reference_type'] ?? null,
            'reference_id' => $context['reference_id'] ?? null,
            'reference_number' => $context['reference_number'] ?? null,
            'transaction_datetime' => $context['transaction_datetime'] ?? now(),
            'remarks' => $context['remarks'] ?? null,
            'performed_by' => $actor->id,
        ]);
    }
}
