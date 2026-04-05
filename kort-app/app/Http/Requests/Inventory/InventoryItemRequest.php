<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = $this->route('item')?->id;

        return [
            'item_name' => ['required', 'string', 'max:160'],
            'item_code' => ['nullable', 'string', 'max:40', Rule::unique('inventory_items', 'item_code')->ignore($itemId)],
            'inventory_category_id' => ['required', 'exists:inventory_categories,id'],
            'subcategory' => ['nullable', 'string', 'max:120'],
            'barcode_value' => ['nullable', 'string', 'max:120', Rule::unique('inventory_items', 'barcode_value')->ignore($itemId)],
            'sku' => ['nullable', 'string', 'max:80'],
            'unit_of_measure' => ['required', 'string', 'max:25'],
            'pack_size' => ['nullable', 'string', 'max:50'],
            'reorder_level' => ['required', 'numeric', 'min:0'],
            'minimum_level' => ['required', 'numeric', 'min:0'],
            'maximum_level' => ['nullable', 'numeric', 'min:0', 'gte:minimum_level'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'store_location_id' => ['nullable', 'exists:locations,id'],
            'storage_zone' => ['nullable', 'string', 'max:100'],
            'temperature_sensitive' => ['required', 'boolean'],
            'sterile_item' => ['required', 'boolean'],
            'high_risk_item' => ['required', 'boolean'],
            'controlled_use' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $reorder = $this->input('reorder_level');
            $maximum = $this->input('maximum_level');

            if ($maximum !== null && $maximum !== '' && (float) $reorder > (float) $maximum) {
                $validator->errors()->add('reorder_level', 'The reorder level cannot exceed the maximum level.');
            }
        });
    }
}
