<?php

namespace App\Http\Requests\Pharmacy;

use Illuminate\Foundation\Http\FormRequest;

class PharmacyDispenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dispensed_at' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string', 'max:6000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.prescription_item_id' => ['required', 'integer', 'exists:patient_prescription_items,id'],
            'items.*.dispensed_quantity' => ['nullable', 'numeric', 'min:0'],
            'items.*.remarks' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

