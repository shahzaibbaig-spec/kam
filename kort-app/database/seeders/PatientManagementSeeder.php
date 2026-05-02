<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Location;
use App\Models\Patient;
use App\Models\PatientAdmission;
use App\Models\PatientDiagnosis;
use App\Models\PatientDocument;
use App\Models\PatientPrescription;
use App\Models\PatientVisit;
use App\Models\User;
use App\Services\PatientNumberService;
use Illuminate\Database\Seeder;

class PatientManagementSeeder extends Seeder
{
    public function run(): void
    {
        $numbers = app(PatientNumberService::class);

        $doctor = User::query()->role('Doctor / Consultant')->first()
            ?? User::query()->where('designation', 'like', '%doctor%')->first()
            ?? User::query()->first();

        $admittedBy = User::query()->role('Receptionist')->first()
            ?? User::query()->role('Hospital Admin')->first()
            ?? $doctor;

        $department = Department::query()->where('is_active', true)->first();
        $ward = Location::query()->where('is_active', true)->first();

        if (! $doctor || ! $admittedBy) {
            return;
        }

        $patient = Patient::query()->updateOrCreate(
            ['cnic' => '42101-1234567-1'],
            [
                'patient_number' => $numbers->generatePatientNumber(),
                'full_name' => 'Demo Patient',
                'father_name' => 'Demo Father',
                'gender' => 'male',
                'date_of_birth' => '1990-01-10',
                'phone' => '03001234567',
                'emergency_contact' => 'Demo Contact / 03007654321',
                'address' => 'Karachi',
                'blood_group' => 'O+',
                'allergies' => 'Penicillin',
                'medical_history' => 'Hypertension',
                'created_by' => $admittedBy->id,
                'updated_by' => $admittedBy->id,
            ]
        );

        $admission = PatientAdmission::query()->firstOrCreate(
            ['patient_id' => $patient->id, 'status' => 'admitted'],
            [
                'admission_number' => $numbers->generateAdmissionNumber(),
                'admission_date' => now()->toDateString(),
                'admission_time' => now()->format('H:i'),
                'department_id' => $department?->id,
                'ward_id' => $ward?->id,
                'room_id' => null,
                'bed_id' => null,
                'admitted_by' => $admittedBy->id,
                'attending_doctor_id' => $doctor->id,
                'admission_reason' => 'Burn injury observation.',
                'initial_condition' => 'Stable.',
            ]
        );

        $visit = PatientVisit::query()->create([
            'patient_id' => $patient->id,
            'admission_id' => $admission->id,
            'visit_number' => $numbers->generateVisitNumber(),
            'visit_date' => now(),
            'visit_type' => 'admitted_followup',
            'doctor_id' => $doctor->id,
            'chief_complaint' => 'Pain and swelling.',
            'vitals' => 'BP 120/80, Pulse 88',
            'notes' => 'Continue dressing and monitor.',
        ]);

        PatientDiagnosis::query()->create([
            'patient_id' => $patient->id,
            'visit_id' => $visit->id,
            'doctor_id' => $doctor->id,
            'diagnosis' => 'Partial thickness burn',
            'clinical_notes' => 'No infection signs.',
            'severity' => 'moderate',
            'follow_up_date' => now()->addDays(3)->toDateString(),
        ]);

        $prescription = PatientPrescription::query()->create([
            'patient_id' => $patient->id,
            'visit_id' => $visit->id,
            'doctor_id' => $doctor->id,
            'prescription_number' => $numbers->generatePrescriptionNumber(),
            'prescription_date' => now(),
            'instructions' => 'Take after meals, keep wound dry.',
            'printable_notes' => 'Return if fever occurs.',
        ]);

        $prescription->items()->createMany([
            [
                'medicine_name' => 'Paracetamol 500mg',
                'dosage' => '1 tablet',
                'frequency' => 'TID',
                'duration' => '5 days',
                'instructions' => 'After meals',
            ],
            [
                'medicine_name' => 'Silver sulfadiazine cream',
                'dosage' => 'Apply thin layer',
                'frequency' => 'BID',
                'duration' => '7 days',
                'instructions' => 'Apply on cleaned wound',
            ],
        ]);

        PatientDocument::query()->create([
            'patient_id' => $patient->id,
            'visit_id' => $visit->id,
            'file_name' => 'sample-lab-report.txt',
            'file_path' => 'patients/documents/sample-lab-report.txt',
            'file_type' => 'text/plain',
            'uploaded_by' => $admittedBy->id,
            'notes' => 'Seeded demo document reference',
        ]);
    }
}
