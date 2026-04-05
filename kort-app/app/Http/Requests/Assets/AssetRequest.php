<?php

namespace App\Http\Requests\Assets;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $assetId = $this->route('asset')?->id;

        return [
            'asset_name' => ['required', 'string', 'max:160'],
            'asset_code' => ['nullable', 'string', 'max:50', Rule::unique('assets', 'asset_code')->ignore($assetId)],
            'asset_category_id' => ['required', 'exists:asset_categories,id'],
            'brand' => ['nullable', 'string', 'max:120'],
            'model' => ['nullable', 'string', 'max:120'],
            'serial_number' => ['nullable', 'string', 'max:120', Rule::unique('assets', 'serial_number')->ignore($assetId)],
            'manufacturer' => ['nullable', 'string', 'max:120'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'purchase_date' => ['nullable', 'date'],
            'warranty_start' => ['nullable', 'date', 'after_or_equal:purchase_date'],
            'warranty_end' => ['nullable', 'date', 'after_or_equal:warranty_start'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'depreciation_method' => ['nullable', 'string', 'max:30'],
            'useful_life_years' => ['nullable', 'integer', 'min:0', 'max:100'],
            'residual_value' => ['nullable', 'numeric', 'min:0'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'room_or_area' => ['nullable', 'string', 'max:120'],
            'assigned_user_id' => ['nullable', 'exists:users,id'],
            'assigned_department_id' => ['nullable', 'exists:departments,id'],
            'assigned_location_id' => ['nullable', 'exists:locations,id'],
            'custodian_name' => ['nullable', 'string', 'max:120'],
            'condition_status' => ['required', Rule::in(AssetConditionStatus::values())],
            'asset_status' => ['required', Rule::in(AssetStatus::values())],
            'notes' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'max:4096', 'mimes:jpg,jpeg,png,webp'],
        ];
    }
}
