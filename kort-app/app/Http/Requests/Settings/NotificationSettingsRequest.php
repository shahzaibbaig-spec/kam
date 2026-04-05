<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class NotificationSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('settings.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'email_audit_alerts' => ['required', 'boolean'],
            'low_stock_digest' => ['required', 'boolean'],
            'maintenance_reminders' => ['required', 'boolean'],
            'procurement_approval_alerts' => ['required', 'boolean'],
            'label_print_alerts' => ['required', 'boolean'],
            'daily_digest_hour' => ['required', 'integer', 'min:0', 'max:23'],
        ];
    }
}
