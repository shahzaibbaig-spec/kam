<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\PharmacyLookupRequest;
use App\Models\InventoryItem;
use App\Models\Patient;
use App\Models\PatientPrescription;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionLookupController extends Controller
{
    public function __invoke(PharmacyLookupRequest $request): Response
    {
        abort_unless($request->user()?->can('pharmacy.view'), 403);
        abort_unless($request->user()?->can('pharmacy.patient-search'), 403);
        abort_unless($request->user()?->can('pharmacy.prescription-view'), 403);

        $query = trim((string) $request->validated('query', ''));
        $selectedPrescriptionId = (int) $request->integer('prescription', 0);
        $prescriptions = collect();
        $medicines = collect();
        $selected = null;

        if ($query !== '') {
            $prescriptions = $this->findPrescriptionsByLookup($query);
            $medicines = $this->findMedicinesByLookup($query);

            activity('pharmacy')
                ->causedBy($request->user())
                ->event('pharmacy-prescription-search')
                ->withProperties(['query' => $query, 'result_count' => $prescriptions->count()])
                ->log('Prescription searched from pharmacy lookup');

            activity('pharmacy')
                ->causedBy($request->user())
                ->event('pharmacy-medicine-search')
                ->withProperties(['query' => $query, 'result_count' => $medicines->count()])
                ->log('Medicine searched for stock availability from pharmacy lookup');
        }

        if ($selectedPrescriptionId > 0) {
            $selected = $this->loadPrescription($selectedPrescriptionId);
        } elseif ($prescriptions->isNotEmpty()) {
            $selected = $this->loadPrescription((int) $prescriptions->first()->id);
        }

        if ($selected) {
            activity('pharmacy')
                ->causedBy($request->user())
                ->performedOn($selected)
                ->event('pharmacy-prescription-viewed')
                ->withProperties([
                    'patient_id' => $selected->patient_id,
                    'prescription_id' => $selected->id,
                ])
                ->log('Prescription viewed for dispensing');
        }

        return Inertia::render('Pharmacy/Lookup', [
            'query' => $query,
            'prescriptions' => $prescriptions->map(fn (PatientPrescription $prescription) => [
                'id' => $prescription->id,
                'prescription_number' => $prescription->prescription_number,
                'prescription_date' => $prescription->prescription_date?->toDateTimeString(),
                'dispensing_status' => $prescription->dispensing_status,
                'doctor_name' => $prescription->doctor?->name,
                'patient' => [
                    'id' => $prescription->patient?->id,
                    'patient_number' => $prescription->patient?->patient_number,
                    'full_name' => $prescription->patient?->full_name,
                    'cnic' => $prescription->patient?->cnic,
                ],
            ])->values()->all(),
            'medicines' => $medicines->map(fn (InventoryItem $item) => [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'unit_of_measure' => $item->unit_of_measure,
                'current_quantity' => (float) $item->current_quantity,
                'available_quantity' => $item->availableBalance(),
                'is_available' => $item->availableBalance() > 0,
            ])->values()->all(),
            'selectedPrescription' => $selected ? $this->buildPrescriptionPayload($selected) : null,
            'can' => [
                'dispense' => $request->user()?->can('pharmacy.dispense') ?? false,
                'printSlip' => $request->user()?->can('pharmacy.dispensing-slip.print') ?? false,
            ],
        ]);
    }

    protected function findPrescriptionsByLookup(string $query)
    {
        $normalizedCnic = $this->normalizeCnic($query);

        $prescriptionByNumber = PatientPrescription::query()
            ->where('prescription_number', $query)
            ->with(['patient', 'doctor'])
            ->first();

        if ($prescriptionByNumber) {
            return collect([$prescriptionByNumber]);
        }

        $patient = Patient::query()
            ->where('patient_number', $query)
            ->orWhere('cnic', $query)
            ->when($normalizedCnic !== null, fn (Builder $builder) => $builder->orWhere('cnic', $normalizedCnic))
            ->first();

        if (! $patient) {
            return collect();
        }

        return PatientPrescription::query()
            ->where('patient_id', $patient->id)
            ->with(['patient', 'doctor'])
            ->orderByRaw("CASE dispensing_status WHEN 'pending' THEN 0 WHEN 'partially_dispensed' THEN 1 WHEN 'fully_dispensed' THEN 2 ELSE 3 END")
            ->orderByDesc('prescription_date')
            ->limit(20)
            ->get();
    }

    protected function loadPrescription(int $prescriptionId): ?PatientPrescription
    {
        return PatientPrescription::query()
            ->with([
                'patient',
                'doctor',
                'visit.diagnoses',
                'items.inventoryItem.batches',
            ])
            ->find($prescriptionId);
    }

    protected function findMedicinesByLookup(string $query)
    {
        $searchTerm = '%'.addcslashes($query, '\%_').'%';

        return InventoryItem::query()
            ->where('is_active', true)
            ->where(function (Builder $builder) use ($searchTerm) {
                $builder
                    ->where('item_name', 'like', $searchTerm)
                    ->orWhere('item_code', 'like', $searchTerm)
                    ->orWhere('barcode_value', 'like', $searchTerm)
                    ->orWhere('sku', 'like', $searchTerm);
            })
            ->orderBy('item_name')
            ->limit(20)
            ->get();
    }

    protected function buildPrescriptionPayload(PatientPrescription $prescription): array
    {
        return [
            'id' => $prescription->id,
            'prescription_number' => $prescription->prescription_number,
            'prescription_date' => $prescription->prescription_date?->toDateTimeString(),
            'dispensing_status' => $prescription->dispensing_status,
            'instructions' => $prescription->instructions,
            'printable_notes' => $prescription->printable_notes,
            'doctor_name' => $prescription->doctor?->name,
            'diagnosis_summary' => $prescription->visit?->diagnoses?->pluck('diagnosis')->implode('; '),
            'patient' => [
                'id' => $prescription->patient?->id,
                'patient_number' => $prescription->patient?->patient_number,
                'full_name' => $prescription->patient?->full_name,
                'cnic' => $prescription->patient?->cnic,
                'gender' => $prescription->patient?->gender,
                'age' => $prescription->patient?->computed_age,
            ],
            'items' => $prescription->items->map(function ($item) {
                $inventoryItem = $item->inventoryItem ?: $this->resolveInventoryItemByName($item->medicine_name);
                $validBatches = $inventoryItem
                    ? $inventoryItem->batches
                        ->filter(fn ($batch) => $batch->isIssuable())
                        ->sortBy([
                            ['expiry_date', 'asc'],
                            ['received_at', 'asc'],
                            ['id', 'asc'],
                        ])
                        ->values()
                    : collect();

                return [
                    'id' => $item->id,
                    'medicine_name' => $item->medicine_name,
                    'dosage' => $item->dosage,
                    'frequency' => $item->frequency,
                    'duration' => $item->duration,
                    'instructions' => $item->instructions,
                    'inventory_item_id' => $inventoryItem?->id,
                    'inventory_item_name' => $inventoryItem?->item_name,
                    'unit_of_measure' => $inventoryItem?->unit_of_measure,
                    'prescribed_quantity' => $item->prescribed_quantity,
                    'dispensed_quantity' => $item->dispensed_quantity,
                    'remaining_quantity' => $item->remaining_quantity,
                    'dispensing_status' => $item->dispensing_status,
                    'available_stock' => $inventoryItem?->availableBalance(),
                    'batches' => $validBatches->map(fn ($batch) => [
                        'id' => $batch->id,
                        'batch_number' => $batch->batch_number,
                        'expiry_date' => $batch->expiry_date?->toDateString(),
                        'available_quantity' => $batch->available_quantity,
                        'status' => $batch->status?->value ?? (string) $batch->status,
                    ])->all(),
                ];
            })->values()->all(),
        ];
    }

    protected function resolveInventoryItemByName(string $medicineName): ?InventoryItem
    {
        return InventoryItem::query()
            ->where('is_active', true)
            ->where(function (Builder $query) use ($medicineName) {
                $query
                    ->where('item_name', $medicineName)
                    ->orWhere('item_code', $medicineName)
                    ->orWhere('barcode_value', $medicineName);
            })
            ->orderByDesc('current_quantity')
            ->first();
    }

    protected function normalizeCnic(string $value): ?string
    {
        $digits = preg_replace('/\D+/', '', $value);
        if (strlen((string) $digits) !== 13) {
            return null;
        }

        return substr($digits, 0, 5).'-'.substr($digits, 5, 7).'-'.substr($digits, 12, 1);
    }
}
