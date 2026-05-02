<?php

namespace Tests\Feature\Patients;

use App\Models\Patient;
use App\Models\PatientPrescription;
use App\Models\PatientVisit;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrescriptionEditLockTest extends TestCase
{
    use RefreshDatabase;

    public function test_doctor_can_edit_prescription_within_24_hours(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        [$patient, $visit, $prescription] = $this->createPrescriptionContext($doctor);

        $this->actingAs($doctor)
            ->get(route('patients.prescriptions.edit', [$patient, $prescription]))
            ->assertOk();

        $this->actingAs($doctor)
            ->patch(route('patients.prescriptions.update', [$patient, $prescription]), [
                'prescription_date' => now()->toDateTimeString(),
                'instructions' => 'Updated instructions',
                'printable_notes' => 'Updated printable notes',
                'items' => [
                    [
                        'medicine_name' => 'Ibuprofen 400mg',
                        'dosage' => '1 tablet',
                        'frequency' => 'TID',
                        'duration' => '5 days',
                        'instructions' => 'After meals',
                    ],
                ],
            ])
            ->assertRedirect(route('patients.prescriptions.show', [$patient, $prescription]));

        $this->assertDatabaseHas('patient_prescriptions', [
            'id' => $prescription->id,
            'instructions' => 'Updated instructions',
            'printable_notes' => 'Updated printable notes',
        ]);

        $this->assertDatabaseHas('patient_prescription_items', [
            'prescription_id' => $prescription->id,
            'medicine_name' => 'Ibuprofen 400mg',
            'dosage' => '1 tablet',
        ]);
    }

    public function test_doctor_cannot_edit_prescription_after_24_hours(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create(['status' => 'active']);
        $doctor->assignRole('Doctor / Consultant');

        [$patient, $visit, $prescription] = $this->createPrescriptionContext($doctor);
        $prescription->forceFill([
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ])->save();

        $this->actingAs($doctor)
            ->get(route('patients.prescriptions.edit', [$patient, $prescription]))
            ->assertUnprocessable();

        $this->actingAs($doctor)
            ->patch(route('patients.prescriptions.update', [$patient, $prescription]), [
                'prescription_date' => now()->toDateTimeString(),
                'instructions' => 'Should not update',
                'printable_notes' => '',
                'items' => [
                    [
                        'medicine_name' => 'Paracetamol 500mg',
                        'dosage' => '1 tablet',
                        'frequency' => 'BID',
                        'duration' => '3 days',
                        'instructions' => 'After meals',
                    ],
                ],
            ])
            ->assertUnprocessable();

        $this->assertDatabaseMissing('patient_prescriptions', [
            'id' => $prescription->id,
            'instructions' => 'Should not update',
        ]);
    }

    /**
     * @return array{0: Patient, 1: PatientVisit, 2: PatientPrescription}
     */
    protected function createPrescriptionContext(User $doctor): array
    {
        $patient = Patient::query()->create([
            'patient_number' => 'KORT-PAT-2026-660001',
            'full_name' => 'Prescription Lock Patient',
            'gender' => 'female',
            'assigned_doctor_id' => $doctor->id,
        ]);

        $visit = PatientVisit::query()->create([
            'patient_id' => $patient->id,
            'visit_number' => 'KORT-VIS-2026-440001',
            'visit_date' => now(),
            'visit_type' => 'opd',
            'doctor_id' => $doctor->id,
            'chief_complaint' => 'Headache',
        ]);

        $prescription = PatientPrescription::query()->create([
            'patient_id' => $patient->id,
            'visit_id' => $visit->id,
            'doctor_id' => $doctor->id,
            'prescription_number' => 'KORT-RX-2026-550001',
            'prescription_date' => now(),
            'instructions' => 'Initial instructions',
            'printable_notes' => 'Initial notes',
        ]);

        $prescription->items()->create([
            'medicine_name' => 'Paracetamol 500mg',
            'dosage' => '1 tablet',
            'frequency' => 'BID',
            'duration' => '3 days',
            'instructions' => 'After meals',
        ]);

        return [$patient, $visit, $prescription];
    }
}
