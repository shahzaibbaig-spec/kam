<?php

namespace App\Http\Controllers\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patients\PatientPrescriptionRequest;
use App\Models\Patient;
use App\Models\PatientPrescription;
use App\Models\PatientVisit;
use App\Services\PatientNumberService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientPrescriptionController extends Controller
{
    public function create(Patient $patient, PatientVisit $visit): Response
    {
        abort_unless(request()->user()?->can('patient-prescription.create'), 403);
        abort_if($visit->patient_id !== $patient->id, 404);

        $visit->load(['doctor', 'diagnoses.doctor']);

        return Inertia::render('Patients/Prescriptions/Form', [
            'patient' => [
                'id' => $patient->id,
                'patient_number' => $patient->patient_number,
                'full_name' => $patient->full_name,
                'cnic' => $patient->cnic,
                'gender' => $patient->gender,
                'age' => $patient->computed_age,
            ],
            'visit' => [
                'id' => $visit->id,
                'visit_number' => $visit->visit_number,
                'visit_date' => $visit->visit_date?->toDateTimeString(),
                'doctor_id' => $visit->doctor_id,
                'doctor_name' => $visit->doctor?->name,
                'chief_complaint' => $visit->chief_complaint,
                'diagnosis_summary' => $visit->diagnoses->pluck('diagnosis')->implode('; '),
                'follow_up_date' => $visit->diagnoses->sortByDesc('id')->first()?->follow_up_date?->toDateString(),
            ],
            'prescription' => null,
        ]);
    }

    public function store(PatientPrescriptionRequest $request, Patient $patient, PatientVisit $visit, PatientNumberService $numbers): RedirectResponse
    {
        abort_unless($request->user()?->can('patient-prescription.create'), 403);
        abort_if($visit->patient_id !== $patient->id, 404);

        $validated = $request->validated();

        $prescription = PatientPrescription::query()->create([
            'patient_id' => $patient->id,
            'visit_id' => $visit->id,
            'doctor_id' => $visit->doctor_id,
            'prescription_number' => $numbers->generatePrescriptionNumber(),
            'prescription_date' => $validated['prescription_date'],
            'instructions' => $validated['instructions'] ?? null,
            'printable_notes' => $validated['printable_notes'] ?? null,
            'dispensing_status' => 'pending',
        ]);

        $prescription->items()->createMany(
            collect($validated['items'])
                ->map(fn (array $item) => [
                    'medicine_name' => $item['medicine_name'],
                    'dosage' => $item['dosage'],
                    'frequency' => $item['frequency'],
                    'duration' => $item['duration'],
                    'instructions' => $item['instructions'] ?? null,
                    'inventory_item_id' => $item['inventory_item_id'] ?? null,
                    'prescribed_quantity' => $item['prescribed_quantity'] ?? null,
                    'dispensed_quantity' => 0,
                    'remaining_quantity' => $item['prescribed_quantity'] ?? null,
                    'dispensing_status' => 'pending',
                ])
                ->values()
                ->all()
        );

        activity('patients')
            ->performedOn($prescription)
            ->causedBy($request->user())
            ->event('patient-prescription-created')
            ->withProperties([
                'patient_id' => $patient->id,
                'visit_id' => $visit->id,
            ])
            ->log('Patient prescription created');

        return redirect()->route('patients.prescriptions.show', [$patient, $prescription])->with('success', 'Prescription saved successfully.');
    }

    public function show(Patient $patient, PatientPrescription $prescription): Response
    {
        abort_unless(request()->user()?->can('patient-prescription.view'), 403);
        abort_if($prescription->patient_id !== $patient->id, 404);

        $prescription->load(['doctor', 'items', 'visit.diagnoses']);
        $editLocked = $this->isPrescriptionEditLocked($prescription);

        return Inertia::render('Patients/Prescriptions/Show', [
            'patient' => [
                'id' => $patient->id,
                'patient_number' => $patient->patient_number,
                'full_name' => $patient->full_name,
                'cnic' => $patient->cnic,
                'gender' => $patient->gender,
                'age' => $patient->computed_age,
            ],
            'prescription' => [
                'id' => $prescription->id,
                'prescription_number' => $prescription->prescription_number,
                'prescription_date' => $prescription->prescription_date?->toDateTimeString(),
                'doctor_name' => $prescription->doctor?->name,
                'visit_id' => $prescription->visit_id,
                'visit_number' => $prescription->visit?->visit_number,
                'dispensing_status' => $prescription->dispensing_status,
                'diagnosis_summary' => $prescription->visit?->diagnoses->pluck('diagnosis')->implode('; '),
                'follow_up_date' => $prescription->visit?->diagnoses->sortByDesc('id')->first()?->follow_up_date?->toDateString(),
                'instructions' => $prescription->instructions,
                'printable_notes' => $prescription->printable_notes,
                'items' => $prescription->items->map(fn ($item) => [
                    'id' => $item->id,
                    'medicine_name' => $item->medicine_name,
                    'dosage' => $item->dosage,
                    'frequency' => $item->frequency,
                    'duration' => $item->duration,
                    'instructions' => $item->instructions,
                    'inventory_item_id' => $item->inventory_item_id,
                    'prescribed_quantity' => $item->prescribed_quantity,
                    'dispensed_quantity' => $item->dispensed_quantity,
                    'remaining_quantity' => $item->remaining_quantity,
                    'dispensing_status' => $item->dispensing_status,
                ])->values(),
            ],
            'can' => [
                'print' => request()->user()?->can('patient-prescription.print') ?? false,
                'edit' => (request()->user()?->can('patient-prescription.edit') ?? false) && ! $editLocked,
            ],
            'edit_locked' => $editLocked,
            'edit_lock_message' => $editLocked ? 'Editing is locked 24 hours after prescription creation.' : null,
        ]);
    }

    public function edit(Patient $patient, PatientPrescription $prescription): Response
    {
        abort_unless(request()->user()?->can('patient-prescription.edit'), 403);
        abort_if($prescription->patient_id !== $patient->id, 404);
        $this->abortIfPrescriptionEditLocked($prescription);
        abort_if($prescription->dispensings()->exists(), 422, 'Prescription cannot be edited after dispensing has started.');

        $prescription->load(['doctor', 'items', 'visit.diagnoses']);
        $visit = $prescription->visit;

        return Inertia::render('Patients/Prescriptions/Form', [
            'patient' => [
                'id' => $patient->id,
                'patient_number' => $patient->patient_number,
                'full_name' => $patient->full_name,
                'cnic' => $patient->cnic,
                'gender' => $patient->gender,
                'age' => $patient->computed_age,
            ],
            'visit' => [
                'id' => $visit?->id,
                'visit_number' => $visit?->visit_number,
                'visit_date' => $visit?->visit_date?->toDateTimeString(),
                'doctor_id' => $visit?->doctor_id,
                'doctor_name' => $visit?->doctor?->name,
                'chief_complaint' => $visit?->chief_complaint,
                'diagnosis_summary' => $visit?->diagnoses->pluck('diagnosis')->implode('; '),
                'follow_up_date' => $visit?->diagnoses->sortByDesc('id')->first()?->follow_up_date?->toDateString(),
            ],
            'prescription' => [
                'id' => $prescription->id,
                'visit_id' => $prescription->visit_id,
                'visit_number' => $prescription->visit?->visit_number,
                'prescription_number' => $prescription->prescription_number,
                'prescription_date' => $prescription->prescription_date?->format('Y-m-d\TH:i'),
                'doctor_name' => $prescription->doctor?->name,
                'dispensing_status' => $prescription->dispensing_status,
                'instructions' => $prescription->instructions,
                'printable_notes' => $prescription->printable_notes,
                'items' => $prescription->items->map(fn ($item) => [
                    'id' => $item->id,
                    'medicine_name' => $item->medicine_name,
                    'dosage' => $item->dosage,
                    'frequency' => $item->frequency,
                    'duration' => $item->duration,
                    'instructions' => $item->instructions,
                    'inventory_item_id' => $item->inventory_item_id,
                    'prescribed_quantity' => $item->prescribed_quantity,
                    'dispensed_quantity' => $item->dispensed_quantity,
                    'remaining_quantity' => $item->remaining_quantity,
                    'dispensing_status' => $item->dispensing_status,
                ])->values(),
            ],
            'can' => [
                'edit' => true,
            ],
        ]);
    }

    public function update(PatientPrescriptionRequest $request, Patient $patient, PatientPrescription $prescription): RedirectResponse
    {
        abort_unless($request->user()?->can('patient-prescription.edit'), 403);
        abort_if($prescription->patient_id !== $patient->id, 404);
        $this->abortIfPrescriptionEditLocked($prescription);
        abort_if($prescription->dispensings()->exists(), 422, 'Prescription cannot be edited after dispensing has started.');

        $validated = $request->validated();

        $prescription->update([
            'prescription_date' => $validated['prescription_date'],
            'instructions' => $validated['instructions'] ?? null,
            'printable_notes' => $validated['printable_notes'] ?? null,
            'dispensing_status' => 'pending',
        ]);

        $prescription->items()->delete();
        $prescription->items()->createMany(
            collect($validated['items'])
                ->map(fn (array $item) => [
                    'medicine_name' => $item['medicine_name'],
                    'dosage' => $item['dosage'],
                    'frequency' => $item['frequency'],
                    'duration' => $item['duration'],
                    'instructions' => $item['instructions'] ?? null,
                    'inventory_item_id' => $item['inventory_item_id'] ?? null,
                    'prescribed_quantity' => $item['prescribed_quantity'] ?? null,
                    'dispensed_quantity' => 0,
                    'remaining_quantity' => $item['prescribed_quantity'] ?? null,
                    'dispensing_status' => 'pending',
                ])
                ->values()
                ->all()
        );

        activity('patients')
            ->performedOn($prescription)
            ->causedBy($request->user())
            ->event('patient-prescription-updated')
            ->withProperties([
                'patient_id' => $patient->id,
                'visit_id' => $prescription->visit_id,
                'prescription_id' => $prescription->id,
            ])
            ->log('Patient prescription updated');

        return redirect()->route('patients.prescriptions.show', [$patient, $prescription])->with('success', 'Prescription updated successfully.');
    }

    public function print(Request $request, Patient $patient, PatientPrescription $prescription)
    {
        abort_unless($request->user()?->can('patient-prescription.print'), 403);
        abort_if($prescription->patient_id !== $patient->id, 404);

        $prescription->load(['doctor', 'items', 'visit.diagnoses']);

        activity('patients')
            ->performedOn($prescription)
            ->causedBy($request->user())
            ->event('patient-prescription-printed')
            ->withProperties([
                'patient_id' => $patient->id,
                'prescription_id' => $prescription->id,
            ])
            ->log('Prescription printed');

        return view('print.prescription', [
            'patient' => $patient,
            'prescription' => $prescription,
            'visit' => $prescription->visit,
            'diagnosisSummary' => $prescription->visit?->diagnoses->pluck('diagnosis')->implode('; '),
            'followUpDate' => $prescription->visit?->diagnoses->sortByDesc('id')->first()?->follow_up_date,
            'printedBy' => $request->user(),
        ]);
    }

    public function pdf(Request $request, Patient $patient, PatientPrescription $prescription)
    {
        abort_unless($request->user()?->can('patient-prescription.print'), 403);
        abort_if($prescription->patient_id !== $patient->id, 404);

        $prescription->load(['doctor', 'items', 'visit.diagnoses']);

        activity('patients')
            ->performedOn($prescription)
            ->causedBy($request->user())
            ->event('patient-prescription-pdf-downloaded')
            ->withProperties([
                'patient_id' => $patient->id,
                'prescription_id' => $prescription->id,
            ])
            ->log('Prescription PDF downloaded');

        $pdf = Pdf::loadView('print.prescription', [
            'patient' => $patient,
            'prescription' => $prescription,
            'visit' => $prescription->visit,
            'diagnosisSummary' => $prescription->visit?->diagnoses->pluck('diagnosis')->implode('; '),
            'followUpDate' => $prescription->visit?->diagnoses->sortByDesc('id')->first()?->follow_up_date,
            'printedBy' => $request->user(),
        ]);

        return $pdf->download("prescription-{$prescription->prescription_number}.pdf");
    }

    protected function isPrescriptionEditLocked(PatientPrescription $prescription): bool
    {
        $createdAt = $prescription->created_at instanceof Carbon
            ? $prescription->created_at
            : Carbon::parse($prescription->created_at);

        return now()->greaterThan($createdAt->copy()->addDay());
    }

    protected function abortIfPrescriptionEditLocked(PatientPrescription $prescription): void
    {
        abort_if($this->isPrescriptionEditLocked($prescription), 422, 'Prescription can only be edited within 24 hours of creation.');
    }
}
