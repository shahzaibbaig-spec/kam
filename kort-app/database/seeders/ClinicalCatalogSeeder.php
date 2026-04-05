<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ClinicalCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            ['supplier_name' => 'HealBurn Medical Supplies', 'supplier_code' => 'SUP-HBMS', 'supplier_type' => 'inventory_vendor', 'contact_person' => 'Amina Qureshi', 'phone' => '+92-21-3000-1001', 'email' => 'supply@healburn.example', 'city' => 'Karachi', 'country' => 'Pakistan', 'payment_terms' => '30 days', 'lead_time_days' => 5, 'is_active' => true, 'notes' => 'Primary wound care and antimicrobial dressing vendor.'],
            ['supplier_name' => 'CriticalCare Devices Ltd', 'supplier_code' => 'SUP-CCDL', 'supplier_type' => 'asset_vendor', 'contact_person' => 'Faisal Ahmed', 'phone' => '+92-21-3000-1002', 'email' => 'sales@criticalcaredevices.example', 'city' => 'Karachi', 'country' => 'Pakistan', 'payment_terms' => '45 days', 'lead_time_days' => 21, 'is_active' => true, 'notes' => 'Biomedical and critical care asset supplier.'],
            ['supplier_name' => 'SteriSafe Hospital Traders', 'supplier_code' => 'SUP-SHT', 'supplier_type' => 'mixed', 'contact_person' => 'Mehreen Ali', 'phone' => '+92-21-3000-1003', 'email' => 'orders@sterisafe.example', 'city' => 'Lahore', 'country' => 'Pakistan', 'payment_terms' => '30 days', 'lead_time_days' => 7, 'is_active' => true, 'notes' => 'Sterile storage equipment, PPE, and mixed hospital supplies.'],
            ['supplier_name' => 'MedGuard Pharma Distribution', 'supplier_code' => 'SUP-MGPD', 'supplier_type' => 'inventory_vendor', 'contact_person' => 'Usman Raza', 'phone' => '+92-21-3000-1004', 'email' => 'distribution@medguard.example', 'city' => 'Karachi', 'country' => 'Pakistan', 'payment_terms' => '21 days', 'lead_time_days' => 4, 'is_active' => true, 'notes' => 'Temperature-sensitive medicines and burn creams.'],
            ['supplier_name' => 'BurnLine Equipment Partners', 'supplier_code' => 'SUP-BLEP', 'supplier_type' => 'asset_vendor', 'contact_person' => 'Sara Khan', 'phone' => '+92-21-3000-1005', 'email' => 'support@burnline.example', 'city' => 'Islamabad', 'country' => 'Pakistan', 'payment_terms' => '60 days', 'lead_time_days' => 28, 'is_active' => true, 'notes' => 'High-value equipment and ward mobility assets.'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::query()->updateOrCreate(['supplier_code' => $supplier['supplier_code']], $supplier);
        }
    }
}
