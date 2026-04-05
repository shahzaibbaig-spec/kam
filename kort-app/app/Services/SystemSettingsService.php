<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;

class SystemSettingsService
{
    public function generalDefaults(): array
    {
        return [
            'product_name' => config('kort.product_name'),
            'organization_name' => config('kort.burn_center_name'),
            'date_format' => 'Y-m-d',
            'currency' => config('kort.procurement_currency', 'PKR'),
            'timezone' => config('app.timezone'),
            'default_pagination_size' => 15,
            'inventory_near_expiry_days' => config('kort.inventory_near_expiry_days', 60),
            'low_stock_warning_threshold' => 5,
            'maintenance_due_soon_days' => 14,
            'support_email' => '',
            'support_phone' => '',
        ];
    }

    public function labelDefaults(): array
    {
        return [
            'asset_tag_pattern' => config('kort.asset_tag_pattern'),
            'label_size' => '50x25',
            'barcode_enabled' => true,
            'qr_enabled' => true,
            'include_department' => true,
            'include_location' => true,
            'print_margin_mm' => 2,
            'label_footer' => 'Hospital asset label',
        ];
    }

    public function notificationDefaults(): array
    {
        return [
            'email_audit_alerts' => false,
            'low_stock_digest' => true,
            'maintenance_reminders' => true,
            'procurement_approval_alerts' => true,
            'label_print_alerts' => false,
            'daily_digest_hour' => 8,
        ];
    }

    public function generalValues(): array
    {
        return $this->groupValues('general', $this->generalDefaults());
    }

    public function labelValues(): array
    {
        return $this->groupValues('labels', $this->labelDefaults());
    }

    public function notificationValues(): array
    {
        return $this->groupValues('notifications', $this->notificationDefaults());
    }

    public function settingsNavigation(?User $user): array
    {
        if (! $user || ! $user->can('settings.view')) {
            return [];
        }

        $items = [
            [
                'key' => 'general',
                'title' => 'General Settings',
                'description' => 'Hospital identity, defaults, time, pagination, and operational thresholds.',
                'route' => 'settings.general',
                'permission' => 'settings.view',
            ],
            [
                'key' => 'labels',
                'title' => 'Labels & Barcode',
                'description' => 'Asset label format, barcode and QR display, and print layout defaults.',
                'route' => 'settings.labels',
                'permission' => 'settings.view',
            ],
            [
                'key' => 'notifications',
                'title' => 'Notifications',
                'description' => 'Reminder toggles and alert placeholders for key operational workflows.',
                'route' => 'settings.notifications',
                'permission' => 'settings.view',
            ],
        ];

        return collect($items)
            ->filter(fn (array $item) => $user->can($item['permission']))
            ->values()
            ->all();
    }

    public function saveGroup(string $group, array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                [
                    'group' => $group,
                    'label' => str($key)->replace('_', ' ')->title()->toString(),
                    'value' => $value,
                    'is_encrypted' => false,
                ],
            );
        }
    }

    protected function groupValues(string $group, array $defaults): array
    {
        $stored = Setting::query()
            ->where('group', $group)
            ->get()
            ->mapWithKeys(fn (Setting $setting) => [$setting->key => $setting->value])
            ->all();

        return array_replace($defaults, $stored);
    }
}
