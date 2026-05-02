<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\PatientPrescription;
use App\Models\PatientPrescriptionItem;
use App\Models\PharmacyDispensing;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PharmacyDispensingService
{
    public function __construct(
        protected FefoAllocationService $allocator,
        protected BatchService $batches,
        protected InventoryTransactionService $transactions,
    ) {
    }

    public function dispense(PatientPrescription $prescription, array $payload, User $pharmacist): PharmacyDispensing
    {
        return DB::transaction(function () use ($prescription, $payload, $pharmacist) {
            /** @var PatientPrescription $lockedPrescription */
            $lockedPrescription = PatientPrescription::query()
                ->whereKey($prescription->id)
                ->lockForUpdate()
                ->with(['patient', 'items.inventoryItem', 'visit.doctor'])
                ->firstOrFail();

            $lines = collect((array) ($payload['items'] ?? []))
                ->map(fn (array $line) => [
                    'prescription_item_id' => (int) ($line['prescription_item_id'] ?? 0),
                    'dispensed_quantity' => (float) ($line['dispensed_quantity'] ?? 0),
                    'remarks' => $line['remarks'] ?? null,
                ])
                ->filter(fn (array $line) => $line['prescription_item_id'] > 0 && $line['dispensed_quantity'] > 0)
                ->values();

            if ($lines->isEmpty()) {
                throw ValidationException::withMessages([
                    'items' => 'Enter at least one medicine dispense quantity greater than zero.',
                ]);
            }

            $dispensing = PharmacyDispensing::query()->create([
                'dispensing_number' => $this->generateDispensingNumber(),
                'patient_id' => $lockedPrescription->patient_id,
                'prescription_id' => $lockedPrescription->id,
                'pharmacist_id' => $pharmacist->id,
                'dispensed_at' => $payload['dispensed_at'] ?? now(),
                'status' => 'completed',
                'remarks' => $payload['remarks'] ?? null,
                'created_by' => $pharmacist->id,
            ]);

            $isPartial = false;
            $lineItemsForAudit = [];

            foreach ($lines as $line) {
                /** @var PatientPrescriptionItem|null $prescriptionItem */
                $prescriptionItem = $lockedPrescription->items->firstWhere('id', $line['prescription_item_id']);

                if (! $prescriptionItem) {
                    throw ValidationException::withMessages([
                        'items' => 'Prescription item not found for dispensing.',
                    ]);
                }

                $requestedQuantity = (float) $line['dispensed_quantity'];
                $inventoryItem = $this->resolveInventoryItem($prescriptionItem);

                if (! $inventoryItem) {
                    throw ValidationException::withMessages([
                        'items' => 'No linked inventory medicine found for "'.$prescriptionItem->medicine_name.'".',
                    ]);
                }

                if ((int) ($prescriptionItem->inventory_item_id ?? 0) !== (int) $inventoryItem->id) {
                    $prescriptionItem->forceFill(['inventory_item_id' => $inventoryItem->id])->save();
                }

                $prescribedQuantity = $prescriptionItem->prescribed_quantity !== null ? (float) $prescriptionItem->prescribed_quantity : null;
                $alreadyDispensed = (float) $prescriptionItem->dispensed_quantity;
                $remainingBefore = $prescribedQuantity !== null
                    ? max(0, $prescribedQuantity - $alreadyDispensed)
                    : null;

                if ($remainingBefore !== null && $requestedQuantity > $remainingBefore) {
                    throw ValidationException::withMessages([
                        'items' => 'Dispense quantity for "'.$prescriptionItem->medicine_name.'" exceeds remaining quantity.',
                    ]);
                }

                $allocations = $this->allocator->allocate($inventoryItem, $requestedQuantity);
                $beforeItemQuantity = (float) $inventoryItem->current_quantity;

                foreach ($allocations as $allocation) {
                    $batch = InventoryBatch::query()->whereKey($allocation['batch_id'])->lockForUpdate()->firstOrFail();
                    $allocatedQuantity = (float) $allocation['allocated_quantity'];
                    $beforeBatchQuantity = (float) $batch->available_quantity;

                    if (! $batch->isIssuable()) {
                        throw ValidationException::withMessages([
                            'items' => 'Batch '.$batch->batch_number.' is not valid for issue.',
                        ]);
                    }

                    $batch->forceFill([
                        'available_quantity' => (float) $batch->available_quantity - $allocatedQuantity,
                        'issued_quantity' => (float) $batch->issued_quantity + $allocatedQuantity,
                        'updated_by' => $pharmacist->id,
                    ])->save();

                    $this->batches->refreshStatus($batch);
                    $inventoryItem = $this->batches->recalculateItem($inventoryItem, $pharmacist);

                    $dispensing->items()->create([
                        'prescription_item_id' => $prescriptionItem->id,
                        'inventory_item_id' => $inventoryItem->id,
                        'inventory_batch_id' => $batch->id,
                        'prescribed_quantity' => $prescribedQuantity,
                        'dispensed_quantity' => $allocatedQuantity,
                        'unit_of_measure' => $inventoryItem->unit_of_measure,
                        'batch_number' => $batch->batch_number,
                        'expiry_date' => $batch->expiry_date,
                        'remarks' => $line['remarks'],
                    ]);

                    $lineItemsForAudit[] = [
                        'prescription_item_id' => $prescriptionItem->id,
                        'medicine_name' => $prescriptionItem->medicine_name,
                        'inventory_item_id' => $inventoryItem->id,
                        'inventory_item_name' => $inventoryItem->item_name,
                        'dispensed_quantity' => $allocatedQuantity,
                        'unit_of_measure' => $inventoryItem->unit_of_measure,
                        'batch_id' => $batch->id,
                        'batch_number' => $batch->batch_number,
                        'expiry_date' => $batch->expiry_date?->toDateString(),
                    ];

                    $this->transactions->record($inventoryItem, $batch, InventoryTransactionType::PharmacyDispensed, $allocatedQuantity, $pharmacist, [
                        'before_quantity' => $beforeItemQuantity,
                        'after_quantity' => (float) $inventoryItem->current_quantity,
                        'before_batch_quantity' => $beforeBatchQuantity,
                        'after_batch_quantity' => (float) $batch->available_quantity,
                        'from_location_id' => $batch->store_location_id,
                        'patient_id' => $lockedPrescription->patient_id,
                        'prescription_id' => $lockedPrescription->id,
                        'pharmacy_dispensing_id' => $dispensing->id,
                        'pharmacist_id' => $pharmacist->id,
                        'reference_type' => PharmacyDispensing::class,
                        'reference_id' => $dispensing->id,
                        'reference_number' => $dispensing->dispensing_number,
                        'transaction_datetime' => Carbon::parse($payload['dispensed_at'] ?? now()),
                        'remarks' => $line['remarks'] ?? $dispensing->remarks,
                    ]);

                    $beforeItemQuantity = (float) $inventoryItem->current_quantity;
                }

                $newDispensed = $alreadyDispensed + $requestedQuantity;
                $newRemaining = $prescribedQuantity !== null ? max(0, $prescribedQuantity - $newDispensed) : null;
                $itemStatus = $this->resolveItemStatus($newDispensed, $newRemaining);

                $prescriptionItem->forceFill([
                    'dispensed_quantity' => $newDispensed,
                    'remaining_quantity' => $newRemaining,
                    'dispensing_status' => $itemStatus,
                ])->save();

                if ($itemStatus !== 'fully_dispensed') {
                    $isPartial = true;
                }
            }

            $dispensingStatus = $isPartial ? 'partial' : 'completed';
            $dispensing->forceFill(['status' => $dispensingStatus])->save();

            $this->refreshPrescriptionDispensingStatus($lockedPrescription);

            activity('pharmacy')
                ->performedOn($dispensing)
                ->causedBy($pharmacist)
                ->event($dispensingStatus === 'completed' ? 'pharmacy-dispensed-completed' : 'pharmacy-dispensed-partial')
                ->withProperties([
                    'patient_id' => $lockedPrescription->patient_id,
                    'prescription_id' => $lockedPrescription->id,
                    'dispensing_id' => $dispensing->id,
                    'status' => $dispensingStatus,
                    'line_items' => $lineItemsForAudit,
                ])
                ->log($dispensingStatus === 'completed' ? 'Prescription fully dispensed' : 'Prescription partially dispensed');

            return $dispensing->load([
                'patient',
                'prescription.visit.doctor',
                'pharmacist',
                'items.prescriptionItem',
                'items.inventoryItem',
                'items.batch',
            ]);
        });
    }

    public function refreshPrescriptionDispensingStatus(PatientPrescription $prescription): void
    {
        $prescription->loadMissing('items');

        $items = $prescription->items;
        if ($items->isEmpty()) {
            $prescription->forceFill(['dispensing_status' => 'pending'])->save();

            return;
        }

        $allPending = $items->every(fn (PatientPrescriptionItem $item) => (float) $item->dispensed_quantity <= 0);
        $allFull = $items->every(fn (PatientPrescriptionItem $item) => $item->dispensing_status === 'fully_dispensed');

        $status = $allPending ? 'pending' : ($allFull ? 'fully_dispensed' : 'partially_dispensed');
        $prescription->forceFill(['dispensing_status' => $status])->save();
    }

    protected function resolveItemStatus(float $dispensed, ?float $remaining): string
    {
        if ($dispensed <= 0) {
            return 'pending';
        }

        if ($remaining !== null && $remaining <= 0) {
            return 'fully_dispensed';
        }

        return 'partially_dispensed';
    }

    protected function resolveInventoryItem(PatientPrescriptionItem $prescriptionItem): ?InventoryItem
    {
        if ($prescriptionItem->inventory_item_id) {
            return InventoryItem::query()->find($prescriptionItem->inventory_item_id);
        }

        return InventoryItem::query()
            ->where('is_active', true)
            ->where(function ($query) use ($prescriptionItem) {
                $query
                    ->where('item_name', $prescriptionItem->medicine_name)
                    ->orWhere('item_code', $prescriptionItem->medicine_name)
                    ->orWhere('barcode_value', $prescriptionItem->medicine_name);
            })
            ->orderByDesc('current_quantity')
            ->first();
    }

    protected function generateDispensingNumber(): string
    {
        return 'KORT-DISP-'.now()->format('Y').'-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT).'-'.Str::upper(Str::random(4));
    }
}
