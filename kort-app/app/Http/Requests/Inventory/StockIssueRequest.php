<?php

namespace App\Http\Requests\Inventory;

use App\Enums\InventoryIssueType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('stock-issue.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'issue_date' => ['required', 'date'],
            'issue_type' => ['required', Rule::in(InventoryIssueType::values())],
            'department_id' => ['nullable', 'exists:departments,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'room_or_area' => ['nullable', 'string', 'max:120'],
            'issued_to_user_id' => ['nullable', 'exists:users,id'],
            'issued_by' => ['nullable', 'exists:users,id'],
            'remarks' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'items.*.inventory_batch_id' => ['nullable', 'exists:inventory_batches,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_of_measure' => ['nullable', 'string', 'max:25'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $type = $this->input('issue_type');

            if ($type === InventoryIssueType::Department->value && blank($this->input('department_id'))) {
                $validator->errors()->add('department_id', 'Department is required for department issues.');
            }

            if ($type === InventoryIssueType::Location->value && blank($this->input('location_id'))) {
                $validator->errors()->add('location_id', 'Location is required for location issues.');
            }

            if ($type === InventoryIssueType::Room->value && blank($this->input('room_or_area'))) {
                $validator->errors()->add('room_or_area', 'Room or area is required for room issues.');
            }

            if ($type === InventoryIssueType::Staff->value && blank($this->input('issued_to_user_id'))) {
                $validator->errors()->add('issued_to_user_id', 'Staff member is required for staff issues.');
            }
        });
    }
}
