<?php

namespace App\Http\Requests\Organization;

use App\Enums\LocationStorageType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $locationId = $this->route('location')?->id;
        $storageTypes = array_map(fn (LocationStorageType $type) => $type->value, LocationStorageType::cases());

        return [
            'department_id' => ['required', 'exists:departments,id'],
            'parent_id' => ['nullable', 'exists:locations,id', Rule::notIn(array_filter([$locationId]))],
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:30', 'regex:/^[A-Z0-9-]+$/', Rule::unique('locations', 'code')->ignore($locationId)],
            'building' => ['nullable', 'string', 'max:100'],
            'floor' => ['nullable', 'string', 'max:50'],
            'room' => ['nullable', 'string', 'max:50'],
            'storage_type' => ['required', Rule::in($storageTypes)],
            'description' => ['nullable', 'string', 'max:1000'],
            'barcode' => ['nullable', 'string', 'max:80', Rule::unique('locations', 'barcode')->ignore($locationId)],
            'is_active' => ['nullable', 'boolean'],
            'is_isolation' => ['nullable', 'boolean'],
            'is_emergency_reserve' => ['nullable', 'boolean'],
            'is_sterile_storage' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper((string) $this->input('code')),
            'is_active' => $this->boolean('is_active'),
            'is_isolation' => $this->boolean('is_isolation'),
            'is_emergency_reserve' => $this->boolean('is_emergency_reserve'),
            'is_sterile_storage' => $this->boolean('is_sterile_storage'),
        ]);
    }
}
