<?php

namespace App\Http\Requests\Patients;

use Illuminate\Foundation\Http\FormRequest;

class PatientPrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prescription_date' => ['required', 'date'],
            'instructions' => ['nullable', 'string', 'max:8000'],
            'printable_notes' => ['nullable', 'string', 'max:8000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_name' => ['required', 'string', 'max:160'],
            'items.*.dosage' => ['required', 'string', 'max:120'],
            'items.*.frequency' => ['required', 'string', 'max:120'],
            'items.*.duration' => ['required', 'string', 'max:120'],
            'items.*.instructions' => ['nullable', 'string', 'max:3000'],
            'items.*.inventory_item_id' => ['nullable', 'integer', 'exists:inventory_items,id'],
            'items.*.prescribed_quantity' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $items = collect((array) $this->input('items', []))
            ->filter(fn (array $entry) => filled($entry['medicine_name'] ?? null))
            ->values()
            ->all();

        $this->merge([
            'items' => $items,
        ]);
    }
}
