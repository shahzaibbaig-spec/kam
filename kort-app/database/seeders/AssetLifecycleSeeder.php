<?php

namespace Database\Seeders;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Department;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;
use App\Services\AssetAssignmentService;
use App\Services\AssetCodeService;
use App\Services\AssetStatusService;
use App\Services\AssetTagService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AssetLifecycleSeeder extends Seeder
{
    public function run(): void
    {
        $actor = User::query()->where('email', 'super.admin@kort.local')->firstOrFail();
        $codeService = app(AssetCodeService::class);
        $tagService = app(AssetTagService::class);
        $assignmentService = app(AssetAssignmentService::class);
        $statusService = app(AssetStatusService::class);

        $categories = $this->seedCategories($actor);
        $departments = Department::query()->get()->keyBy('code');
        $locations = Location::query()->get()->keyBy('code');
        $suppliers = Supplier::query()->get()->keyBy('supplier_code');
        $users = User::query()->get()->keyBy('email');

        $assets = collect($this->assetDefinitions())->map(function (array $definition, int $index) use ($actor, $codeService, $categories, $departments, $locations, $suppliers) {
            $department = $departments[$definition['department_code']];

            return Asset::query()->create([
                'asset_uuid' => $codeService->generateUuid(),
                'asset_code' => $codeService->generateAssetCode($department),
                'asset_name' => $definition['asset_name'],
                'asset_category_id' => $categories[$definition['category_code']]->id,
                'supplier_id' => $suppliers[$definition['supplier_code']]->id,
                'department_id' => $department->id,
                'location_id' => $locations[$definition['location_code']]->id,
                'room_or_area' => $definition['room_or_area'] ?? null,
                'brand' => $definition['brand'],
                'model' => $definition['model'],
                'serial_number' => $definition['serial_number'],
                'manufacturer' => $definition['manufacturer'],
                'purchase_date' => Carbon::parse($definition['purchase_date']),
                'warranty_start' => Carbon::parse($definition['warranty_start']),
                'warranty_end' => Carbon::parse($definition['warranty_end']),
                'purchase_cost' => $definition['purchase_cost'],
                'depreciation_method' => 'straight_line',
                'useful_life_years' => $definition['useful_life_years'] ?? 7,
                'residual_value' => $definition['residual_value'] ?? 0,
                'condition_status' => $definition['condition_status'] ?? AssetConditionStatus::Good->value,
                'asset_status' => $definition['asset_status'] ?? AssetStatus::Available->value,
                'notes' => $definition['notes'] ?? null,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);
        });

        foreach ($assets->take(20) as $asset) {
            $tagService->generate($asset->load(['category', 'department', 'location.department', 'activeTag']), $actor);
        }

        $tagService->markPrinted(
            Asset::query()->whereKey($assets->take(2)->pluck('id'))->with('activeTag')->get(),
            $actor,
        );

        $assignmentService->issue($assets[0], [
            'assignment_type' => 'staff',
            'department_id' => $departments['BICU']->id,
            'location_id' => $locations['LOC-BICU-01']->id,
            'assigned_user_id' => $users['staff.nurse@kort.local']->id,
            'room_or_area' => 'Ventilator Station A',
            'custodian_name' => 'Rabia Iftikhar',
            'issued_at' => now()->subDays(4),
            'expected_return_at' => now()->addDays(3),
            'remarks' => 'Assigned for Burn ICU bedside respiratory support.',
        ], $actor);

        $assignmentService->issue($assets[1], [
            'assignment_type' => 'department',
            'department_id' => $departments['BWRD']->id,
            'location_id' => $locations['LOC-BWRD-01']->id,
            'room_or_area' => 'Ward Monitor Bay',
            'custodian_name' => 'Nadia Rehman',
            'issued_at' => now()->subDays(3),
            'expected_return_at' => now()->addDays(5),
            'remarks' => 'Issued to Burn Ward for overflow critical monitoring.',
        ], $actor);

        $assignmentService->issue($assets[2], [
            'assignment_type' => 'room',
            'department_id' => $departments['BICU']->id,
            'location_id' => $locations['LOC-BICU-02']->id,
            'room_or_area' => 'Isolation Room 2',
            'custodian_name' => 'Isolation Bedside Team',
            'issued_at' => now()->subDays(2),
            'expected_return_at' => now()->addDays(4),
            'remarks' => 'Placed in isolation room for dedicated infusion support.',
        ], $actor);

        $assignmentService->issue($assets[3], [
            'assignment_type' => 'location',
            'department_id' => $departments['BDRU']->id,
            'location_id' => $locations['LOC-BDRU-01']->id,
            'room_or_area' => 'Procedure Prep Zone',
            'custodian_name' => 'Burn Dressing Team',
            'issued_at' => now()->subDays(5),
            'expected_return_at' => now()->subDay(),
            'remarks' => 'Allocated for dressing preparation workflow.',
        ], $actor);

        $assignmentService->return($assets[3], [
            'returned_at' => now()->subDay(),
            'return_condition' => AssetConditionStatus::Good->value,
            'return_to_department_id' => $departments['BDRU']->id,
            'return_to_location_id' => $locations['LOC-BDRU-01']->id,
            'return_to_room_or_area' => 'Procedure Prep Zone',
            'post_return_status' => AssetStatus::Available->value,
            'remarks' => 'Returned after scheduled dressing round.',
        ], $actor);

        $assignmentService->transfer($assets[4], [
            'assignment_type' => 'location',
            'department_id' => $departments['BME']->id,
            'location_id' => $locations['LOC-BME-01']->id,
            'room_or_area' => 'Workshop Bench',
            'custodian_name' => 'Biomedical Workshop',
            'transfer_datetime' => now()->subDays(1),
            'remarks' => 'Transferred for bench inspection after intermittent alarm.',
        ], $actor);

        $assignmentService->issue($assets[5], [
            'assignment_type' => 'staff',
            'department_id' => $departments['BWRD']->id,
            'location_id' => $locations['LOC-BWRD-01']->id,
            'assigned_user_id' => $users['nurse.supervisor@kort.local']->id,
            'room_or_area' => 'Crash Cart Position',
            'custodian_name' => 'Nadia Rehman',
            'issued_at' => now()->subDays(2),
            'expected_return_at' => now()->addDays(7),
            'remarks' => 'Held by nurse supervisor for crash cart coverage.',
        ], $actor);

        $assignmentService->transfer($assets[5], [
            'assignment_type' => 'staff',
            'department_id' => $departments['BWRD']->id,
            'location_id' => $locations['LOC-BWRD-01']->id,
            'assigned_user_id' => $users['staff.nurse@kort.local']->id,
            'room_or_area' => 'Crash Cart Position',
            'custodian_name' => 'Rabia Iftikhar',
            'transfer_datetime' => now()->subDay(),
            'remarks' => 'Transferred to bedside staff for active patient coverage.',
        ], $actor);

        $statusService->change($assets[6], AssetStatus::UnderCleaning, AssetConditionStatus::Good->value, 'Sent for terminal disinfection after isolation room use.', $actor);
        $statusService->change($assets[7], AssetStatus::OutOfOrder, AssetConditionStatus::Damaged->value, 'Device display intermittently failing during checks.', $actor);
        $statusService->change($assets[8], AssetStatus::UnderMaintenance, AssetConditionStatus::Damaged->value, 'Wheel lock assembly requires repair review.', $actor);
        $statusService->change($assets[9], AssetStatus::UnderCalibration, AssetConditionStatus::Good->value, 'Scheduled calibration before next high-acuity shift cycle.', $actor);
    }

    protected function seedCategories(User $actor): array
    {
        $definitions = [
            ['name' => 'Clinical Equipment', 'code' => 'EQP-CLIN', 'parent_code' => null],
            ['name' => 'Burn Treatment Equipment', 'code' => 'EQP-BURN', 'parent_code' => null],
            ['name' => 'Sterilization Equipment', 'code' => 'EQP-STER', 'parent_code' => null],
            ['name' => 'IT Equipment', 'code' => 'ITM-DIGI', 'parent_code' => null],
            ['name' => 'Facility Support Equipment', 'code' => 'FAC-SUP', 'parent_code' => null],
            ['name' => 'Emergency Equipment', 'code' => 'EMR-EQP', 'parent_code' => null],
            ['name' => 'Ventilators', 'code' => 'EQP-VENT', 'parent_code' => 'EQP-CLIN'],
            ['name' => 'Infusion Pumps', 'code' => 'EQP-INF', 'parent_code' => 'EQP-CLIN'],
            ['name' => 'Syringe Pumps', 'code' => 'EQP-SYR', 'parent_code' => 'EQP-CLIN'],
            ['name' => 'Patient Monitors', 'code' => 'EQP-MON', 'parent_code' => 'EQP-CLIN'],
            ['name' => 'ICU Beds', 'code' => 'EQP-BED', 'parent_code' => 'EQP-CLIN'],
            ['name' => 'Dressing Trolleys', 'code' => 'EQP-DTR', 'parent_code' => 'EQP-BURN'],
            ['name' => 'Autoclaves', 'code' => 'EQP-AUT', 'parent_code' => 'EQP-STER'],
            ['name' => 'Suction Machines', 'code' => 'EQP-SUC', 'parent_code' => 'EQP-BURN'],
            ['name' => 'Oxygen Devices', 'code' => 'EQP-OXY', 'parent_code' => 'EMR-EQP'],
            ['name' => 'Tablets', 'code' => 'ITM-TAB', 'parent_code' => 'ITM-DIGI'],
            ['name' => 'Barcode Scanners', 'code' => 'ITM-SCN', 'parent_code' => 'ITM-DIGI'],
            ['name' => 'Printers', 'code' => 'ITM-PRN', 'parent_code' => 'ITM-DIGI'],
            ['name' => 'Refrigerators', 'code' => 'FAC-REF', 'parent_code' => 'FAC-SUP'],
            ['name' => 'UPS Units', 'code' => 'FAC-UPS', 'parent_code' => 'FAC-SUP'],
            ['name' => 'Fire Safety Equipment', 'code' => 'EMR-FSE', 'parent_code' => 'EMR-EQP'],
        ];

        $created = [];

        foreach ($definitions as $definition) {
            $parentId = $definition['parent_code'] ? ($created[$definition['parent_code']]->id ?? null) : null;

            $created[$definition['code']] = AssetCategory::query()->updateOrCreate(
                ['code' => $definition['code']],
                [
                    'name' => $definition['name'],
                    'description' => $definition['name'].' configured for burn center fixed asset control.',
                    'parent_id' => $parentId,
                    'is_active' => true,
                    'created_by' => $actor->id,
                    'updated_by' => $actor->id,
                ]
            );
        }

        return $created;
    }

    protected function assetDefinitions(): array
    {
        return [
            ['asset_name' => 'Hamilton Burn ICU Ventilator A', 'category_code' => 'EQP-VENT', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Hamilton', 'model' => 'G5', 'serial_number' => 'HAM-G5-BICU-1001', 'manufacturer' => 'Hamilton Medical', 'purchase_date' => '2024-01-14', 'warranty_start' => '2024-01-14', 'warranty_end' => '2027-01-13', 'purchase_cost' => 4800000, 'condition_status' => AssetConditionStatus::Excellent->value],
            ['asset_name' => 'Hamilton Burn ICU Ventilator B', 'category_code' => 'EQP-VENT', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-02', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Hamilton', 'model' => 'G5', 'serial_number' => 'HAM-G5-BICU-1002', 'manufacturer' => 'Hamilton Medical', 'purchase_date' => '2024-01-14', 'warranty_start' => '2024-01-14', 'warranty_end' => '2027-01-13', 'purchase_cost' => 4800000, 'condition_status' => AssetConditionStatus::Excellent->value],
            ['asset_name' => 'Baxter Infusion Pump 01', 'category_code' => 'EQP-INF', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Baxter', 'model' => 'Sigma Spectrum', 'serial_number' => 'BAX-INF-2001', 'manufacturer' => 'Baxter', 'purchase_date' => '2024-03-02', 'warranty_start' => '2024-03-02', 'warranty_end' => '2027-03-01', 'purchase_cost' => 650000],
            ['asset_name' => 'Terumo Syringe Pump 01', 'category_code' => 'EQP-SYR', 'department_code' => 'BDRU', 'location_code' => 'LOC-BDRU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Terumo', 'model' => 'TE-SS830', 'serial_number' => 'TER-SYR-3001', 'manufacturer' => 'Terumo', 'purchase_date' => '2024-04-10', 'warranty_start' => '2024-04-10', 'warranty_end' => '2027-04-09', 'purchase_cost' => 420000],
            ['asset_name' => 'GE Patient Monitor 01', 'category_code' => 'EQP-MON', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'GE', 'model' => 'B105', 'serial_number' => 'GE-MON-4001', 'manufacturer' => 'GE Healthcare', 'purchase_date' => '2023-12-21', 'warranty_start' => '2023-12-21', 'warranty_end' => '2026-12-20', 'purchase_cost' => 890000],
            ['asset_name' => 'GE Patient Monitor 02', 'category_code' => 'EQP-MON', 'department_code' => 'BWRD', 'location_code' => 'LOC-BWRD-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'GE', 'model' => 'B105', 'serial_number' => 'GE-MON-4002', 'manufacturer' => 'GE Healthcare', 'purchase_date' => '2023-12-21', 'warranty_start' => '2023-12-21', 'warranty_end' => '2026-12-20', 'purchase_cost' => 890000],
            ['asset_name' => 'Hillrom Burn ICU Bed 01', 'category_code' => 'EQP-BED', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Hillrom', 'model' => 'TotalCare', 'serial_number' => 'HIL-BED-5001', 'manufacturer' => 'Hillrom', 'purchase_date' => '2022-08-18', 'warranty_start' => '2022-08-18', 'warranty_end' => '2027-08-17', 'purchase_cost' => 3500000],
            ['asset_name' => 'Hillrom Burn ICU Bed 02', 'category_code' => 'EQP-BED', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-02', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Hillrom', 'model' => 'TotalCare', 'serial_number' => 'HIL-BED-5002', 'manufacturer' => 'Hillrom', 'purchase_date' => '2022-08-18', 'warranty_start' => '2022-08-18', 'warranty_end' => '2027-08-17', 'purchase_cost' => 3500000],
            ['asset_name' => 'Burn Dressing Trolley Alpha', 'category_code' => 'EQP-DTR', 'department_code' => 'BDRU', 'location_code' => 'LOC-BDRU-01', 'supplier_code' => 'SUP-SHT', 'brand' => 'SteriSafe', 'model' => 'BT-12', 'serial_number' => 'SST-DTR-6001', 'manufacturer' => 'SteriSafe', 'purchase_date' => '2024-02-05', 'warranty_start' => '2024-02-05', 'warranty_end' => '2026-02-04', 'purchase_cost' => 185000],
            ['asset_name' => 'Burn Dressing Trolley Bravo', 'category_code' => 'EQP-DTR', 'department_code' => 'BDRU', 'location_code' => 'LOC-BDRU-01', 'supplier_code' => 'SUP-SHT', 'brand' => 'SteriSafe', 'model' => 'BT-12', 'serial_number' => 'SST-DTR-6002', 'manufacturer' => 'SteriSafe', 'purchase_date' => '2024-02-05', 'warranty_start' => '2024-02-05', 'warranty_end' => '2026-02-04', 'purchase_cost' => 185000],
            ['asset_name' => 'Steam Autoclave 01', 'category_code' => 'EQP-AUT', 'department_code' => 'CBST', 'location_code' => 'LOC-CBST-01', 'supplier_code' => 'SUP-SHT', 'brand' => 'Getinge', 'model' => 'HS66', 'serial_number' => 'GET-AUT-7001', 'manufacturer' => 'Getinge', 'purchase_date' => '2023-05-11', 'warranty_start' => '2023-05-11', 'warranty_end' => '2026-05-10', 'purchase_cost' => 2700000],
            ['asset_name' => 'Steam Autoclave 02', 'category_code' => 'EQP-AUT', 'department_code' => 'CBST', 'location_code' => 'LOC-CBST-01', 'supplier_code' => 'SUP-SHT', 'brand' => 'Getinge', 'model' => 'HS66', 'serial_number' => 'GET-AUT-7002', 'manufacturer' => 'Getinge', 'purchase_date' => '2023-05-11', 'warranty_start' => '2023-05-11', 'warranty_end' => '2026-05-10', 'purchase_cost' => 2700000],
            ['asset_name' => 'Portable Suction Machine 01', 'category_code' => 'EQP-SUC', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Laerdal', 'model' => 'LSU', 'serial_number' => 'LAE-SUC-8001', 'manufacturer' => 'Laerdal', 'purchase_date' => '2024-06-01', 'warranty_start' => '2024-06-01', 'warranty_end' => '2027-05-31', 'purchase_cost' => 320000],
            ['asset_name' => 'Portable Suction Machine 02', 'category_code' => 'EQP-SUC', 'department_code' => 'BWRD', 'location_code' => 'LOC-BWRD-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Laerdal', 'model' => 'LSU', 'serial_number' => 'LAE-SUC-8002', 'manufacturer' => 'Laerdal', 'purchase_date' => '2024-06-01', 'warranty_start' => '2024-06-01', 'warranty_end' => '2027-05-31', 'purchase_cost' => 320000],
            ['asset_name' => 'Oxygen Flow Meter 01', 'category_code' => 'EQP-OXY', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Precision', 'model' => 'Flow-300', 'serial_number' => 'PRC-OXY-9001', 'manufacturer' => 'Precision Medical', 'purchase_date' => '2024-07-12', 'warranty_start' => '2024-07-12', 'warranty_end' => '2026-07-11', 'purchase_cost' => 68000],
            ['asset_name' => 'Oxygen Flow Meter 02', 'category_code' => 'EQP-OXY', 'department_code' => 'BWRD', 'location_code' => 'LOC-BWRD-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Precision', 'model' => 'Flow-300', 'serial_number' => 'PRC-OXY-9002', 'manufacturer' => 'Precision Medical', 'purchase_date' => '2024-07-12', 'warranty_start' => '2024-07-12', 'warranty_end' => '2026-07-11', 'purchase_cost' => 68000],
            ['asset_name' => 'Medication Refrigerator 01', 'category_code' => 'FAC-REF', 'department_code' => 'BPH', 'location_code' => 'LOC-BPH-01', 'supplier_code' => 'SUP-SHT', 'brand' => 'Haier', 'model' => 'HYC-290', 'serial_number' => 'HAI-REF-1101', 'manufacturer' => 'Haier Biomedical', 'purchase_date' => '2024-01-25', 'warranty_start' => '2024-01-25', 'warranty_end' => '2027-01-24', 'purchase_cost' => 460000],
            ['asset_name' => 'Burn Ward Tablet 01', 'category_code' => 'ITM-TAB', 'department_code' => 'BWRD', 'location_code' => 'LOC-BWRD-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Samsung', 'model' => 'Tab Active', 'serial_number' => 'SAM-TAB-1201', 'manufacturer' => 'Samsung', 'purchase_date' => '2024-08-10', 'warranty_start' => '2024-08-10', 'warranty_end' => '2026-08-09', 'purchase_cost' => 165000],
            ['asset_name' => 'Burn Ward Tablet 02', 'category_code' => 'ITM-TAB', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Samsung', 'model' => 'Tab Active', 'serial_number' => 'SAM-TAB-1202', 'manufacturer' => 'Samsung', 'purchase_date' => '2024-08-10', 'warranty_start' => '2024-08-10', 'warranty_end' => '2026-08-09', 'purchase_cost' => 165000],
            ['asset_name' => 'USB Barcode Scanner 01', 'category_code' => 'ITM-SCN', 'department_code' => 'CBST', 'location_code' => 'LOC-CBST-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Zebra', 'model' => 'DS2208', 'serial_number' => 'ZEB-SCN-1301', 'manufacturer' => 'Zebra', 'purchase_date' => '2024-08-18', 'warranty_start' => '2024-08-18', 'warranty_end' => '2026-08-17', 'purchase_cost' => 45000],
            ['asset_name' => 'USB Barcode Scanner 02', 'category_code' => 'ITM-SCN', 'department_code' => 'CBST', 'location_code' => 'LOC-CBST-02', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Zebra', 'model' => 'DS2208', 'serial_number' => 'ZEB-SCN-1302', 'manufacturer' => 'Zebra', 'purchase_date' => '2024-08-18', 'warranty_start' => '2024-08-18', 'warranty_end' => '2026-08-17', 'purchase_cost' => 45000],
            ['asset_name' => 'Laser Printer 01', 'category_code' => 'ITM-PRN', 'department_code' => 'PROC', 'location_code' => 'LOC-CBST-03', 'supplier_code' => 'SUP-CCDL', 'brand' => 'HP', 'model' => 'LaserJet Pro', 'serial_number' => 'HP-PRN-1401', 'manufacturer' => 'HP', 'purchase_date' => '2023-09-14', 'warranty_start' => '2023-09-14', 'warranty_end' => '2026-09-13', 'purchase_cost' => 78000],
            ['asset_name' => 'Laser Printer 02', 'category_code' => 'ITM-PRN', 'department_code' => 'FIN', 'location_code' => 'LOC-CBST-03', 'supplier_code' => 'SUP-CCDL', 'brand' => 'HP', 'model' => 'LaserJet Pro', 'serial_number' => 'HP-PRN-1402', 'manufacturer' => 'HP', 'purchase_date' => '2023-09-14', 'warranty_start' => '2023-09-14', 'warranty_end' => '2026-09-13', 'purchase_cost' => 78000],
            ['asset_name' => 'UPS Unit 01', 'category_code' => 'FAC-UPS', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'APC', 'model' => 'Smart-UPS 3000', 'serial_number' => 'APC-UPS-1501', 'manufacturer' => 'APC', 'purchase_date' => '2023-06-06', 'warranty_start' => '2023-06-06', 'warranty_end' => '2026-06-05', 'purchase_cost' => 210000],
            ['asset_name' => 'UPS Unit 02', 'category_code' => 'FAC-UPS', 'department_code' => 'BPH', 'location_code' => 'LOC-BPH-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'APC', 'model' => 'Smart-UPS 3000', 'serial_number' => 'APC-UPS-1502', 'manufacturer' => 'APC', 'purchase_date' => '2023-06-06', 'warranty_start' => '2023-06-06', 'warranty_end' => '2026-06-05', 'purchase_cost' => 210000],
            ['asset_name' => 'Fire Extinguisher Cart 01', 'category_code' => 'EMR-FSE', 'department_code' => 'BICU', 'location_code' => 'LOC-BICU-02', 'supplier_code' => 'SUP-SHT', 'brand' => 'SafetyFirst', 'model' => 'Dry Powder 6kg', 'serial_number' => 'SAF-FSE-1601', 'manufacturer' => 'SafetyFirst', 'purchase_date' => '2024-01-09', 'warranty_start' => '2024-01-09', 'warranty_end' => '2027-01-08', 'purchase_cost' => 38000],
            ['asset_name' => 'Fire Extinguisher Cart 02', 'category_code' => 'EMR-FSE', 'department_code' => 'BWRD', 'location_code' => 'LOC-BWRD-01', 'supplier_code' => 'SUP-SHT', 'brand' => 'SafetyFirst', 'model' => 'Dry Powder 6kg', 'serial_number' => 'SAF-FSE-1602', 'manufacturer' => 'SafetyFirst', 'purchase_date' => '2024-01-09', 'warranty_start' => '2024-01-09', 'warranty_end' => '2027-01-08', 'purchase_cost' => 38000],
            ['asset_name' => 'Biomedical Workshop Tablet', 'category_code' => 'ITM-TAB', 'department_code' => 'BME', 'location_code' => 'LOC-BME-01', 'supplier_code' => 'SUP-CCDL', 'brand' => 'Samsung', 'model' => 'Tab Active', 'serial_number' => 'SAM-TAB-1203', 'manufacturer' => 'Samsung', 'purchase_date' => '2024-08-10', 'warranty_start' => '2024-08-10', 'warranty_end' => '2026-08-09', 'purchase_cost' => 165000],
        ];
    }
}
