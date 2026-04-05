<?php

namespace App\Http\Requests\Assets;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use App\Models\Location;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssetReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'returned_at' => ['required', 'date'],
            'return_condition' => ['nullable', Rule::in(AssetConditionStatus::values())],
            'return_to_department_id' => ['nullable', 'exists:departments,id'],
            'return_to_location_id' => ['nullable', 'exists:locations,id'],
            'return_to_room_or_area' => ['nullable', 'string', 'max:120'],
            'post_return_status' => ['nullable', Rule::in([
                AssetStatus::Available->value,
                AssetStatus::UnderCleaning->value,
                AssetStatus::OutOfOrder->value,
            ])],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $departmentId = $this->input('return_to_department_id');
        $locationId = $this->input('return_to_location_id');

        if (blank($departmentId) && filled($locationId)) {
            $departmentId = Location::query()->whereKey($locationId)->value('department_id');
        }

        $this->merge([
            'return_to_department_id' => $departmentId,
        ]);
    }
}
