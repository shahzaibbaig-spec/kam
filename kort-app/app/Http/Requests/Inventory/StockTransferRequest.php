<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('stock-transfer.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'transfer_date' => ['required', 'date'],
            'from_location_id' => ['required', 'exists:locations,id', 'different:to_location_id'],
            'to_location_id' => ['required', 'exists:locations,id'],
            'from_department_id' => ['nullable', 'exists:departments,id'],
            'to_department_id' => ['nullable', 'exists:departments,id'],
            'performed_by' => ['nullable', 'exists:users,id'],
            'remarks' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'items.*.inventory_batch_id' => ['required', 'exists:inventory_batches,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.storage_zone' => ['nullable', 'string', 'max:100'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
