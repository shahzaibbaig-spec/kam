<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class GeneralSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('settings.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'product_name' => ['required', 'string', 'max:150'],
            'organization_name' => ['required', 'string', 'max:150'],
            'date_format' => ['required', 'string', 'max:50'],
            'currency' => ['required', 'string', 'max:20'],
            'timezone' => ['required', 'string', 'max:80'],
            'default_pagination_size' => ['required', 'integer', 'min:10', 'max:100'],
            'inventory_near_expiry_days' => ['required', 'integer', 'min:1', 'max:365'],
            'low_stock_warning_threshold' => ['required', 'integer', 'min:0', 'max:9999'],
            'maintenance_due_soon_days' => ['required', 'integer', 'min:1', 'max:365'],
            'support_email' => ['nullable', 'email'],
            'support_phone' => ['nullable', 'string', 'max:50'],
        ];
    }
}
