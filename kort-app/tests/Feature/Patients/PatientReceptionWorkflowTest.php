<?php

namespace Tests\Feature\Patients;

use App\Models\Patient;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientReceptionWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_number_is_auto_generated_and_manual_value_is_rejected(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);

        $receptionist = User::factory()->create();
        $receptionist->assignRole('Receptionist');

        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        $this->actingAs($receptionist)->post(route('patients.store'), [
            'patient_number' => 'SHOULD-NOT-BE-ALLOWED',
            'full_name' => 'Auto Number Patient',
            'gender' => 'male',
            'assigned_doctor_id' => $doctor->id,
            'checkup_type' => 'opd',
            'chief_complaint' => 'General fever',
            'visit_date' => now()->toDateTimeString(),
        ])->assertSessionHasErrors('patient_number');

        $response = $this->actingAs($receptionist)->post(route('patients.store'), [
            'full_name' => 'Auto Number Patient',
            'gender' => 'male',
            'assigned_doctor_id' => $doctor->id,
            'checkup_type' => 'opd',
            'chief_complaint' => 'General fever',
            'visit_date' => now()->toDateTimeString(),
        ]);

        $patient = Patient::query()->where('full_name', 'Auto Number Patient')->firstOrFail();
        $response->assertRedirect(route('patients.show', $patient));

        $this->assertMatchesRegularExpression('/^KORT-PAT-\d{4}-\d{6}$/', $patient->patient_number);
        $this->assertDatabaseHas('patient_visits', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'visit_type' => 'opd',
        ]);
    }

    public function test_receptionist_assignment_puts_patient_in_selected_doctor_queue(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);

        $receptionist = User::factory()->create();
        $receptionist->assignRole('Receptionist');

        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        $this->actingAs($receptionist)->post(route('patients.store'), [
            'full_name' => 'Queue Assignment Patient',
            'gender' => 'female',
            'assigned_doctor_id' => $doctor->id,
            'checkup_type' => 'emergency',
            'chief_complaint' => 'Burn pain',
            'visit_date' => now()->toDateTimeString(),
        ])->assertRedirect();

        $this->actingAs($doctor)
            ->get(route('patients.queue'))
            ->assertOk()
            ->assertSee('Queue Assignment Patient');
    }
}
