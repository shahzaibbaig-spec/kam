<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AccessControlSeeder::class,
            HospitalStructureSeeder::class,
            ClinicalCatalogSeeder::class,
            HospitalUserSeeder::class,
            AssetLifecycleSeeder::class,
            InventoryLifecycleSeeder::class,
            ProcurementLifecycleSeeder::class,
            SystemSettingSeeder::class,
        ]);
    }
}
