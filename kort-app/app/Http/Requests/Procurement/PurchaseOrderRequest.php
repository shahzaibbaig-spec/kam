<?php

namespace App\Http\Requests\Procurement;

use App\Enums\ProcurementItemType;
use App\Models\PurchaseOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('purchaseOrder') instanceof PurchaseOrder
            ? ($this->user()?->can('purchase-order.edit') ?? false)
            : ($this->user()?->can('purchase-order.create') ?? false);
    }

    public function rules(): array
    {
        return [
            'purchase_requisition_id' => ['nullable', 'exists:purchase_requisitions,id'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'po_date' => ['required', 'date'],
            'expected_delivery_date' => ['nullable', 'date', 'after_or_equal:po_date'],
            'currency' => ['nullable', 'string', 'max:10'],
            'payment_terms' => ['nullable', 'string', 'max:120'],
            'remarks' => ['nullable', 'string', 'max:5000'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_requisition_item_id' => ['nullable', 'exists:purchase_requisition_items,id'],
            'items.*.item_type' => ['required', Rule::in(ProcurementItemType::values())],
            'items.*.asset_category_id' => ['nullable', 'exists:asset_categories,id'],
            'items.*.inventory_item_id' => ['nullable', 'exists:inventory_items,id'],
            'items.*.item_description' => ['nullable', 'string', 'max:255'],
            'items.*.quantity_ordered' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_of_measure' => ['nullable', 'string', 'max:25'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.line_total' => ['nullable', 'numeric', 'min:0'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            foreach ($this->input('items', []) as $index => $line) {
                $key = 'items.'.$index;

                if (($line['item_type'] ?? null) === ProcurementItemType::Asset->value && blank($line['asset_category_id'] ?? null) && blank($line['item_description'] ?? null) && blank($line['purchase_requisition_item_id'] ?? null)) {
                    $validator->errors()->add($key.'.asset_category_id', 'Asset purchase order lines require an asset category, requisition item, or description.');
                }

                if (($line['item_type'] ?? null) === ProcurementItemType::Inventory->value && blank($line['inventory_item_id'] ?? null) && blank($line['item_description'] ?? null) && blank($line['purchase_requisition_item_id'] ?? null)) {
                    $validator->errors()->add($key.'.inventory_item_id', 'Inventory purchase order lines require an inventory item, requisition item, or description.');
                }
            }
        });
    }
}
