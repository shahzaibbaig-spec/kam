<?php

namespace Tests\Feature\Pharmacy;

use App\Enums\InventoryBatchStatus;
use App\Models\InventoryBatch;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Patient;
use App\Models\PatientPrescription;
use App\Models\PatientPrescriptionItem;
use App\Models\PatientVisit;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PharmacyDispensingModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_pharmacist_can_search_prescription_by_cnic_and_view_prescription(): void
    {
        $this->seed(AccessControlSeeder::class);

        [$pharmacist] = $this->createUsers();
        [$patient, $prescription, $item] = $this->createPrescriptionContext('12345-1234567-1', 10, 50);

        $this->actingAs($pharmacist)
            ->get(route('pharmacy.lookup', ['query' => $patient->cnic]))
            ->assertOk()
            ->assertSee($prescription->prescription_number)
            ->assertSee($patient->full_name)
            ->assertSee($item->medicine_name);
    }

    public function test_pharmacist_cannot_edit_doctor_prescription(): void
    {
        $this->seed(AccessControlSeeder::class);
        [$pharmacist] = $this->createUsers();
        [$patient, $prescription] = $this->createPrescriptionContext('12345-1234567-2', 10, 50);

        $this->actingAs($pharmacist)
            ->get(route('patients.prescriptions.edit', [$patient, $prescription]))
            ->assertForbidden();
    }

    public function test_pharmacist_cannot_change_inventory_records(): void
    {
        $this->seed(AccessControlSeeder::class);
        [$pharmacist] = $this->createUsers();

        $blockedRoutes = [
            'inventory.items.create',
            'inventory.categories.create',
            'inventory.receipts.create',
            'inventory.transfers.create',
            'inventory.returns.create',
            'inventory.adjustments.create',
            'procurement.suppliers.index',
        ];

        foreach ($blockedRoutes as $routeName) {
            $this->actingAs($pharmacist)->get(route($routeName))->assertForbidden();
        }
    }

    public function test_dispensing_reduces_inventory_and_creates_pharmacy_transaction_linkage(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);
        [$pharmacist] = $this->createUsers();
        [$patient, $prescription, $prescriptionItem, $inventoryItem, $batch] = $this->createPrescriptionContext('12345-1234567-3', 10, 50);

        $this->actingAs($pharmacist)
            ->post(route('pharmacy.dispense.store', $prescription), [
                'dispensed_at' => now()->toDateTimeString(),
                'items' => [
                    [
                        'prescription_item_id' => $prescriptionItem->id,
                        'dispensed_quantity' => 4,
                    ],
                ],
            ])
            ->assertRedirect(route('pharmacy.lookup', ['prescription' => $prescription->id]));

        $this->assertDatabaseHas('inventory_batches', [
            'id' => $batch->id,
            'available_quantity' => 46.00,
            'issued_quantity' => 4.00,
        ]);

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventoryItem->id,
            'current_quantity' => 46.00,
            'issued_quantity' => 4.00,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $inventoryItem->id,
            'transaction_type' => 'pharmacy_dispensed',
            'patient_id' => $patient->id,
            'prescription_id' => $prescription->id,
            'pharmacist_id' => $pharmacist->id,
        ]);
    }

    public function test_expired_batch_cannot_be_dispensed(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);
        [$pharmacist] = $this->createUsers();
        [, $prescription, $prescriptionItem, $inventoryItem, $batch] = $this->createPrescriptionContext('12345-1234567-4', 10, 5);

        $batch->forceFill([
            'expiry_date' => now()->subDay()->toDateString(),
            'status' => InventoryBatchStatus::Active->value,
        ])->save();

        $this->actingAs($pharmacist)
            ->from(route('pharmacy.lookup', ['query' => $prescription->patient->cnic]))
            ->post(route('pharmacy.dispense.store', $prescription), [
                'items' => [
                    [
                        'prescription_item_id' => $prescriptionItem->id,
                        'dispensed_quantity' => 2,
                    ],
                ],
            ])
            ->assertSessionHasErrors('items');

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventoryItem->id,
            'current_quantity' => 5.00,
            'issued_quantity' => 0.00,
        ]);
    }

    public function test_quarantined_batch_cannot_be_dispensed(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);
        [$pharmacist] = $this->createUsers();
        [, $prescription, $prescriptionItem, $inventoryItem, $batch] = $this->createPrescriptionContext('12345-1234567-5', 10, 5);

        $batch->forceFill([
            'status' => InventoryBatchStatus::Quarantined->value,
        ])->save();

        $this->actingAs($pharmacist)
            ->from(route('pharmacy.lookup', ['query' => $prescription->patient->cnic]))
            ->post(route('pharmacy.dispense.store', $prescription), [
                'items' => [
                    [
                        'prescription_item_id' => $prescriptionItem->id,
                        'dispensed_quantity' => 2,
                    ],
                ],
            ])
            ->assertSessionHasErrors('items');

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventoryItem->id,
            'current_quantity' => 5.00,
            'issued_quantity' => 0.00,
        ]);
    }

    public function test_insufficient_stock_blocks_dispensing(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);
        [$pharmacist] = $this->createUsers();
        [, $prescription, $prescriptionItem] = $this->createPrescriptionContext('12345-1234567-6', 10, 2);

        $this->actingAs($pharmacist)
            ->from(route('pharmacy.lookup', ['query' => $prescription->patient->cnic]))
            ->post(route('pharmacy.dispense.store', $prescription), [
                'items' => [
                    [
                        'prescription_item_id' => $prescriptionItem->id,
                        'dispensed_quantity' => 4,
                    ],
                ],
            ])
            ->assertSessionHasErrors('items');
    }

    public function test_prescription_becomes_partially_and_fully_dispensed(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);
        [$pharmacist] = $this->createUsers();
        [, $prescription, $prescriptionItem] = $this->createPrescriptionContext('12345-1234567-7', 10, 20);

        $this->actingAs($pharmacist)
            ->post(route('pharmacy.dispense.store', $prescription), [
                'items' => [
                    [
                        'prescription_item_id' => $prescriptionItem->id,
                        'dispensed_quantity' => 4,
                    ],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('patient_prescriptions', [
            'id' => $prescription->id,
            'dispensing_status' => 'partially_dispensed',
        ]);

        $this->assertDatabaseHas('patient_prescription_items', [
            'id' => $prescriptionItem->id,
            'dispensing_status' => 'partially_dispensed',
            'dispensed_quantity' => 4.00,
            'remaining_quantity' => 6.00,
        ]);

        $this->actingAs($pharmacist)
            ->post(route('pharmacy.dispense.store', $prescription), [
                'items' => [
                    [
                        'prescription_item_id' => $prescriptionItem->id,
                        'dispensed_quantity' => 6,
                    ],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('patient_prescriptions', [
            'id' => $prescription->id,
            'dispensing_status' => 'fully_dispensed',
        ]);

        $this->assertDatabaseHas('patient_prescription_items', [
            'id' => $prescriptionItem->id,
            'dispensing_status' => 'fully_dispensed',
            'dispensed_quantity' => 10.00,
            'remaining_quantity' => 0.00,
        ]);
    }

    public function test_super_admin_can_view_all_period_pharmacy_reports_and_pharmacist_cannot_access_reports(): void
    {
        $this->seed(AccessControlSeeder::class);

        $superAdmin = User::factory()->create(['status' => 'active']);
        $superAdmin->assignRole('Super Admin');

        $pharmacist = User::factory()->create(['status' => 'active']);
        $pharmacist->assignRole('Pharmacist / Medical Store Staff');

        foreach (['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as $period) {
            $this->actingAs($superAdmin)
                ->get(route('pharmacy.reports.index', ['period' => $period]))
                ->assertOk();
        }

        $this->actingAs($pharmacist)
            ->get(route('pharmacy.reports.index', ['period' => 'daily']))
            ->assertForbidden();
    }

    /**
     * @return array{0: User}
     */
    protected function createUsers(): array
    {
        $pharmacist = User::factory()->create(['status' => 'active']);
        $pharmacist->assignRole('Pharmacist / Medical Store Staff');

        return [$pharmacist];
    }

    /**
     * @return array{0: Patient, 1: PatientPrescription, 2: PatientPrescriptionItem, 3: InventoryItem, 4: InventoryBatch}
     */
    protected function createPrescriptionContext(string $cnic, float $prescribedQuantity, float $stockQuantity): array
    {
        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        $patient = Patient::query()->create([
            'patient_number' => 'KORT-PAT-2026-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT),
            'cnic' => $cnic,
            'full_name' => 'Pharmacy Patient '.Str::random(4),
            'gender' => 'male',
            'assigned_doctor_id' => $doctor->id,
        ]);

        $visit = PatientVisit::query()->create([
            'patient_id' => $patient->id,
            'visit_number' => 'KORT-VIS-2026-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT),
            'visit_date' => now(),
            'visit_type' => 'opd',
            'doctor_id' => $doctor->id,
            'chief_complaint' => 'Burn pain',
        ]);

        $prescription = PatientPrescription::query()->create([
            'patient_id' => $patient->id,
            'visit_id' => $visit->id,
            'doctor_id' => $doctor->id,
            'prescription_number' => 'KORT-RX-2026-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT),
            'prescription_date' => now(),
            'dispensing_status' => 'pending',
        ]);

        $category = InventoryCategory::query()->create([
            'name' => 'Pharmacy Medicine',
            'code' => 'PHARM-'.str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT),
            'is_active' => true,
        ]);

        $inventoryItem = InventoryItem::query()->create([
            'item_uuid' => (string) Str::uuid(),
            'inventory_category_id' => $category->id,
            'item_name' => 'Silver Sulfadiazine Cream',
            'item_code' => 'MED-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT),
            'unit_of_measure' => 'tube',
            'current_quantity' => $stockQuantity,
            'reorder_level' => 5,
            'is_active' => true,
        ]);

        $batch = InventoryBatch::query()->create([
            'inventory_item_id' => $inventoryItem->id,
            'batch_number' => 'BATCH-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT),
            'expiry_date' => now()->addMonths(6)->toDateString(),
            'received_quantity' => $stockQuantity,
            'available_quantity' => $stockQuantity,
            'status' => InventoryBatchStatus::Active->value,
        ]);

        $prescriptionItem = PatientPrescriptionItem::query()->create([
            'prescription_id' => $prescription->id,
            'medicine_name' => 'Silver Sulfadiazine Cream',
            'dosage' => 'Apply thin layer',
            'frequency' => 'BID',
            'duration' => '7 days',
            'inventory_item_id' => $inventoryItem->id,
            'prescribed_quantity' => $prescribedQuantity,
            'dispensed_quantity' => 0,
            'remaining_quantity' => $prescribedQuantity,
            'dispensing_status' => 'pending',
        ]);

        return [$patient, $prescription, $prescriptionItem, $inventoryItem, $batch];
    }
}

