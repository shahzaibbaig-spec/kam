<?php

namespace App\Http\Controllers\Patients;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Patients\PatientDiagnosisRequest;
use App\Models\Patient;
use App\Models\PatientAdmission;
use App\Models\PatientDiagnosis;
use App\Models\PatientVisit;
use App\Models\User;
use App\Services\PatientNumberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientDiagnosisController extends Controller
{
    public function create(Request $request, Patient $patient): Response
    {
        abort_unless(request()->user()?->can('patient-diagnosis.create'), 403);

        $visitId = $request->integer('visit');
        $pendingVisit = null;
        if ($visitId > 0) {
            $pendingVisit = PatientVisit::query()
                ->where('id', $visitId)
                ->where('patient_id', $patient->id)
                ->whereDoesntHave('diagnoses')
                ->first();
        }

        return Inertia::render('Patients/Diagnoses/Form', [
            'patient' => [
                'id' => $patient->id,
                'patient_number' => $patient->patient_number,
                'full_name' => $patient->full_name,
                'cnic' => $patient->cnic,
            ],
            'options' => [
                'admissions' => PatientAdmission::query()
                    ->where('patient_id', $patient->id)
                    ->where('status', 'admitted')
                    ->latest('admission_date')
                    ->get(['id', 'admission_number', 'admission_date']),
                'doctors' => User::query()
                    ->role('Doctor / Consultant')
                    ->where('status', UserStatus::Active->value)
                    ->orderBy('name')
                    ->get(['id', 'name', 'designation']),
                'visitTypes' => [
                    ['value' => 'opd', 'label' => 'OPD'],
                    ['value' => 'emergency', 'label' => 'Emergency'],
                    ['value' => 'admitted_followup', 'label' => 'Admitted Follow-up'],
                ],
                'severities' => [
                    ['value' => 'low', 'label' => 'Low'],
                    ['value' => 'moderate', 'label' => 'Moderate'],
                    ['value' => 'high', 'label' => 'High'],
                    ['value' => 'critical', 'label' => 'Critical'],
                ],
            ],
            'pendingVisit' => $pendingVisit ? [
                'id' => $pendingVisit->id,
                'visit_number' => $pendingVisit->visit_number,
                'visit_date' => $pendingVisit->visit_date?->format('Y-m-d\TH:i'),
                'visit_type' => $pendingVisit->visit_type,
                'doctor_id' => $pendingVisit->doctor_id,
                'chief_complaint' => $pendingVisit->chief_complaint,
                'vitals' => $pendingVisit->vitals,
                'notes' => $pendingVisit->notes,
                'admission_id' => $pendingVisit->admission_id,
            ] : null,
        ]);
    }

    public function store(PatientDiagnosisRequest $request, Patient $patient, PatientNumberService $numbers): RedirectResponse
    {
        abort_unless($request->user()?->can('patient-diagnosis.create'), 403);

        $validated = $request->validated();

        $visit = null;
        if (filled($validated['visit_id'] ?? null)) {
            $visit = PatientVisit::query()
                ->where('id', $validated['visit_id'])
                ->where('patient_id', $patient->id)
                ->firstOrFail();

            $visit->update([
                'admission_id' => $validated['admission_id'] ?? null,
                'visit_date' => $validated['visit_date'],
                'visit_type' => $validated['visit_type'],
                'doctor_id' => $validated['doctor_id'],
                'chief_complaint' => $validated['chief_complaint'],
                'vitals' => $validated['vitals'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            activity('patients')
                ->performedOn($visit)
                ->causedBy($request->user())
                ->event('patient-visit-updated')
                ->withProperties([
                    'patient_id' => $patient->id,
                    'visit_id' => $visit->id,
                ])
                ->log('Patient visit updated before diagnosis');
        } else {
            $visit = $patient->visits()->create([
                'admission_id' => $validated['admission_id'] ?? null,
                'visit_number' => $numbers->generateVisitNumber(),
                'visit_date' => $validated['visit_date'],
                'visit_type' => $validated['visit_type'],
                'doctor_id' => $validated['doctor_id'],
                'chief_complaint' => $validated['chief_complaint'],
                'vitals' => $validated['vitals'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            activity('patients')
                ->performedOn($visit)
                ->causedBy($request->user())
                ->event('patient-visit-created')
                ->withProperties([
                    'patient_id' => $patient->id,
                    'visit_id' => $visit->id,
                ])
                ->log('Patient visit created');
        }

        $diagnosis = $visit->diagnoses()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $validated['doctor_id'],
            'diagnosis' => $validated['diagnosis'],
            'clinical_notes' => $validated['clinical_notes'] ?? null,
            'severity' => $validated['severity'] ?? null,
            'follow_up_date' => $validated['follow_up_date'] ?? null,
        ]);

        activity('patients')
            ->performedOn($diagnosis)
            ->causedBy($request->user())
            ->event('patient-diagnosis-created')
            ->withProperties([
                'patient_id' => $patient->id,
                'visit_id' => $visit->id,
            ])
            ->log('Patient diagnosis created');

        return redirect()->route('patients.prescriptions.create', [$patient, $visit])->with('success', 'Diagnosis saved. Add prescription now.');
    }

    public function edit(Patient $patient, PatientDiagnosis $diagnosis): Response
    {
        abort_unless(request()->user()?->can('patient-diagnosis.edit'), 403);
        abort_if($diagnosis->patient_id !== $patient->id, 404);

        $diagnosis->load(['visit', 'doctor']);

        return Inertia::render('Patients/Diagnoses/Form', [
            'patient' => [
                'id' => $patient->id,
                'patient_number' => $patient->patient_number,
                'full_name' => $patient->full_name,
                'cnic' => $patient->cnic,
            ],
            'diagnosis' => [
                'id' => $diagnosis->id,
                'visit_id' => $diagnosis->visit_id,
                'admission_id' => $diagnosis->visit?->admission_id,
                'visit_date' => $diagnosis->visit?->visit_date?->format('Y-m-d\TH:i'),
                'visit_type' => $diagnosis->visit?->visit_type,
                'doctor_id' => $diagnosis->doctor_id,
                'chief_complaint' => $diagnosis->visit?->chief_complaint,
                'vitals' => $diagnosis->visit?->vitals,
                'notes' => $diagnosis->visit?->notes,
                'diagnosis' => $diagnosis->diagnosis,
                'clinical_notes' => $diagnosis->clinical_notes,
                'severity' => $diagnosis->severity,
                'follow_up_date' => $diagnosis->follow_up_date?->toDateString(),
            ],
            'options' => [
                'admissions' => PatientAdmission::query()
                    ->where('patient_id', $patient->id)
                    ->where('status', 'admitted')
                    ->latest('admission_date')
                    ->get(['id', 'admission_number', 'admission_date']),
                'doctors' => User::query()
                    ->role('Doctor / Consultant')
                    ->where('status', UserStatus::Active->value)
                    ->orderBy('name')
                    ->get(['id', 'name', 'designation']),
                'visitTypes' => [
                    ['value' => 'opd', 'label' => 'OPD'],
                    ['value' => 'emergency', 'label' => 'Emergency'],
                    ['value' => 'admitted_followup', 'label' => 'Admitted Follow-up'],
                ],
                'severities' => [
                    ['value' => 'low', 'label' => 'Low'],
                    ['value' => 'moderate', 'label' => 'Moderate'],
                    ['value' => 'high', 'label' => 'High'],
                    ['value' => 'critical', 'label' => 'Critical'],
                ],
            ],
        ]);
    }

    public function update(PatientDiagnosisRequest $request, Patient $patient, PatientDiagnosis $diagnosis): RedirectResponse
    {
        abort_unless($request->user()?->can('patient-diagnosis.edit'), 403);
        abort_if($diagnosis->patient_id !== $patient->id, 404);

        $validated = $request->validated();

        $visit = PatientVisit::query()->where('id', $diagnosis->visit_id)->where('patient_id', $patient->id)->firstOrFail();
        $visit->update([
            'admission_id' => $validated['admission_id'] ?? null,
            'visit_date' => $validated['visit_date'],
            'visit_type' => $validated['visit_type'],
            'doctor_id' => $validated['doctor_id'],
            'chief_complaint' => $validated['chief_complaint'],
            'vitals' => $validated['vitals'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $diagnosis->update([
            'doctor_id' => $validated['doctor_id'],
            'diagnosis' => $validated['diagnosis'],
            'clinical_notes' => $validated['clinical_notes'] ?? null,
            'severity' => $validated['severity'] ?? null,
            'follow_up_date' => $validated['follow_up_date'] ?? null,
        ]);

        activity('patients')
            ->performedOn($diagnosis)
            ->causedBy($request->user())
            ->event('patient-diagnosis-updated')
            ->withProperties([
                'patient_id' => $patient->id,
                'visit_id' => $visit->id,
            ])
            ->log('Patient diagnosis updated');

        return redirect()->route('patients.show', $patient)->with('success', 'Diagnosis updated successfully.');
    }
}
