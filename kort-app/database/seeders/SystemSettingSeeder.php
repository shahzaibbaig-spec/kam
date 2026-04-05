<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'group' => 'general',
                'key' => 'general.application_name',
                'label' => 'Application Name',
                'value' => ['text' => 'KORT Assest Managment System'],
            ],
            [
                'group' => 'assets',
                'key' => 'assets.tag_format',
                'label' => 'Asset Tag Format',
                'value' => ['pattern' => 'BC-KORT-[DEPARTMENT]-[TYPE]-[SEQUENCE]'],
            ],
            [
                'group' => 'alerts',
                'key' => 'alerts.near_expiry_threshold_days',
                'label' => 'Near Expiry Threshold',
                'value' => ['days' => 60],
            ],
            [
                'group' => 'burn_center',
                'key' => 'burn_center.storage_rules',
                'label' => 'Burn Center Storage Rules',
                'value' => [
                    'sterile_separation' => true,
                    'quarantine_enabled' => true,
                    'emergency_reserve_enabled' => true,
                    'temperature_monitoring_enabled' => true,
                ],
            ],
        ];

        foreach ($settings as $setting) {
            Setting::query()->updateOrCreate(
                ['key' => $setting['key']],
                $setting + ['is_encrypted' => false]
            );
        }
    }
}
