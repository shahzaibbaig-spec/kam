<?php

namespace App\Http\Requests\Inventory;

use App\Enums\StockAdjustmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('stock-adjustment.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'adjustment_date' => ['required', 'date'],
            'adjustment_type' => ['required', Rule::in(StockAdjustmentType::values())],
            'reason' => ['required', 'string', 'max:1000'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'performed_by' => ['nullable', 'exists:users,id'],
            'remarks' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'items.*.inventory_batch_id' => ['required', 'exists:inventory_batches,id'],
            'items.*.system_quantity' => ['required', 'numeric', 'min:0'],
            'items.*.physical_quantity' => ['nullable', 'numeric', 'min:0'],
            'items.*.adjustment_quantity' => ['required', 'numeric', 'min:0'],
            'items.*.unit_of_measure' => ['nullable', 'string', 'max:25'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
