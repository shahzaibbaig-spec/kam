<?php

namespace Tests\Feature\Patients;

use App\Models\Patient;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PatientManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_hospital_admin_can_search_patients_by_cnic_patient_number_and_name(): void
    {
        $this->seed(AccessControlSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('Hospital Admin');

        $patient = Patient::query()->create([
            'patient_number' => 'PT-20260501-0001',
            'cnic' => '12345-1234567-1',
            'full_name' => 'Ayesha Khan',
            'father_name' => 'Yousaf Khan',
            'gender' => 'female',
        ]);

        Patient::query()->create([
            'patient_number' => 'PT-20260501-0002',
            'cnic' => '42345-7654321-0',
            'full_name' => 'Bilal Ahmed',
            'father_name' => 'Akbar Ahmed',
            'gender' => 'male',
        ]);

        $this->actingAs($user)
            ->get(route('patients.index', ['search' => $patient->cnic]))
            ->assertRedirect(route('patients.show', $patient));

        $this->actingAs($user)
            ->get(route('patients.index', ['search' => $patient->patient_number]))
            ->assertRedirect(route('patients.show', $patient));

        $this->actingAs($user)
            ->get(route('patients.index', ['search' => 'Ayesha']))
            ->assertOk()
            ->assertSee('Ayesha Khan');
    }

    public function test_doctor_can_record_visit_with_diagnosis_and_prescription(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);

        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create();
        $doctor->assignRole('Doctor / Consultant');

        $patient = Patient::query()->create([
            'patient_number' => 'PT-20260501-0003',
            'cnic' => '54321-1234567-8',
            'full_name' => 'Sana Ali',
            'father_name' => 'Rashid Ali',
            'gender' => 'female',
        ]);

        $response = $this->actingAs($doctor)->post(route('patients.diagnoses.store', $patient), [
            'visit_date' => now()->toDateTimeString(),
            'visit_type' => 'opd',
            'doctor_id' => $doctor->id,
            'chief_complaint' => 'High fever for three days.',
            'vitals' => 'Temp 101F, BP 110/70',
            'notes' => 'Vitals stable. No respiratory distress.',
            'diagnosis' => 'Viral fever',
            'clinical_notes' => 'Monitor for 48 hours.',
            'severity' => 'moderate',
            'follow_up_date' => now()->addDays(2)->toDateString(),
        ]);

        $this->assertDatabaseCount('patient_visits', 1);
        $visitId = (int) DB::table('patient_visits')->value('id');

        $response->assertRedirect(route('patients.prescriptions.create', [$patient, $visitId]));

        $this->assertDatabaseHas('patient_visits', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'chief_complaint' => 'High fever for three days.',
        ]);

        $this->assertDatabaseHas('patient_diagnoses', [
            'diagnosis' => 'Viral fever',
            'severity' => 'moderate',
        ]);
    }
}
