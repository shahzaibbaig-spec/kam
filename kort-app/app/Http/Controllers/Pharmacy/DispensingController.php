<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\PharmacyDispenseRequest;
use App\Models\PatientPrescription;
use App\Models\PharmacyDispensing;
use App\Services\PharmacyDispensingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DispensingController extends Controller
{
    public function store(
        PharmacyDispenseRequest $request,
        PatientPrescription $prescription,
        PharmacyDispensingService $dispensingService
    ): RedirectResponse {
        abort_unless($request->user()?->can('pharmacy.dispense'), 403);

        try {
            $dispensing = $dispensingService->dispense($prescription, $request->validated(), $request->user());
        } catch (ValidationException $exception) {
            activity('pharmacy')
                ->causedBy($request->user())
                ->performedOn($prescription)
                ->event('pharmacy-dispensing-failed')
                ->withProperties([
                    'patient_id' => $prescription->patient_id,
                    'prescription_id' => $prescription->id,
                    'errors' => $exception->errors(),
                    'attempted_items' => $request->input('items', []),
                ])
                ->log('Dispensing failed due to validation or stock shortage');

            throw $exception;
        }

        activity('pharmacy')
            ->causedBy($request->user())
            ->performedOn($dispensing)
            ->event('pharmacy-dispensing-created')
            ->withProperties([
                'patient_id' => $dispensing->patient_id,
                'prescription_id' => $dispensing->prescription_id,
                'dispensing_id' => $dispensing->id,
                'status' => $dispensing->status,
                'line_items' => $this->mapDispensedItemsForAudit($dispensing),
            ])
            ->log('Medicines dispensed against prescription');

        return redirect()
            ->route('pharmacy.lookup', ['prescription' => $prescription->id])
            ->with('success', 'Done. Medicines dispensed and inventory updated.');
    }

    public function printSlip(Request $request, PharmacyDispensing $dispensing)
    {
        abort_unless($request->user()?->can('pharmacy.dispensing-slip.print'), 403);

        $dispensing->load([
            'patient',
            'prescription.visit.doctor',
            'pharmacist',
            'items.prescriptionItem',
            'items.inventoryItem',
            'items.batch',
        ]);

        activity('pharmacy')
            ->causedBy($request->user())
            ->performedOn($dispensing)
            ->event('pharmacy-dispensing-slip-printed')
            ->withProperties([
                'patient_id' => $dispensing->patient_id,
                'prescription_id' => $dispensing->prescription_id,
                'dispensing_id' => $dispensing->id,
                'line_items' => $this->mapDispensedItemsForAudit($dispensing),
            ])
            ->log('Pharmacy dispensing slip printed');

        return view('print.pharmacy-dispensing-slip', [
            'dispensing' => $dispensing,
            'printedBy' => $request->user(),
        ]);
    }

    protected function mapDispensedItemsForAudit(PharmacyDispensing $dispensing): array
    {
        return $dispensing->items->map(fn ($item) => [
            'prescription_item_id' => $item->prescription_item_id,
            'medicine_name' => $item->prescriptionItem?->medicine_name,
            'inventory_item_id' => $item->inventory_item_id,
            'inventory_item_name' => $item->inventoryItem?->item_name,
            'dispensed_quantity' => $item->dispensed_quantity,
            'unit_of_measure' => $item->unit_of_measure,
            'batch_id' => $item->inventory_batch_id,
            'batch_number' => $item->batch_number,
            'expiry_date' => $item->expiry_date?->toDateString(),
        ])->values()->all();
    }
}
