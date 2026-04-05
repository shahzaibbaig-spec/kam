<?php

namespace App\Http\Requests\Inventory;

use App\Enums\StockReturnCondition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('stock-return.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'return_date' => ['required', 'date'],
            'source_issue_id' => ['nullable', 'exists:stock_issues,id'],
            'returned_by' => ['nullable', 'exists:users,id'],
            'received_by' => ['nullable', 'exists:users,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'room_or_area' => ['nullable', 'string', 'max:120'],
            'remarks' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'items.*.inventory_batch_id' => ['nullable', 'exists:inventory_batches,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.return_condition' => ['required', Rule::in(StockReturnCondition::values())],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
