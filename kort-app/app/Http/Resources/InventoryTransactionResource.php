<?php

namespace App\Http\Resources;

use App\Enums\InventoryTransactionType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $type = $this->transaction_type instanceof InventoryTransactionType ? $this->transaction_type->value : $this->transaction_type;

        return [
            'id' => $this->id,
            'inventory_item_id' => $this->inventory_item_id,
            'inventory_batch_id' => $this->inventory_batch_id,
            'transaction_type' => $type,
            'quantity' => $this->quantity,
            'unit_of_measure' => $this->unit_of_measure,
            'before_quantity' => $this->before_quantity,
            'after_quantity' => $this->after_quantity,
            'before_batch_quantity' => $this->before_batch_quantity,
            'after_batch_quantity' => $this->after_batch_quantity,
            'from_location_name' => $this->fromLocation?->name,
            'to_location_name' => $this->toLocation?->name,
            'from_department_name' => $this->fromDepartment?->name,
            'to_department_name' => $this->toDepartment?->name,
            'issued_to_user_name' => $this->issuedToUser?->name,
            'received_from_user_name' => $this->receivedFromUser?->name,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'reference_number' => $this->reference_number,
            'transaction_datetime' => $this->transaction_datetime?->toDateTimeString(),
            'remarks' => $this->remarks,
            'performed_by_name' => $this->performedBy?->name,
            'batch_number' => $this->batch?->batch_number,
        ];
    }
}
