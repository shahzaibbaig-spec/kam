<?php

namespace Tests\Feature\Patients;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Patient;
use App\Models\PatientPrescription;
use App\Models\PatientVisit;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DoctorPatientExperienceTest extends TestCase
{
    use RefreshDatabase;

    public function test_doctor_dashboard_hides_inventory_and_role_coverage_sections(): void
    {
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create();
        $doctor->assignRole('Doctor / Consultant');

        $this->actingAs($doctor)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertSee('Doctor Dashboard')
            ->assertSee('Assigned Patients')
            ->assertDontSee('Total Assets')
            ->assertDontSee('Active Inventory Items')
            ->assertDontSee('Role coverage')
            ->assertDontSee('Visual summary shells');
    }

    public function test_doctor_receives_notification_when_patient_is_assigned(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);

        $receptionist = User::factory()->create();
        $receptionist->assignRole('Receptionist');

        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        $this->actingAs($receptionist)->post(route('patients.store'), [
            'full_name' => 'Notification Patient',
            'gender' => 'female',
            'assigned_doctor_id' => $doctor->id,
            'checkup_type' => 'opd',
            'chief_complaint' => 'General checkup',
            'visit_date' => now()->toDateTimeString(),
        ])->assertRedirect();

        $doctor->refresh();

        $this->assertSame(1, $doctor->unreadNotifications()->count());
        $this->assertStringContainsString(
            'assigned to you',
            (string) $doctor->unreadNotifications()->first()?->data['title']
        );
    }

    public function test_doctor_global_search_returns_only_assigned_or_related_patients(): void
    {
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        $otherDoctor = User::factory()->create(['status' => 'active']);
        $otherDoctor->assignRole('Doctor / Consultant');

        $visiblePatient = Patient::query()->create([
            'patient_number' => 'KORT-PAT-2026-700001',
            'full_name' => 'Doctor Visible Patient',
            'gender' => 'male',
            'assigned_doctor_id' => $doctor->id,
        ]);

        Patient::query()->create([
            'patient_number' => 'KORT-PAT-2026-700002',
            'full_name' => 'Other Doctor Patient',
            'gender' => 'female',
            'assigned_doctor_id' => $otherDoctor->id,
        ]);

        $response = $this->actingAs($doctor)->getJson(route('search.universal', [
            'q' => 'Patient',
            'limit' => 10,
        ]));

        $response->assertOk();
        $response->assertJsonPath('results.patients.0.id', $visiblePatient->id);
        $response->assertJsonMissing(['title' => 'Other Doctor Patient']);
    }

    public function test_doctor_can_search_available_medicines_for_prescription_autocomplete(): void
    {
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        $category = InventoryCategory::query()->create([
            'name' => 'Autocomplete Medicines',
            'code' => 'AUTO-MED-'.random_int(100, 999),
            'is_active' => true,
        ]);

        InventoryItem::query()->create([
            'item_uuid' => (string) Str::uuid(),
            'inventory_category_id' => $category->id,
            'item_name' => 'Mupirocin Ointment',
            'item_code' => 'MED-MUP-200',
            'unit_of_measure' => 'tube',
            'current_quantity' => 12,
            'reserved_quantity' => 1,
            'is_active' => true,
        ]);

        InventoryItem::query()->create([
            'item_uuid' => (string) Str::uuid(),
            'inventory_category_id' => $category->id,
            'item_name' => 'Mupirocin Out Of Stock',
            'item_code' => 'MED-MUP-000',
            'unit_of_measure' => 'tube',
            'current_quantity' => 0,
            'reserved_quantity' => 0,
            'is_active' => true,
        ]);

        $response = $this->actingAs($doctor)->getJson(route('search.medicines', [
            'q' => 'mup',
            'limit' => 10,
        ]));

        $response->assertOk();
        $response->assertJsonPath('results.0.item_name', 'Mupirocin Ointment');
        $response->assertJsonMissing(['item_name' => 'Mupirocin Out Of Stock']);
    }

    public function test_receptionist_dashboard_shows_only_patient_operations_actions(): void
    {
        $this->seed(AccessControlSeeder::class);

        $receptionist = User::factory()->create(['status' => 'active']);
        $receptionist->assignRole('Receptionist');

        $this->actingAs($receptionist)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertSee('Reception Desk')
            ->assertSee('Add New Patient')
            ->assertSee('Book Doctor Visit')
            ->assertSee('Print Patient Reports')
            ->assertDontSee('Operations Dashboard')
            ->assertDontSee('Total Assets')
            ->assertDontSee('Active Inventory Items')
            ->assertDontSee('Operational attention')
            ->assertDontSee('Role coverage');
    }

    public function test_receptionist_can_view_patient_profile_booking_section_and_print_prescription(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);

        $receptionist = User::factory()->create(['status' => 'active']);
        $receptionist->assignRole('Receptionist');

        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        $patient = Patient::query()->create([
            'patient_number' => 'KORT-PAT-2026-730001',
            'full_name' => 'Reception Print Patient',
            'gender' => 'female',
            'assigned_doctor_id' => $doctor->id,
        ]);

        $visit = PatientVisit::query()->create([
            'patient_id' => $patient->id,
            'visit_number' => 'KORT-VIS-2026-730001',
            'visit_date' => now(),
            'visit_type' => 'opd',
            'doctor_id' => $doctor->id,
            'chief_complaint' => 'Follow-up',
        ]);

        $prescription = PatientPrescription::query()->create([
            'patient_id' => $patient->id,
            'visit_id' => $visit->id,
            'doctor_id' => $doctor->id,
            'prescription_number' => 'KORT-RX-2026-730001',
            'prescription_date' => now(),
            'instructions' => 'Initial instructions',
        ]);

        $prescription->items()->create([
            'medicine_name' => 'Silver Sulfadiazine',
            'dosage' => 'Apply thin layer',
            'frequency' => 'BID',
            'duration' => '7 days',
            'instructions' => 'After cleaning wound',
        ]);

        $this->actingAs($receptionist)
            ->post(route('patients.visits.store', $patient), [
                'visit_date' => now()->toDateTimeString(),
                'visit_type' => 'opd',
                'doctor_id' => $doctor->id,
                'chief_complaint' => 'Follow-up booking by receptionist',
            ])
            ->assertRedirect(route('patients.show', $patient));

        $this->assertDatabaseHas('patient_visits', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'chief_complaint' => 'Follow-up booking by receptionist',
        ]);

        $this->actingAs($receptionist)
            ->get(route('patients.prescriptions.print', [$patient, $prescription]))
            ->assertOk();
    }
}
