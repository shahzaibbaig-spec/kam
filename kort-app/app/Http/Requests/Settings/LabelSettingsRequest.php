<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class LabelSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('settings.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'asset_tag_pattern' => ['required', 'string', 'max:255'],
            'label_size' => ['required', 'string', 'max:40'],
            'barcode_enabled' => ['required', 'boolean'],
            'qr_enabled' => ['required', 'boolean'],
            'include_department' => ['required', 'boolean'],
            'include_location' => ['required', 'boolean'],
            'print_margin_mm' => ['required', 'integer', 'min:0', 'max:20'],
            'label_footer' => ['nullable', 'string', 'max:120'],
        ];
    }
}
