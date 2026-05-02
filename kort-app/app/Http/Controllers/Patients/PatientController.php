<?php

namespace App\Http\Controllers\Patients;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Patients\PatientDocumentRequest;
use App\Http\Requests\Patients\PatientRequest;
use App\Http\Resources\PatientResource;
use App\Models\Department;
use App\Models\Location;
use App\Models\Patient;
use App\Models\PatientAdmission;
use App\Models\PatientDiagnosis;
use App\Models\PatientDocument;
use App\Models\PatientPrescription;
use App\Models\PatientVisit;
use App\Models\User;
use App\Services\DoctorAssignmentNotifier;
use App\Services\PatientNumberService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Patient::class, 'patient');
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $filters = $request->only(['search']);
        $search = trim((string) ($filters['search'] ?? ''));
        $normalizedCnic = $this->normalizeCnicInput($search);

        if ($search !== '') {
            $exactPatient = Patient::query()
                ->tap(fn (Builder $query) => $this->applyDoctorPatientScope($query, $request->user()))
                ->where(function (Builder $query) use ($search, $normalizedCnic) {
                    $query
                        ->where('patient_number', $search)
                        ->orWhere('cnic', $search)
                        ->when($normalizedCnic !== null, fn (Builder $inner) => $inner->orWhere('cnic', $normalizedCnic));
                })
                ->first();

            if ($exactPatient) {
                return redirect()->route('patients.show', $exactPatient);
            }
        }

        $patients = Patient::query()
            ->with('assignedDoctor')
            ->withCount(['visits', 'admissions'])
            ->tap(fn (Builder $query) => $this->applyDoctorPatientScope($query, $request->user()))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('patient_number', 'like', "%{$search}%")
                        ->orWhere('cnic', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Patients/Index', [
            'filters' => $filters,
            'patients' => PatientResource::collection($patients),
            'permissions' => $this->permissions($request->user()),
        ]);
    }

    public function search(Request $request): Response|RedirectResponse
    {
        abort_unless($request->user()?->can('patient.search'), 403);

        $query = trim((string) $request->query('q', ''));
        $normalizedCnic = $this->normalizeCnicInput($query);
        $results = collect();

        if ($query !== '') {
            $exact = Patient::query()
                ->where('cnic', $query)
                ->orWhere('patient_number', $query)
                ->when($normalizedCnic !== null, fn ($q) => $q->orWhere('cnic', $normalizedCnic))
                ->first();

            if ($exact) {
                return redirect()->route('patients.show', $exact);
            }

            $results = Patient::query()
                ->where('full_name', 'like', "%{$query}%")
                ->orWhere('phone', 'like', "%{$query}%")
                ->orderBy('full_name')
                ->limit(50)
                ->get();
        }

        return Inertia::render('Patients/Search', [
            'query' => $query,
            'results' => PatientResource::collection($results),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Patient::class);

        return Inertia::render('Patients/Form', [
            'patient' => null,
            'existingMatches' => $this->findPotentialDuplicates((string) $request->query('q', '')),
            'options' => $this->formOptions(),
            'permissions' => $this->permissions($request->user()),
        ]);
    }

    public function store(PatientRequest $request, PatientNumberService $numbers, DoctorAssignmentNotifier $doctorAssignmentNotifier): RedirectResponse
    {
        $validated = $request->validated();

        $assignedDoctorId = $validated['assigned_doctor_id'] ?? null;
        $this->ensureDoctorAssignmentPermission($request, $assignedDoctorId, null);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('patients/photos', 'public');
        }

        unset($validated['photo']);
        unset($validated['patient_number']);

        $patientPayload = collect($validated)->except([
            'department_id',
            'checkup_type',
            'chief_complaint',
            'visit_date',
        ])->all();

        $patient = Patient::query()->create([
            ...$patientPayload,
            'patient_number' => $numbers->generatePatientNumber(),
            'assigned_doctor_id' => $assignedDoctorId,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        activity('patients')
            ->performedOn($patient)
            ->causedBy($request->user())
            ->event('patient-created')
            ->log('Patient created');

        $doctorAssignmentNotifier->notify(
            patient: $patient,
            doctorId: $assignedDoctorId,
            actor: $request->user(),
            assignmentSource: 'patient',
        );

        if ($assignedDoctorId && filled($validated['checkup_type'] ?? null)) {
            abort_unless(
                ($request->user()?->can('patient-visit.create') ?? false)
                    || ($request->user()?->can('patient.assign-doctor') ?? false),
                403
            );

            $visit = $patient->visits()->create([
                'admission_id' => null,
                'department_id' => $validated['department_id'] ?? null,
                'visit_number' => $numbers->generateVisitNumber(),
                'visit_date' => $validated['visit_date'] ?? now(),
                'visit_type' => $validated['checkup_type'],
                'doctor_id' => $assignedDoctorId,
                'chief_complaint' => $validated['chief_complaint'],
                'vitals' => null,
                'notes' => 'Initial visit created by receptionist during registration.',
            ]);

            activity('patients')
                ->performedOn($visit)
                ->causedBy($request->user())
                ->event('patient-visit-created')
                ->withProperties([
                    'patient_id' => $patient->id,
                    'visit_id' => $visit->id,
                    'assigned_doctor_id' => $assignedDoctorId,
                ])
                ->log('Initial patient visit assigned to doctor by receptionist');
        }

        return redirect()->route('patients.show', $patient)->with('success', 'Patient registered successfully.');
    }

    public function show(Patient $patient): Response
    {
        $patient->load([
            'admissions.department',
            'admissions.ward',
            'admissions.room',
            'admissions.bed',
            'admissions.attendingDoctor',
            'assignedDoctor',
            'visits.doctor',
            'visits.department',
            'visits.diagnoses.doctor',
            'visits.prescriptions.doctor',
            'visits.prescriptions.items',
            'diagnoses.doctor',
            'diagnoses.visit',
            'prescriptions.doctor',
            'prescriptions.items',
            'prescriptions.visit',
            'documents.visit',
            'documents.uploadedBy',
        ])->loadCount(['visits', 'admissions']);

        $patient->setRelation('visits', $patient->visits->sortByDesc('visit_date')->values());
        $patient->setRelation('admissions', $patient->admissions->sortByDesc('admission_date')->values());

        return Inertia::render('Patients/Show', [
            'patient' => PatientResource::make($patient),
            'permissions' => $this->permissions(request()->user()),
            'options' => $this->formOptions(),
        ]);
    }

    public function history(Patient $patient): Response
    {
        $this->authorize('view', $patient);

        $patient->load([
            'admissions.department',
            'admissions.attendingDoctor',
            'visits.doctor',
            'diagnoses.doctor',
            'diagnoses.visit',
            'prescriptions.doctor',
            'prescriptions.items',
            'prescriptions.visit',
            'documents.uploadedBy',
            'documents.visit',
        ]);

        return Inertia::render('Patients/History', [
            'patient' => PatientResource::make($patient),
        ]);
    }

    public function queue(Request $request): Response
    {
        abort_unless($request->user()?->can('patient-visit.view'), 403);

        $doctorId = $request->user()?->id;

        $admissions = PatientAdmission::query()
            ->with(['patient', 'department', 'ward', 'room', 'bed'])
            ->where('status', 'admitted')
            ->where(function ($query) use ($doctorId) {
                $query->where('attending_doctor_id', $doctorId);
                if ($doctorId && request()->user()?->can('patient-admission.view')) {
                    $query->orWhereNull('attending_doctor_id');
                }
            })
            ->orderBy('admission_date')
            ->get();

        $pendingVisits = PatientVisit::query()
            ->with(['patient', 'department', 'doctor'])
            ->whereNull('admission_id')
            ->whereDoesntHave('diagnoses')
            ->where(function ($query) use ($doctorId, $request) {
                $query->where('doctor_id', $doctorId);
                if ($doctorId && $request->user()?->can('patient-visit.create')) {
                    $query->orWhereNull('doctor_id');
                }
            })
            ->orderBy('visit_date')
            ->get();

        $queue = collect();

        $queue = $queue->merge(
            $admissions->map(fn (PatientAdmission $admission) => [
                'queue_type' => 'admission',
                'admission_id' => $admission->id,
                'visit_id' => null,
                'visit_number' => null,
                'admission_number' => $admission->admission_number,
                'admission_date' => $admission->admission_date?->toDateString(),
                'patient_id' => $admission->patient?->id,
                'patient_name' => $admission->patient?->full_name,
                'patient_number' => $admission->patient?->patient_number,
                'cnic' => $admission->patient?->cnic,
                'department_name' => $admission->department?->name,
                'ward_name' => $admission->ward?->name,
                'room_name' => $admission->room?->name,
                'bed_name' => $admission->bed?->name,
                'visit_type' => 'admitted_followup',
                'doctor_name' => null,
                'status' => $admission->status,
            ])
        );

        $queue = $queue->merge(
            $pendingVisits->map(fn (PatientVisit $visit) => [
                'queue_type' => 'visit',
                'admission_id' => null,
                'visit_id' => $visit->id,
                'visit_number' => $visit->visit_number,
                'admission_number' => null,
                'admission_date' => $visit->visit_date?->toDateString(),
                'patient_id' => $visit->patient?->id,
                'patient_name' => $visit->patient?->full_name,
                'patient_number' => $visit->patient?->patient_number,
                'cnic' => $visit->patient?->cnic,
                'department_name' => $visit->department?->name,
                'ward_name' => null,
                'room_name' => null,
                'bed_name' => null,
                'visit_type' => $visit->visit_type,
                'doctor_name' => $visit->doctor?->name,
                'status' => 'waiting',
            ])
        );

        $queue = $queue->sortBy('admission_date')->values();

        return Inertia::render('Patients/Queue', [
            'queue' => $this->paginateQueue($queue, 20, $request),
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('Patients/Form', [
            'patient' => PatientResource::make($patient),
            'existingMatches' => [],
            'options' => $this->formOptions(),
            'permissions' => $this->permissions(request()->user()),
        ]);
    }

    public function update(PatientRequest $request, Patient $patient, DoctorAssignmentNotifier $doctorAssignmentNotifier): RedirectResponse
    {
        $validated = $request->validated();
        $assignedDoctorId = $validated['assigned_doctor_id'] ?? null;
        $this->ensureDoctorAssignmentPermission($request, $assignedDoctorId, $patient->assigned_doctor_id);

        if ($request->hasFile('photo')) {
            if ($patient->photo_path) {
                Storage::disk('public')->delete($patient->photo_path);
            }

            $validated['photo_path'] = $request->file('photo')->store('patients/photos', 'public');
        }

        unset($validated['photo']);
        unset($validated['patient_number']);

        $patientPayload = collect($validated)->except([
            'department_id',
            'checkup_type',
            'chief_complaint',
            'visit_date',
        ])->all();

        $patient->update([
            ...$patientPayload,
            'assigned_doctor_id' => $assignedDoctorId,
            'updated_by' => $request->user()?->id,
        ]);

        activity('patients')
            ->performedOn($patient)
            ->causedBy($request->user())
            ->event('patient-updated')
            ->log('Patient updated');

        if ($patient->wasChanged('assigned_doctor_id')) {
            $newDoctorId = $patient->assigned_doctor_id;

            activity('patients')
                ->performedOn($patient)
                ->causedBy($request->user())
                ->event('patient-doctor-assignment-updated')
                ->withProperties([
                    'patient_id' => $patient->id,
                    'old_assigned_doctor_id' => $patient->getOriginal('assigned_doctor_id'),
                    'new_assigned_doctor_id' => $newDoctorId,
                ])
                ->log('Patient assigned doctor updated');

            $doctorAssignmentNotifier->notify(
                patient: $patient,
                doctorId: $newDoctorId,
                actor: $request->user(),
                assignmentSource: 'patient',
            );
        }

        return redirect()->route('patients.show', $patient)->with('success', 'Patient updated successfully.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        $patient->delete();

        activity('patients')
            ->performedOn($patient)
            ->causedBy(request()->user())
            ->event('patient-deleted')
            ->log('Patient archived');

        return redirect()->route('patients.index')->with('success', 'Patient archived successfully.');
    }

    public function uploadDocument(PatientDocumentRequest $request, Patient $patient): RedirectResponse
    {
        abort_unless($request->user()?->can('patient.view'), 403);

        $file = $request->file('file');
        $path = $file->store('patients/documents', 'public');

        $document = PatientDocument::query()->create([
            'patient_id' => $patient->id,
            'visit_id' => $request->validated('visit_id'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientMimeType() ?: $file->extension(),
            'uploaded_by' => $request->user()?->id,
            'notes' => $request->validated('notes'),
        ]);

        activity('patients')
            ->performedOn($document)
            ->causedBy($request->user())
            ->event('patient-document-uploaded')
            ->withProperties([
                'patient_id' => $patient->id,
                'visit_id' => $document->visit_id,
            ])
            ->log('Patient document uploaded');

        return back()->with('success', 'Patient document uploaded successfully.');
    }

    protected function findPotentialDuplicates(string $query): array
    {
        $query = trim($query);
        if ($query === '' || mb_strlen($query) < 3) {
            return [];
        }

        return PatientResource::collection(
            Patient::query()
                ->where('full_name', 'like', "%{$query}%")
                ->orWhere('cnic', 'like', "%{$query}%")
                ->orWhere('phone', 'like', "%{$query}%")
                ->limit(8)
                ->get()
        )->resolve();
    }

    protected function normalizeCnicInput(string $value): ?string
    {
        $digits = preg_replace('/\D+/', '', $value);
        if (strlen((string) $digits) !== 13) {
            return null;
        }

        return substr($digits, 0, 5).'-'.substr($digits, 5, 7).'-'.substr($digits, 12, 1);
    }

    protected function formOptions(): array
    {
        return [
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'locations' => Location::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'department_id']),
            'doctors' => User::query()
                ->role('Doctor / Consultant')
                ->where('status', UserStatus::Active->value)
                ->orderBy('name')
                ->get(['id', 'name', 'designation', 'department_id']),
        ];
    }

    protected function applyDoctorPatientScope(Builder $query, ?User $user): void
    {
        if (! $user?->hasRole('Doctor / Consultant')) {
            return;
        }

        $query->where(function (Builder $inner) use ($user) {
            $inner
                ->where('assigned_doctor_id', $user->id)
                ->orWhereHas('admissions', fn (Builder $admissionQuery) => $admissionQuery->where('attending_doctor_id', $user->id))
                ->orWhereHas('visits', fn (Builder $visitQuery) => $visitQuery->where('doctor_id', $user->id));
        });
    }

    protected function permissions(?User $user): array
    {
        return [
            'patient' => [
                'view' => $user?->can('patient.view') ?? false,
                'create' => $user?->can('patient.create') ?? false,
                'edit' => $user?->can('patient.edit') ?? false,
                'delete' => $user?->can('patient.delete') ?? false,
                'search' => $user?->can('patient.search') ?? false,
                'assignDoctor' => $user?->can('patient.assign-doctor') ?? false,
                'changeDoctor' => $user?->can('patient.change-doctor') ?? false,
            ],
            'admission' => [
                'view' => $user?->can('patient-admission.view') ?? false,
                'create' => $user?->can('patient-admission.create') ?? false,
                'edit' => $user?->can('patient-admission.edit') ?? false,
                'discharge' => $user?->can('patient-admission.discharge') ?? false,
            ],
            'visit' => [
                'view' => $user?->can('patient-visit.view') ?? false,
                'create' => $user?->can('patient-visit.create') ?? false,
                'edit' => $user?->can('patient-visit.edit') ?? false,
            ],
            'diagnosis' => [
                'view' => $user?->can('patient-diagnosis.view') ?? false,
                'create' => $user?->can('patient-diagnosis.create') ?? false,
                'edit' => $user?->can('patient-diagnosis.edit') ?? false,
            ],
            'prescription' => [
                'view' => $user?->can('patient-prescription.view') ?? false,
                'create' => $user?->can('patient-prescription.create') ?? false,
                'edit' => $user?->can('patient-prescription.edit') ?? false,
                'print' => $user?->can('patient-prescription.print') ?? false,
            ],
        ];
    }

    protected function ensureDoctorAssignmentPermission(Request $request, ?int $newDoctorId, ?int $currentDoctorId): void
    {
        if ($newDoctorId === null && $currentDoctorId === null) {
            return;
        }

        $isChange = $currentDoctorId !== null && $newDoctorId !== $currentDoctorId;
        if ($isChange && ! $request->user()?->can('patient.change-doctor')) {
            abort(403, 'You are not allowed to change patient doctor assignment.');
        }

        if (! $isChange && ! $request->user()?->can('patient.assign-doctor')) {
            abort(403, 'You are not allowed to assign patient doctor.');
        }
    }

    protected function paginateQueue(Collection $rows, int $perPage, Request $request): array
    {
        $page = max((int) $request->query('page', 1), 1);
        $total = $rows->count();
        $lastPage = max((int) ceil($total / $perPage), 1);
        $page = min($page, $lastPage);
        $offset = ($page - 1) * $perPage;
        $data = $rows->slice($offset, $perPage)->values()->all();

        $buildPageUrl = function (int $targetPage) use ($request): string {
            $query = array_merge($request->query(), ['page' => $targetPage]);
            return url()->current().'?'.http_build_query($query);
        };

        $links = [
            ['url' => $page > 1 ? $buildPageUrl($page - 1) : null, 'label' => '&laquo; Previous', 'active' => false],
        ];

        for ($i = 1; $i <= $lastPage; $i++) {
            $links[] = ['url' => $buildPageUrl($i), 'label' => (string) $i, 'active' => $i === $page];
        }

        $links[] = ['url' => $page < $lastPage ? $buildPageUrl($page + 1) : null, 'label' => 'Next &raquo;', 'active' => false];

        return [
            'data' => $data,
            'links' => $links,
            'meta' => [
                'current_page' => $page,
                'from' => $total > 0 ? $offset + 1 : null,
                'last_page' => $lastPage,
                'path' => url()->current(),
                'per_page' => $perPage,
                'to' => min($offset + $perPage, $total),
                'total' => $total,
            ],
        ];
    }
}
