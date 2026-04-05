<?php

namespace App\Http\Requests\Procurement;

use App\Enums\SupplierType;
use App\Models\Supplier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('supplier') instanceof Supplier
            ? ($this->user()?->can('supplier.edit') ?? false)
            : ($this->user()?->can('supplier.create') ?? false);
    }

    public function rules(): array
    {
        $supplierId = $this->route('supplier')?->id;

        return [
            'supplier_code' => ['nullable', 'string', 'max:30', Rule::unique('suppliers', 'supplier_code')->ignore($supplierId)],
            'supplier_name' => ['required', 'string', 'max:255'],
            'supplier_type' => ['required', Rule::in(SupplierType::values())],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'alternate_phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:5000'],
            'city' => ['nullable', 'string', 'max:80'],
            'country' => ['nullable', 'string', 'max:80'],
            'tax_number' => ['nullable', 'string', 'max:80'],
            'registration_number' => ['nullable', 'string', 'max:80'],
            'payment_terms' => ['nullable', 'string', 'max:120'],
            'lead_time_days' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
