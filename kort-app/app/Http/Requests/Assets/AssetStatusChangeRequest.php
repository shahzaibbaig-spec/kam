<?php

namespace App\Http\Requests\Assets;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssetStatusChangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_status' => ['required', Rule::in(AssetStatus::values())],
            'condition_status' => ['nullable', Rule::in(AssetConditionStatus::values())],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
