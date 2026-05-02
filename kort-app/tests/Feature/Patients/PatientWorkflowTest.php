<?php

namespace Tests\Feature\Patients;

use App\Models\Patient;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PatientWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_receptionist_can_admit_patient(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);

        $receptionist = User::factory()->create();
        $receptionist->assignRole('Receptionist');

        $patient = Patient::query()->create([
            'patient_number' => 'PT-20260501-1001',
            'cnic' => '42101-1111111-1',
            'full_name' => 'Admission Test Patient',
            'father_name' => 'Test Father',
            'gender' => 'male',
        ]);

        $response = $this->actingAs($receptionist)->post(route('patients.admissions.store', $patient), [
            'admission_date' => now()->toDateString(),
            'admission_time' => now()->format('H:i'),
            'admission_reason' => 'Observation for burn injury.',
            'initial_condition' => 'Stable',
            'status' => 'admitted',
        ]);

        $this->assertDatabaseHas('patient_admissions', [
            'patient_id' => $patient->id,
            'status' => 'admitted',
        ]);

        $admissionId = (int) DB::table('patient_admissions')->value('id');
        $response->assertRedirect(route('patients.admissions.show', [$patient, $admissionId]));
    }

    public function test_doctor_can_create_prescription_and_print_pdf(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create();
        $doctor->assignRole('Doctor / Consultant');

        $patient = Patient::query()->create([
            'patient_number' => 'PT-20260501-1002',
            'cnic' => '42101-2222222-2',
            'full_name' => 'Prescription Test Patient',
            'father_name' => 'Test Father',
            'gender' => 'female',
        ]);

        $diagnosisResponse = $this->actingAs($doctor)->post(route('patients.diagnoses.store', $patient), [
            'visit_date' => now()->toDateTimeString(),
            'visit_type' => 'opd',
            'doctor_id' => $doctor->id,
            'chief_complaint' => 'Severe headache',
            'vitals' => 'BP 118/78',
            'notes' => 'No neurological deficit',
            'diagnosis' => 'Migraine',
            'clinical_notes' => 'Hydration advised',
            'severity' => 'moderate',
            'follow_up_date' => now()->addDays(5)->toDateString(),
        ]);

        $visitId = (int) DB::table('patient_visits')->value('id');
        $diagnosisResponse->assertRedirect(route('patients.prescriptions.create', [$patient, $visitId]));

        $prescriptionResponse = $this->actingAs($doctor)->post(route('patients.prescriptions.store', [$patient, $visitId]), [
            'prescription_date' => now()->toDateTimeString(),
            'instructions' => 'Sleep well and hydrate.',
            'printable_notes' => 'Avoid bright lights.',
            'items' => [
                [
                    'medicine_name' => 'Paracetamol 500mg',
                    'dosage' => '1 tablet',
                    'frequency' => 'BID',
                    'duration' => '3 days',
                    'instructions' => 'After meals',
                ],
            ],
        ]);

        $prescriptionId = (int) DB::table('patient_prescriptions')->value('id');
        $prescriptionResponse->assertRedirect(route('patients.prescriptions.show', [$patient, $prescriptionId]));

        $this->actingAs($doctor)
            ->get(route('patients.prescriptions.print', [$patient, $prescriptionId]))
            ->assertOk()
            ->assertSee('Prescription');

        $this->actingAs($doctor)
            ->get(route('patients.prescriptions.pdf', [$patient, $prescriptionId]))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }
}
