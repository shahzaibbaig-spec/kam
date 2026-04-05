<?php

namespace App\Http\Requests\Assets;

use App\Enums\AssetAssignmentType;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssetIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assignment_type' => ['required', Rule::in(AssetAssignmentType::values())],
            'department_id' => ['nullable', 'exists:departments,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'assigned_user_id' => ['nullable', 'exists:users,id'],
            'room_or_area' => ['nullable', 'string', 'max:120'],
            'custodian_name' => ['nullable', 'string', 'max:120'],
            'issued_at' => ['required', 'date'],
            'expected_return_at' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('assignment_type') === AssetAssignmentType::Staff->value && blank($this->input('assigned_user_id'))) {
                $validator->errors()->add('assigned_user_id', 'A target staff member is required for staff issues.');
            }

            if ($this->input('assignment_type') === AssetAssignmentType::Room->value && blank($this->input('room_or_area'))) {
                $validator->errors()->add('room_or_area', 'A room or area is required for room issues.');
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $departmentId = $this->input('department_id');
        $locationId = $this->input('location_id');
        $assignedUserId = $this->input('assigned_user_id');

        if (blank($departmentId) && filled($locationId)) {
            $departmentId = Location::query()->whereKey($locationId)->value('department_id');
        }

        if (blank($departmentId) && filled($assignedUserId)) {
            $departmentId = User::query()->whereKey($assignedUserId)->value('department_id');
        }

        if (blank($locationId) && filled($assignedUserId)) {
            $locationId = User::query()->whereKey($assignedUserId)->value('default_location_id');
        }

        $this->merge([
            'department_id' => $departmentId,
            'location_id' => $locationId,
        ]);
    }
}
