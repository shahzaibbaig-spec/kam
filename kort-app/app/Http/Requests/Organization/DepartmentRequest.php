<?php

namespace App\Http\Requests\Organization;

use App\Enums\DepartmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $departmentId = $this->route('department')?->id;
        $types = array_map(fn (DepartmentType $type) => $type->value, DepartmentType::cases());

        return [
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:25', 'regex:/^[A-Z0-9-]+$/', Rule::unique('departments', 'code')->ignore($departmentId)],
            'type' => ['required', Rule::in($types)],
            'cost_center' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'manager_user_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['nullable', 'boolean'],
            'is_clinical' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper((string) $this->input('code')),
            'is_active' => $this->boolean('is_active'),
            'is_clinical' => $this->boolean('is_clinical'),
        ]);
    }
}
