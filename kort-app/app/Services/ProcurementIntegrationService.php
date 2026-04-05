<?php

namespace App\Services;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use App\Enums\InventoryTransactionType;
use App\Models\Asset;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Collection;

class ProcurementIntegrationService
{
    public function __construct(
        protected BatchService $batches,
        protected InventoryTransactionService $inventoryTransactions,
        protected AssetCodeService $assetCodes,
        protected AssetMovementService $assetMovements,
    ) {
    }

    public function receiveInventoryLine(GoodsReceipt $goodsReceipt, GoodsReceiptItem $line, User $actor): void
    {
        $item = InventoryItem::query()->findOrFail($line->inventory_item_id);
        $beforeItemQuantity = (float) $item->current_quantity;
        $quantity = (float) $line->quantity_accepted;

        $batch = $this->batches->firstOrCreateBatch(
            $item,
            (string) $line->batch_number,
            $line->storage_location_id,
            $actor,
            [
                'manufacture_date' => $line->manufacture_date,
                'expiry_date' => $line->expiry_date,
                'unit_cost' => $line->unit_cost,
                'supplier_id' => $goodsReceipt->supplier_id ?? $item->supplier_id,
                'received_at' => $goodsReceipt->receipt_date,
                'storage_zone' => $line->room_or_area,
                'notes' => $line->remarks,
            ],
        );

        $beforeBatchQuantity = (float) $batch->available_quantity;

        $batch->forceFill([
            'received_quantity' => (float) $batch->received_quantity + $quantity,
            'available_quantity' => (float) $batch->available_quantity + $quantity,
            'updated_by' => $actor->id,
        ])->save();

        $this->batches->refreshStatus($batch);
        $item = $this->batches->recalculateItem($item, $actor);

        $this->inventoryTransactions->record($item, $batch, InventoryTransactionType::Received, $quantity, $actor, [
            'before_quantity' => $beforeItemQuantity,
            'after_quantity' => (float) $item->current_quantity,
            'before_batch_quantity' => $beforeBatchQuantity,
            'after_batch_quantity' => (float) $batch->available_quantity,
            'to_location_id' => $line->storage_location_id,
            'to_department_id' => $batch->storeLocation?->department_id,
            'reference_type' => GoodsReceipt::class,
            'reference_id' => $goodsReceipt->id,
            'reference_number' => $goodsReceipt->grn_number,
            'transaction_datetime' => $goodsReceipt->receipt_date?->startOfDay(),
            'remarks' => $line->remarks ?? 'Procurement receipt processed via GRN.',
        ]);

        activity('procurement')
            ->performedOn($item)
            ->causedBy($actor)
            ->event('goods-received-into-inventory')
            ->withProperties([
                'grn_number' => $goodsReceipt->grn_number,
                'batch_number' => $line->batch_number,
                'quantity' => $quantity,
            ])
            ->log('Inventory stock received from procurement');
    }

    public function receiveAssetLine(GoodsReceipt $goodsReceipt, GoodsReceiptItem $line, Supplier $supplier, User $actor): Collection
    {
        $location = Location::query()->with('department')->findOrFail($line->storage_location_id);
        $department = $location->department;
        $quantity = (int) round((float) $line->quantity_accepted);
        $serials = $this->parseSerialNumbers($line->serial_number);
        $assets = collect();

        for ($index = 0; $index < $quantity; $index++) {
            $asset = Asset::query()->create([
                'asset_uuid' => $this->assetCodes->generateUuid(),
                'asset_name' => $quantity > 1
                    ? $line->item_description.' Unit '.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)
                    : $line->item_description,
                'asset_code' => $this->assetCodes->generateAssetCode($department),
                'asset_category_id' => $line->asset_category_id,
                'supplier_id' => $supplier->id,
                'purchase_date' => $goodsReceipt->receipt_date,
                'purchase_cost' => $line->unit_cost,
                'serial_number' => $serials[$index] ?? null,
                'department_id' => $department?->id,
                'location_id' => $location->id,
                'room_or_area' => $line->room_or_area ?: 'Receiving Hold',
                'condition_status' => AssetConditionStatus::Good->value,
                'asset_status' => AssetStatus::Available->value,
                'notes' => trim('Received via '.$goodsReceipt->grn_number.'. Pending asset tagging and final deployment.'),
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            $this->assetMovements->record($asset, $actor, [
                'movement_type' => 'created',
                'to_department_id' => $department?->id,
                'to_location_id' => $location->id,
                'to_room_or_area' => $line->room_or_area ?: 'Receiving Hold',
                'movement_datetime' => $goodsReceipt->receipt_date?->startOfDay(),
                'reference_type' => GoodsReceipt::class,
                'reference_id' => $goodsReceipt->id,
                'notes' => 'Asset intake created from procurement goods receipt.',
            ]);

            activity('procurement')
                ->performedOn($asset)
                ->causedBy($actor)
                ->event('goods-received-into-assets')
                ->withProperties([
                    'grn_number' => $goodsReceipt->grn_number,
                    'serial_number' => $asset->serial_number,
                ])
                ->log('Asset intake created from procurement receipt');

            $assets->push($asset);
        }

        return $assets;
    }

    protected function parseSerialNumbers(?string $serials): array
    {
        if (blank($serials)) {
            return [];
        }

        return collect(preg_split('/[\r\n,;]+/', (string) $serials))
            ->map(fn (?string $value) => trim((string) $value))
            ->filter()
            ->values()
            ->all();
    }
}
