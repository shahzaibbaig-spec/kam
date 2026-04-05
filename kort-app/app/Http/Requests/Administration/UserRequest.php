<?php

namespace App\Http\Requests\Administration;

use App\Enums\UserStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;
        $statuses = array_map(fn (UserStatus $status) => $status->value, UserStatus::cases());

        return [
            'department_id' => ['nullable', 'exists:departments,id'],
            'default_location_id' => ['nullable', 'exists:locations,id'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'employee_id' => ['nullable', 'string', 'max:40', Rule::unique('users', 'employee_id')->ignore($userId)],
            'phone' => ['nullable', 'string', 'max:30'],
            'designation' => ['required', 'string', 'max:120'],
            'status' => ['required', Rule::in($statuses)],
            'password' => [$userId ? 'nullable' : 'required', 'confirmed', Password::defaults()],
            'role_names' => ['required', 'array', 'min:1'],
            'role_names.*' => ['string', Rule::exists('roles', 'name')],
            'two_factor_required' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'two_factor_required' => $this->boolean('two_factor_required'),
        ]);
    }
}
