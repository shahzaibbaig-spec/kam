<?php

namespace App\Http\Requests\Procurement;

use App\Enums\ProcurementItemType;
use App\Enums\ProcurementPriority;
use App\Enums\PurchaseRequisitionType;
use App\Models\PurchaseRequisition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseRequisitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('requisition') instanceof PurchaseRequisition
            ? ($this->user()?->can('requisition.edit') ?? false)
            : ($this->user()?->can('requisition.create') ?? false);
    }

    public function rules(): array
    {
        return [
            'requisition_type' => ['required', Rule::in(PurchaseRequisitionType::values())],
            'department_id' => ['nullable', 'exists:departments,id'],
            'requested_by' => ['nullable', 'exists:users,id'],
            'request_date' => ['required', 'date'],
            'priority' => ['required', Rule::in(ProcurementPriority::values())],
            'purpose' => ['nullable', 'string', 'max:5000'],
            'remarks' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_type' => ['required', Rule::in(ProcurementItemType::values())],
            'items.*.asset_category_id' => ['nullable', 'exists:asset_categories,id'],
            'items.*.inventory_item_id' => ['nullable', 'exists:inventory_items,id'],
            'items.*.item_description' => ['nullable', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_of_measure' => ['nullable', 'string', 'max:25'],
            'items.*.estimated_unit_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.estimated_total' => ['nullable', 'numeric', 'min:0'],
            'items.*.preferred_supplier_id' => ['nullable', 'exists:suppliers,id'],
            'items.*.needed_by_date' => ['nullable', 'date'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            foreach ($this->input('items', []) as $index => $line) {
                $key = 'items.'.$index;

                if (($line['item_type'] ?? null) === ProcurementItemType::Asset->value && blank($line['asset_category_id'] ?? null) && blank($line['item_description'] ?? null)) {
                    $validator->errors()->add($key.'.asset_category_id', 'Asset lines require an asset category or description.');
                }

                if (($line['item_type'] ?? null) === ProcurementItemType::Inventory->value && blank($line['inventory_item_id'] ?? null) && blank($line['item_description'] ?? null)) {
                    $validator->errors()->add($key.'.inventory_item_id', 'Inventory lines require an inventory item or description.');
                }
            }
        });
    }
}
