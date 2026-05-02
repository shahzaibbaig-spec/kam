<?php

namespace App\Http\Controllers\Patients;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Patients\PatientAdmissionRequest;
use App\Models\Department;
use App\Models\Location;
use App\Models\Patient;
use App\Models\PatientAdmission;
use App\Models\User;
use App\Services\DoctorAssignmentNotifier;
use App\Services\PatientNumberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientAdmissionController extends Controller
{
    public function create(Patient $patient): Response
    {
        abort_unless(request()->user()?->can('patient-admission.create'), 403);

        return Inertia::render('Patients/Admissions/Form', [
            'patient' => [
                'id' => $patient->id,
                'patient_number' => $patient->patient_number,
                'full_name' => $patient->full_name,
                'cnic' => $patient->cnic,
            ],
            'admission' => null,
            'options' => $this->options(),
        ]);
    }

    public function store(
        PatientAdmissionRequest $request,
        Patient $patient,
        PatientNumberService $numbers,
        DoctorAssignmentNotifier $doctorAssignmentNotifier
    ): RedirectResponse
    {
        abort_unless($request->user()?->can('patient-admission.create'), 403);
        if ($request->filled('attending_doctor_id')) {
            abort_unless($request->user()?->can('patient.assign-doctor'), 403);
        }

        $admission = $patient->admissions()->create([
            ...$request->validated(),
            'admission_number' => $numbers->generateAdmissionNumber(),
            'admitted_by' => $request->user()?->id,
            'status' => $request->validated('status') ?: 'admitted',
        ]);

        activity('patients')
            ->performedOn($admission)
            ->causedBy($request->user())
            ->event('patient-admission-created')
            ->log('Patient admission created');

        $doctorAssignmentNotifier->notify(
            patient: $patient,
            doctorId: $admission->attending_doctor_id,
            actor: $request->user(),
            assignmentSource: 'admission',
        );

        return redirect()->route('patients.admissions.show', [$patient, $admission])->with('success', 'Patient admitted successfully.');
    }

    public function show(Patient $patient, PatientAdmission $admission): Response
    {
        abort_unless(request()->user()?->can('patient-admission.view'), 403);
        abort_if($admission->patient_id !== $patient->id, 404);

        $admission->load(['patient', 'department', 'ward', 'room', 'bed', 'admittedBy', 'attendingDoctor', 'visits.doctor']);

        return Inertia::render('Patients/Admissions/Show', [
            'admission' => [
                'id' => $admission->id,
                'patient_id' => $admission->patient_id,
                'patient_name' => $admission->patient?->full_name,
                'patient_number' => $admission->patient?->patient_number,
                'cnic' => $admission->patient?->cnic,
                'admission_number' => $admission->admission_number,
                'admission_date' => $admission->admission_date?->toDateString(),
                'admission_time' => $admission->admission_time,
                'department_name' => $admission->department?->name,
                'ward_name' => $admission->ward?->name,
                'room_name' => $admission->room?->name,
                'bed_name' => $admission->bed?->name,
                'admission_reason' => $admission->admission_reason,
                'initial_condition' => $admission->initial_condition,
                'status' => $admission->status,
                'discharge_date' => $admission->discharge_date?->toDateString(),
                'discharge_summary' => $admission->discharge_summary,
                'attending_doctor_id' => $admission->attending_doctor_id,
                'attending_doctor_name' => $admission->attendingDoctor?->name,
                'visits' => $admission->visits->map(fn ($visit) => [
                    'id' => $visit->id,
                    'visit_number' => $visit->visit_number,
                    'visit_date' => $visit->visit_date?->toDateTimeString(),
                    'visit_type' => $visit->visit_type,
                    'doctor_name' => $visit->doctor?->name,
                    'chief_complaint' => $visit->chief_complaint,
                ])->values(),
            ],
            'can' => [
                'edit' => request()->user()?->can('patient-admission.edit') ?? false,
                'discharge' => request()->user()?->can('patient-admission.discharge') ?? false,
                'diagnose' => request()->user()?->can('patient-diagnosis.create') ?? false,
                'changeDoctor' => request()->user()?->can('patient.change-doctor') ?? false,
            ],
            'options' => $this->options(),
        ]);
    }

    public function update(
        PatientAdmissionRequest $request,
        Patient $patient,
        PatientAdmission $admission,
        DoctorAssignmentNotifier $doctorAssignmentNotifier
    ): RedirectResponse
    {
        abort_unless($request->user()?->can('patient-admission.edit'), 403);
        abort_if($admission->patient_id !== $patient->id, 404);

        $newDoctorId = $request->validated('attending_doctor_id');
        $oldDoctorId = $admission->attending_doctor_id;
        if ($newDoctorId !== $admission->attending_doctor_id) {
            abort_unless($request->user()?->can('patient.change-doctor'), 403);
        }

        $admission->update($request->validated());

        activity('patients')
            ->performedOn($admission)
            ->causedBy($request->user())
            ->event('patient-admission-updated')
            ->log('Patient admission updated');

        if ($oldDoctorId !== $admission->attending_doctor_id) {
            activity('patients')
                ->performedOn($admission)
                ->causedBy($request->user())
                ->event('patient-admission-doctor-changed')
                ->withProperties([
                    'patient_id' => $patient->id,
                    'admission_id' => $admission->id,
                    'old_doctor_id' => $oldDoctorId,
                    'new_doctor_id' => $admission->attending_doctor_id,
                ])
                ->log('Admission attending doctor changed');

            $doctorAssignmentNotifier->notify(
                patient: $patient,
                doctorId: $admission->attending_doctor_id,
                actor: $request->user(),
                assignmentSource: 'admission',
            );
        }

        return back()->with('success', 'Admission updated successfully.');
    }

    public function changeDoctor(
        Request $request,
        Patient $patient,
        PatientAdmission $admission,
        DoctorAssignmentNotifier $doctorAssignmentNotifier
    ): RedirectResponse
    {
        abort_unless($request->user()?->can('patient.change-doctor'), 403);
        abort_if($admission->patient_id !== $patient->id, 404);
        abort_if($admission->visits()->exists(), 422, 'Doctor cannot be changed after checkup has started.');

        $validated = $request->validate([
            'attending_doctor_id' => ['required', 'exists:users,id'],
        ]);

        $newDoctorId = (int) $validated['attending_doctor_id'];
        $isDoctor = User::query()
            ->whereKey($newDoctorId)
            ->where('status', UserStatus::Active->value)
            ->role('Doctor / Consultant')
            ->exists();

        if (! $isDoctor) {
            abort(422, 'Selected doctor is not active or does not have Doctor role.');
        }

        $oldDoctorId = $admission->attending_doctor_id;
        $admission->update(['attending_doctor_id' => $newDoctorId]);

        activity('patients')
            ->performedOn($admission)
            ->causedBy($request->user())
            ->event('patient-admission-doctor-changed')
            ->withProperties([
                'patient_id' => $patient->id,
                'admission_id' => $admission->id,
                'old_doctor_id' => $oldDoctorId,
                'new_doctor_id' => $newDoctorId,
            ])
            ->log('Admission attending doctor changed');

        $doctorAssignmentNotifier->notify(
            patient: $patient,
            doctorId: $newDoctorId,
            actor: $request->user(),
            assignmentSource: 'admission',
        );

        return back()->with('success', 'Admission doctor updated successfully.');
    }

    public function discharge(Request $request, Patient $patient, PatientAdmission $admission): RedirectResponse
    {
        abort_unless($request->user()?->can('patient-admission.discharge'), 403);
        abort_if($admission->patient_id !== $patient->id, 404);

        $validated = $request->validate([
            'discharge_date' => ['nullable', 'date'],
            'discharge_summary' => ['nullable', 'string', 'max:8000'],
        ]);

        $admission->update([
            'status' => 'discharged',
            'discharge_date' => $validated['discharge_date'] ?? now()->toDateString(),
            'discharge_summary' => $validated['discharge_summary'] ?? null,
        ]);

        activity('patients')
            ->performedOn($admission)
            ->causedBy($request->user())
            ->event('patient-admission-discharged')
            ->log('Patient discharged');

        return back()->with('success', 'Patient discharged successfully.');
    }

    protected function options(): array
    {
        return [
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'locations' => Location::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'department_id']),
            'doctors' => User::query()
                ->role('Doctor / Consultant')
                ->where('status', UserStatus::Active->value)
                ->orderBy('name')
                ->get(['id', 'name', 'designation', 'department_id']),
            'statuses' => [
                ['value' => 'admitted', 'label' => 'Admitted'],
                ['value' => 'discharged', 'label' => 'Discharged'],
                ['value' => 'transferred', 'label' => 'Transferred'],
                ['value' => 'cancelled', 'label' => 'Cancelled'],
            ],
        ];
    }
}
