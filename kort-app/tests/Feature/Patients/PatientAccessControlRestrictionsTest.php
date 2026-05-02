<?php

namespace Tests\Feature\Patients;

use App\Models\Patient;
use App\Models\User;
use App\Support\AppNavigation;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientAccessControlRestrictionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_receptionist_cannot_access_inventory_or_procurement_routes(): void
    {
        $this->seed(AccessControlSeeder::class);

        $receptionist = User::factory()->create();
        $receptionist->assignRole('Receptionist');

        $routes = [
            'inventory.items.index',
            'inventory.categories.index',
            'inventory.ledger.index',
            'inventory.scan.index',
            'inventory.receipts.create',
            'procurement.suppliers.index',
            'procurement.requisitions.index',
            'procurement.purchase-orders.index',
            'procurement.goods-receipts.index',
        ];

        foreach ($routes as $routeName) {
            $this->actingAs($receptionist)->get(route($routeName))->assertForbidden();
        }

        $sections = collect(AppNavigation::for($receptionist))->pluck('label')->all();
        $this->assertNotContains('Inventory', $sections);
        $this->assertNotContains('Procurement', $sections);
    }

    public function test_doctor_cannot_access_inventory_or_procurement_routes(): void
    {
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create();
        $doctor->assignRole('Doctor / Consultant');

        $routes = [
            'inventory.items.index',
            'inventory.categories.index',
            'inventory.ledger.index',
            'inventory.scan.index',
            'inventory.receipts.create',
            'procurement.suppliers.index',
            'procurement.requisitions.index',
            'procurement.purchase-orders.index',
            'procurement.goods-receipts.index',
        ];

        foreach ($routes as $routeName) {
            $this->actingAs($doctor)->get(route($routeName))->assertForbidden();
        }

        $this->actingAs($doctor)->get(route('patients.search'))->assertForbidden();

        $sections = collect(AppNavigation::for($doctor))->pluck('label')->all();
        $this->assertNotContains('Inventory', $sections);
        $this->assertNotContains('Procurement', $sections);
        $this->assertNotContains('Settings', $sections);
    }

    public function test_doctor_can_view_only_assigned_patients(): void
    {
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create();
        $doctor->assignRole('Doctor / Consultant');

        $assigned = Patient::query()->create([
            'patient_number' => 'KORT-PAT-2026-900001',
            'full_name' => 'Assigned Patient',
            'gender' => 'male',
            'assigned_doctor_id' => $doctor->id,
        ]);

        $notAssigned = Patient::query()->create([
            'patient_number' => 'KORT-PAT-2026-900002',
            'full_name' => 'Other Patient',
            'gender' => 'female',
        ]);

        $this->actingAs($doctor)->get(route('patients.show', $assigned))->assertOk();
        $this->actingAs($doctor)->get(route('patients.show', $notAssigned))->assertForbidden();
    }
}
