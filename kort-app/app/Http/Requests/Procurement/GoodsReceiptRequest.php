<?php

namespace App\Http\Requests\Procurement;

use App\Enums\ProcurementItemType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GoodsReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('goods-receipt.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'purchase_order_id' => ['required', 'exists:purchase_orders,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'receipt_date' => ['required', 'date'],
            'invoice_reference' => ['nullable', 'string', 'max:255'],
            'delivery_note_number' => ['nullable', 'string', 'max:255'],
            'received_by' => ['nullable', 'exists:users,id'],
            'inspected_by' => ['nullable', 'exists:users,id'],
            'remarks' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_order_item_id' => ['required', 'exists:purchase_order_items,id'],
            'items.*.item_type' => ['required', Rule::in(ProcurementItemType::values())],
            'items.*.asset_category_id' => ['nullable', 'exists:asset_categories,id'],
            'items.*.inventory_item_id' => ['nullable', 'exists:inventory_items,id'],
            'items.*.item_description' => ['nullable', 'string', 'max:255'],
            'items.*.quantity_received' => ['required', 'numeric', 'gt:0'],
            'items.*.quantity_accepted' => ['required', 'numeric', 'gte:0'],
            'items.*.quantity_rejected' => ['nullable', 'numeric', 'gte:0'],
            'items.*.rejection_reason' => ['nullable', 'string', 'max:1000'],
            'items.*.batch_number' => ['nullable', 'string', 'max:80'],
            'items.*.manufacture_date' => ['nullable', 'date'],
            'items.*.expiry_date' => ['nullable', 'date'],
            'items.*.serial_number' => ['nullable', 'string', 'max:1000'],
            'items.*.unit_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.storage_location_id' => ['nullable', 'exists:locations,id'],
            'items.*.room_or_area' => ['nullable', 'string', 'max:120'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            foreach ($this->input('items', []) as $index => $line) {
                $accepted = (float) ($line['quantity_accepted'] ?? 0);
                $rejected = (float) ($line['quantity_rejected'] ?? 0);
                $received = (float) ($line['quantity_received'] ?? 0);
                $key = 'items.'.$index;

                if (round($accepted + $rejected, 2) !== round($received, 2)) {
                    $validator->errors()->add($key.'.quantity_accepted', 'Accepted and rejected quantities must equal the received quantity.');
                }

                if ($rejected > 0 && blank($line['rejection_reason'] ?? null)) {
                    $validator->errors()->add($key.'.rejection_reason', 'A rejection reason is required when any quantity is rejected.');
                }

                if (($line['item_type'] ?? null) === ProcurementItemType::Inventory->value && $accepted > 0) {
                    if (blank($line['batch_number'] ?? null)) {
                        $validator->errors()->add($key.'.batch_number', 'Batch number is required for accepted inventory lines.');
                    }

                    if (blank($line['storage_location_id'] ?? null)) {
                        $validator->errors()->add($key.'.storage_location_id', 'Storage location is required for accepted inventory lines.');
                    }
                }

                if (($line['item_type'] ?? null) === ProcurementItemType::Asset->value && $accepted > 0) {
                    if (blank($line['storage_location_id'] ?? null)) {
                        $validator->errors()->add($key.'.storage_location_id', 'Receiving location is required for accepted asset lines.');
                    }

                    if (floor($accepted) !== $accepted) {
                        $validator->errors()->add($key.'.quantity_accepted', 'Accepted asset quantity must be a whole number.');
                    }
                }

                if (filled($line['manufacture_date'] ?? null) && filled($line['expiry_date'] ?? null) && $line['expiry_date'] < $line['manufacture_date']) {
                    $validator->errors()->add($key.'.expiry_date', 'Expiry date must not be earlier than the manufacture date.');
                }
            }
        });
    }
}
