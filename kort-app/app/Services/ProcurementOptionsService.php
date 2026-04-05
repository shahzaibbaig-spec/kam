<?php

namespace App\Services;

use App\Enums\GoodsReceiptStatus;
use App\Enums\ProcurementPriority;
use App\Enums\PurchaseOrderStatus;
use App\Enums\PurchaseRequisitionStatus;
use App\Enums\PurchaseRequisitionType;
use App\Enums\SupplierType;
use App\Models\AssetCategory;
use App\Models\Department;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequisition;
use App\Models\Supplier;
use App\Models\User;

class ProcurementOptionsService
{
    public function supplierTypes(): array
    {
        return $this->enumOptions(SupplierType::cases());
    }

    public function requisitionOptions(): array
    {
        return [
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'designation']),
            'suppliers' => Supplier::query()->active()->orderBy('supplier_name')->get(['id', 'supplier_name as name', 'supplier_code as code', 'supplier_type']),
            'assetCategories' => AssetCategory::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'inventoryItems' => InventoryItem::query()->where('is_active', true)->orderBy('item_name')->get(['id', 'item_name', 'item_code', 'unit_of_measure', 'supplier_id']),
            'types' => $this->enumOptions(PurchaseRequisitionType::cases()),
            'priorities' => $this->enumOptions(ProcurementPriority::cases()),
            'statuses' => $this->enumOptions(PurchaseRequisitionStatus::cases()),
        ];
    }

    public function purchaseOrderOptions(): array
    {
        return [
            'suppliers' => Supplier::query()->active()->orderBy('supplier_name')->get(['id', 'supplier_name as name', 'supplier_code as code', 'payment_terms']),
            'assetCategories' => AssetCategory::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'inventoryItems' => InventoryItem::query()->where('is_active', true)->orderBy('item_name')->get(['id', 'item_name', 'item_code', 'unit_of_measure']),
            'approvedRequisitions' => PurchaseRequisition::query()
                ->with(['department', 'requestedBy', 'items.assetCategory', 'items.inventoryItem', 'items.preferredSupplier'])
                ->whereIn('status', [
                    PurchaseRequisitionStatus::Approved->value,
                    PurchaseRequisitionStatus::PartiallyOrdered->value,
                ])
                ->latest('request_date')
                ->get(),
            'statuses' => $this->enumOptions(PurchaseOrderStatus::cases()),
            'currency' => config('kort.procurement_currency', 'PKR'),
        ];
    }

    public function goodsReceiptOptions(): array
    {
        return [
            'purchaseOrders' => PurchaseOrder::query()
                ->with(['supplier', 'items.inventoryItem', 'items.assetCategory'])
                ->whereIn('status', [
                    PurchaseOrderStatus::Issued->value,
                    PurchaseOrderStatus::PartiallyReceived->value,
                ])
                ->latest('po_date')
                ->get(),
            'suppliers' => Supplier::query()->active()->orderBy('supplier_name')->get(['id', 'supplier_name as name', 'supplier_code as code']),
            'locations' => Location::query()->where('is_active', true)->orderBy('name')->get(['id', 'department_id', 'name', 'code']),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'designation']),
            'statuses' => $this->enumOptions(GoodsReceiptStatus::cases()),
        ];
    }

    public function supplierFilters(): array
    {
        return [
            'types' => $this->supplierTypes(),
            'cities' => Supplier::query()->whereNotNull('city')->distinct()->orderBy('city')->pluck('city'),
        ];
    }

    protected function enumOptions(array $cases): array
    {
        return collect($cases)
            ->map(fn ($case) => [
                'value' => $case->value,
                'label' => str($case->value)->replace('_', ' ')->title()->toString(),
            ])
            ->values()
            ->all();
    }
}
