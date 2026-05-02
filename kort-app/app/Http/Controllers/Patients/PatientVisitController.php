<?php

namespace App\Http\Controllers\Patients;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Patients\PatientVisitRequest;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Models\User;
use App\Services\DoctorAssignmentNotifier;
use App\Services\PatientNumberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PatientVisitController extends Controller
{
    public function store(
        PatientVisitRequest $request,
        Patient $patient,
        PatientNumberService $numbers,
        DoctorAssignmentNotifier $doctorAssignmentNotifier
    ): RedirectResponse
    {
        $canCreateVisit = $request->user()?->can('patient-visit.create') ?? false;
        $canAssignDoctor = $request->user()?->can('patient.assign-doctor') ?? false;

        abort_unless($canCreateVisit || $canAssignDoctor, 403);
        abort_unless($canAssignDoctor, 403);

        $validated = $request->validated();
        $doctorId = (int) $validated['doctor_id'];
        $this->ensureDoctorIsActiveDoctor($doctorId);

        $visit = $patient->visits()->create([
            ...$validated,
            'visit_number' => $numbers->generateVisitNumber(),
        ]);

        if ($patient->assigned_doctor_id !== $doctorId) {
            $oldDoctorId = $patient->assigned_doctor_id;
            $patient->update(['assigned_doctor_id' => $doctorId]);

            activity('patients')
                ->performedOn($patient)
                ->causedBy($request->user())
                ->event('patient-doctor-assignment-updated')
                ->withProperties([
                    'patient_id' => $patient->id,
                    'old_assigned_doctor_id' => $oldDoctorId,
                    'new_assigned_doctor_id' => $doctorId,
                    'visit_id' => $visit->id,
                ])
                ->log('Patient assigned doctor updated from visit assignment');
        }

        activity('patients')
            ->performedOn($visit)
            ->causedBy($request->user())
            ->event('patient-visit-created')
            ->withProperties([
                'patient_id' => $patient->id,
                'visit_id' => $visit->id,
                'assigned_doctor_id' => $doctorId,
            ])
            ->log('Patient visit created and assigned');

        $doctorAssignmentNotifier->notify(
            patient: $patient,
            doctorId: $doctorId,
            actor: $request->user(),
            assignmentSource: 'visit',
        );

        return redirect()->route('patients.show', $patient)->with('success', 'Visit assigned to doctor successfully.');
    }

    public function update(
        PatientVisitRequest $request,
        Patient $patient,
        PatientVisit $visit,
        DoctorAssignmentNotifier $doctorAssignmentNotifier
    ): RedirectResponse
    {
        abort_unless($request->user()?->can('patient-visit.edit'), 403);
        abort_if($visit->patient_id !== $patient->id, 404);

        $validated = $request->validated();
        $newDoctorId = (int) $validated['doctor_id'];
        $oldDoctorId = $visit->doctor_id;

        if ($newDoctorId !== $oldDoctorId) {
            abort_unless($request->user()?->can('patient.change-doctor'), 403);
            abort_if($visit->diagnoses()->exists() || $visit->prescriptions()->exists(), 422, 'Doctor cannot be changed after checkup has started.');
            $this->ensureDoctorIsActiveDoctor($newDoctorId);
        }

        $visit->update($validated);

        activity('patients')
            ->performedOn($visit)
            ->causedBy($request->user())
            ->event('patient-visit-updated')
            ->withProperties([
                'patient_id' => $patient->id,
                'visit_id' => $visit->id,
            ])
            ->log('Patient visit updated');

        if ($newDoctorId !== $oldDoctorId) {
            activity('patients')
                ->performedOn($visit)
                ->causedBy($request->user())
                ->event('patient-visit-doctor-changed')
                ->withProperties([
                    'patient_id' => $patient->id,
                    'visit_id' => $visit->id,
                    'old_doctor_id' => $oldDoctorId,
                    'new_doctor_id' => $newDoctorId,
                ])
                ->log('Visit assigned doctor changed');

            $doctorAssignmentNotifier->notify(
                patient: $patient,
                doctorId: $newDoctorId,
                actor: $request->user(),
                assignmentSource: 'visit',
            );
        }

        return redirect()->route('patients.show', $patient)->with('success', 'Visit updated successfully.');
    }

    public function changeDoctor(
        Request $request,
        Patient $patient,
        PatientVisit $visit,
        DoctorAssignmentNotifier $doctorAssignmentNotifier
    ): RedirectResponse
    {
        abort_unless($request->user()?->can('patient.change-doctor'), 403);
        abort_if($visit->patient_id !== $patient->id, 404);
        abort_if($visit->diagnoses()->exists() || $visit->prescriptions()->exists(), 422, 'Doctor cannot be changed after checkup has started.');

        $validated = $request->validate([
            'doctor_id' => ['required', 'exists:users,id'],
        ]);

        $newDoctorId = (int) $validated['doctor_id'];
        $this->ensureDoctorIsActiveDoctor($newDoctorId);

        $oldDoctorId = $visit->doctor_id;
        $visit->update(['doctor_id' => $newDoctorId]);

        activity('patients')
            ->performedOn($visit)
            ->causedBy($request->user())
            ->event('patient-visit-doctor-changed')
            ->withProperties([
                'patient_id' => $patient->id,
                'visit_id' => $visit->id,
                'old_doctor_id' => $oldDoctorId,
                'new_doctor_id' => $newDoctorId,
            ])
            ->log('Visit assigned doctor changed');

        $doctorAssignmentNotifier->notify(
            patient: $patient,
            doctorId: $newDoctorId,
            actor: $request->user(),
            assignmentSource: 'visit',
        );

        return back()->with('success', 'Assigned doctor updated successfully.');
    }

    protected function ensureDoctorIsActiveDoctor(int $doctorId): void
    {
        $isDoctor = User::query()
            ->whereKey($doctorId)
            ->where('status', UserStatus::Active->value)
            ->role('Doctor / Consultant')
            ->exists();

        if (! $isDoctor) {
            abort(422, 'Selected doctor is not active or does not have Doctor role.');
        }
    }
}
