<?php

namespace Database\Seeders;

use App\Enums\DepartmentType;
use App\Enums\LocationStorageType;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Database\Seeder;

class HospitalStructureSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Burn ICU',
                'code' => 'BICU',
                'type' => DepartmentType::BurnClinical->value,
                'cost_center' => 'CC-BICU',
                'description' => 'Critical care unit for severe burn admissions.',
                'is_clinical' => true,
            ],
            [
                'name' => 'Burn Ward',
                'code' => 'BWRD',
                'type' => DepartmentType::BurnClinical->value,
                'cost_center' => 'CC-BWRD',
                'description' => 'General burn inpatient ward.',
                'is_clinical' => true,
            ],
            [
                'name' => 'Burn Dressing Unit',
                'code' => 'BDRU',
                'type' => DepartmentType::BurnClinical->value,
                'cost_center' => 'CC-BDRU',
                'description' => 'Procedure and dressing preparation area.',
                'is_clinical' => true,
            ],
            [
                'name' => 'Central Burn Store',
                'code' => 'CBST',
                'type' => DepartmentType::Stores->value,
                'cost_center' => 'CC-CBST',
                'description' => 'Primary sterile and non-sterile consumable store.',
                'is_clinical' => false,
            ],
            [
                'name' => 'Biomedical Engineering',
                'code' => 'BME',
                'type' => DepartmentType::Biomedical->value,
                'cost_center' => 'CC-BME',
                'description' => 'Maintenance and calibration support team.',
                'is_clinical' => false,
            ],
            [
                'name' => 'Burn Pharmacy',
                'code' => 'BPH',
                'type' => DepartmentType::Pharmacy->value,
                'cost_center' => 'CC-BPH',
                'description' => 'Medicine and temperature-sensitive storage.',
                'is_clinical' => false,
            ],
            [
                'name' => 'Procurement Office',
                'code' => 'PROC',
                'type' => DepartmentType::Procurement->value,
                'cost_center' => 'CC-PROC',
                'description' => 'Supplier and purchasing operations.',
                'is_clinical' => false,
            ],
            [
                'name' => 'Finance Office',
                'code' => 'FIN',
                'type' => DepartmentType::Finance->value,
                'cost_center' => 'CC-FIN',
                'description' => 'Costing and budget review office.',
                'is_clinical' => false,
            ],
        ];

        foreach ($departments as $department) {
            Department::query()->updateOrCreate(
                ['code' => $department['code']],
                $department + ['is_active' => true]
            );
        }

        $locations = [
            ['department_code' => 'BICU', 'name' => 'ICU Bay 1', 'code' => 'LOC-BICU-01', 'storage_type' => LocationStorageType::General->value],
            ['department_code' => 'BICU', 'name' => 'ICU Bay 2', 'code' => 'LOC-BICU-02', 'storage_type' => LocationStorageType::Isolation->value, 'is_isolation' => true],
            ['department_code' => 'BWRD', 'name' => 'Ward Store', 'code' => 'LOC-BWRD-01', 'storage_type' => LocationStorageType::General->value],
            ['department_code' => 'BDRU', 'name' => 'Procedure Room', 'code' => 'LOC-BDRU-01', 'storage_type' => LocationStorageType::Sterile->value, 'is_sterile_storage' => true],
            ['department_code' => 'CBST', 'name' => 'Sterile Store', 'code' => 'LOC-CBST-01', 'storage_type' => LocationStorageType::Sterile->value, 'is_sterile_storage' => true],
            ['department_code' => 'CBST', 'name' => 'Non-Sterile Store', 'code' => 'LOC-CBST-02', 'storage_type' => LocationStorageType::NonSterile->value],
            ['department_code' => 'CBST', 'name' => 'Emergency Reserve Cage', 'code' => 'LOC-CBST-03', 'storage_type' => LocationStorageType::EmergencyReserve->value, 'is_emergency_reserve' => true],
            ['department_code' => 'BPH', 'name' => 'Cold Chain Cabinet', 'code' => 'LOC-BPH-01', 'storage_type' => LocationStorageType::General->value],
            ['department_code' => 'BME', 'name' => 'Workshop Bench', 'code' => 'LOC-BME-01', 'storage_type' => LocationStorageType::General->value],
        ];

        foreach ($locations as $location) {
            $department = Department::query()->where('code', $location['department_code'])->firstOrFail();

            Location::query()->updateOrCreate(
                ['code' => $location['code']],
                [
                    'department_id' => $department->id,
                    'name' => $location['name'],
                    'storage_type' => $location['storage_type'],
                    'building' => 'Burn Center',
                    'floor' => 'Level 2',
                    'room' => null,
                    'barcode' => $location['code'],
                    'description' => $location['name'].' mapped for burn center operations.',
                    'is_active' => true,
                    'is_isolation' => $location['is_isolation'] ?? false,
                    'is_emergency_reserve' => $location['is_emergency_reserve'] ?? false,
                    'is_sterile_storage' => $location['is_sterile_storage'] ?? false,
                ]
            );
        }
    }
}
