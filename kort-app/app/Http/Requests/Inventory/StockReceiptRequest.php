<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StockReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('stock-receipt.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'store_location_id' => ['nullable', 'exists:locations,id'],
            'receipt_date' => ['required', 'date'],
            'invoice_reference' => ['nullable', 'string', 'max:100'],
            'delivery_note_number' => ['nullable', 'string', 'max:100'],
            'received_by' => ['nullable', 'exists:users,id'],
            'remarks' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'items.*.batch_number' => ['required', 'string', 'max:80'],
            'items.*.lot_number' => ['nullable', 'string', 'max:80'],
            'items.*.manufacture_date' => ['nullable', 'date'],
            'items.*.expiry_date' => ['nullable', 'date'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.storage_zone' => ['nullable', 'string', 'max:100'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            foreach ($this->input('items', []) as $index => $item) {
                $manufactureDate = $item['manufacture_date'] ?? null;
                $expiryDate = $item['expiry_date'] ?? null;

                if ($manufactureDate && $expiryDate && $expiryDate < $manufactureDate) {
                    $validator->errors()->add("items.$index.expiry_date", 'Expiry date cannot be before manufacture date.');
                }
            }
        });
    }
}
