<?php

namespace App\Services;

use App\Enums\PurchaseRequisitionItemStatus;
use App\Enums\PurchaseRequisitionStatus;
use App\Models\AssetCategory;
use App\Models\InventoryItem;
use App\Models\PurchaseRequisition;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PurchaseRequisitionService
{
    public function __construct(
        protected RequisitionNumberService $numbers,
    ) {
    }

    public function create(array $payload, User $actor): PurchaseRequisition
    {
        return DB::transaction(function () use ($payload, $actor) {
            $requisition = PurchaseRequisition::query()->create([
                'requisition_number' => $this->numbers->generate($payload['request_date']),
                'requisition_type' => $payload['requisition_type'],
                'department_id' => $payload['department_id'] ?? null,
                'requested_by' => $payload['requested_by'] ?? $actor->id,
                'request_date' => $payload['request_date'],
                'priority' => $payload['priority'],
                'purpose' => $payload['purpose'] ?? null,
                'remarks' => $payload['remarks'] ?? null,
                'status' => PurchaseRequisitionStatus::Draft->value,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            $this->syncItems($requisition, $payload['items'], $actor);
            $requisition->refresh();

            activity('procurement')
                ->performedOn($requisition)
                ->causedBy($actor)
                ->event('requisition-created')
                ->log('Purchase requisition created');

            return $requisition->load(['department', 'requestedBy', 'items.assetCategory', 'items.inventoryItem', 'items.preferredSupplier']);
        });
    }

    public function update(PurchaseRequisition $requisition, array $payload, User $actor): PurchaseRequisition
    {
        return DB::transaction(function () use ($requisition, $payload, $actor) {
            $requisition->update([
                'requisition_type' => $payload['requisition_type'],
                'department_id' => $payload['department_id'] ?? null,
                'requested_by' => $payload['requested_by'] ?? $requisition->requested_by,
                'request_date' => $payload['request_date'],
                'priority' => $payload['priority'],
                'purpose' => $payload['purpose'] ?? null,
                'remarks' => $payload['remarks'] ?? null,
                'updated_by' => $actor->id,
            ]);

            $requisition->items()->delete();
            $this->syncItems($requisition, $payload['items'], $actor);

            activity('procurement')
                ->performedOn($requisition)
                ->causedBy($actor)
                ->event('requisition-updated')
                ->log('Purchase requisition updated');

            return $requisition->load(['department', 'requestedBy', 'items.assetCategory', 'items.inventoryItem', 'items.preferredSupplier']);
        });
    }

    public function submit(PurchaseRequisition $requisition, User $actor, ?string $comments = null): PurchaseRequisition
    {
        if ($requisition->items()->count() === 0) {
            throw new \DomainException('At least one requisition line is required before submission.');
        }

        $requisition->forceFill([
            'status' => PurchaseRequisitionStatus::Submitted->value,
            'current_approval_level' => 1,
            'updated_by' => $actor->id,
        ])->save();

        activity('procurement')
            ->performedOn($requisition)
            ->causedBy($actor)
            ->event('requisition-submitted')
            ->withProperties(['comments' => $comments])
            ->log('Purchase requisition submitted');

        return $requisition->fresh();
    }

    public function cancel(PurchaseRequisition $requisition, User $actor, ?string $reason = null): PurchaseRequisition
    {
        $requisition->forceFill([
            'status' => PurchaseRequisitionStatus::Cancelled->value,
            'remarks' => trim(collect([$requisition->remarks, $reason])->filter()->implode("\n")),
            'updated_by' => $actor->id,
        ])->save();

        activity('procurement')
            ->performedOn($requisition)
            ->causedBy($actor)
            ->event('requisition-cancelled')
            ->withProperties(['reason' => $reason])
            ->log('Purchase requisition cancelled');

        return $requisition->fresh();
    }

    protected function syncItems(PurchaseRequisition $requisition, array $items, User $actor): void
    {
        $total = 0;

        foreach ($items as $line) {
            $description = $this->resolveDescription($line);
            $estimatedTotal = $line['estimated_total'] ?? ((float) ($line['quantity'] ?? 0) * (float) ($line['estimated_unit_cost'] ?? 0));
            $total += (float) $estimatedTotal;

            $requisition->items()->create([
                'item_type' => $line['item_type'],
                'asset_category_id' => $line['asset_category_id'] ?? null,
                'inventory_item_id' => $line['inventory_item_id'] ?? null,
                'item_description' => $description,
                'quantity' => $line['quantity'],
                'unit_of_measure' => $line['unit_of_measure'] ?? $this->resolveUnitOfMeasure($line),
                'estimated_unit_cost' => $line['estimated_unit_cost'] ?? null,
                'estimated_total' => $estimatedTotal,
                'preferred_supplier_id' => $line['preferred_supplier_id'] ?? null,
                'needed_by_date' => $line['needed_by_date'] ?? null,
                'remarks' => $line['remarks'] ?? null,
                'status' => PurchaseRequisitionItemStatus::Pending->value,
            ]);
        }

        $requisition->forceFill([
            'total_estimated_amount' => $total,
            'updated_by' => $actor->id,
        ])->save();
    }

    protected function resolveDescription(array $line): string
    {
        if (filled($line['item_description'] ?? null)) {
            return (string) $line['item_description'];
        }

        if (filled($line['inventory_item_id'] ?? null)) {
            return InventoryItem::query()->find($line['inventory_item_id'])?->item_name ?? 'Inventory item';
        }

        if (filled($line['asset_category_id'] ?? null)) {
            return AssetCategory::query()->find($line['asset_category_id'])?->name ?? 'Asset item';
        }

        return 'Procurement line item';
    }

    protected function resolveUnitOfMeasure(array $line): ?string
    {
        if (filled($line['unit_of_measure'] ?? null)) {
            return $line['unit_of_measure'];
        }

        return filled($line['inventory_item_id'] ?? null)
            ? InventoryItem::query()->find($line['inventory_item_id'])?->unit_of_measure
            : 'unit';
    }
}
