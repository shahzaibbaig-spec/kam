<?php

use App\Http\Resources\AssetCategoryResource;
use App\Http\Resources\AssetResource;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\GoodsReceiptResource;
use App\Http\Resources\InventoryCategoryResource;
use App\Http\Resources\InventoryItemResource;
use App\Http\Resources\LocationResource;
use App\Http\Resources\PurchaseOrderResource;
use App\Http\Resources\PurchaseRequisitionResource;
use App\Http\Resources\RoleResource;
use App\Http\Resources\SupplierResource;
use App\Http\Resources\UserResource;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Department;
use App\Models\GoodsReceipt;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequisition;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;

Route::middleware(['web', 'auth'])->prefix('v1')->group(function () {
    Route::get('departments', fn () => DepartmentResource::collection(
        Department::query()->with('manager')->withCount(['users', 'locations'])->orderBy('name')->get()
    ))->name('api.departments.index');

    Route::get('locations', fn () => LocationResource::collection(
        Location::query()->with(['department', 'parent'])->orderBy('name')->get()
    ))->name('api.locations.index');

    Route::get('users', fn () => UserResource::collection(
        User::query()->with(['department', 'defaultLocation', 'roles', 'permissions'])->orderBy('name')->get()
    ))->name('api.users.index');

    Route::get('roles', fn () => RoleResource::collection(
        Role::query()->with('permissions')->withCount('users')->orderBy('name')->get()
    ))->name('api.roles.index');

    Route::get('asset-categories', function (Request $request) {
        abort_unless($request->user()->can('asset-category.view'), 403);

        return AssetCategoryResource::collection(
            AssetCategory::query()->with('parent')->withCount('assets')->orderBy('name')->get()
        );
    })->name('api.asset-categories.index');

    Route::get('assets', function (Request $request) {
        abort_unless($request->user()->can('asset.view'), 403);

        return AssetResource::collection(
            Asset::query()
                ->with(['category', 'department', 'location', 'assignedUser', 'assignedDepartment', 'assignedLocation', 'activeTag', 'activeAssignment'])
                ->orderBy('asset_name')
                ->get()
        );
    })->name('api.assets.index');

    Route::get('assets/{asset}', function (Request $request, Asset $asset) {
        abort_unless($request->user()->can('asset.view'), 403);

        return AssetResource::make(
            $asset->load([
                'category',
                'supplier',
                'department',
                'location',
                'assignedUser',
                'assignedDepartment',
                'assignedLocation',
                'activeTag',
                'activeAssignment',
                'assignments.department',
                'assignments.location',
                'assignments.assignedUser',
                'movements.fromDepartment',
                'movements.toDepartment',
                'movements.fromLocation',
                'movements.toLocation',
                'movements.fromUser',
                'movements.toUser',
                'movements.performedBy',
                'statusLogs.changedBy',
            ])
        );
    })->name('api.assets.show');

    Route::get('inventory-categories', function (Request $request) {
        abort_unless($request->user()->can('inventory-category.view'), 403);

        return InventoryCategoryResource::collection(
            InventoryCategory::query()->with('parent')->withCount('items')->orderBy('name')->get()
        );
    })->name('api.inventory-categories.index');

    Route::get('inventory-items', function (Request $request) {
        abort_unless($request->user()->can('inventory-item.view'), 403);

        return InventoryItemResource::collection(
            InventoryItem::query()
                ->with(['category', 'supplier', 'storeLocation'])
                ->orderBy('item_name')
                ->get()
        );
    })->name('api.inventory-items.index');

    Route::get('inventory-items/{item}', function (Request $request, InventoryItem $item) {
        abort_unless($request->user()->can('inventory-item.view'), 403);

        return InventoryItemResource::make(
            $item->load([
                'category',
                'supplier',
                'storeLocation',
                'batches.supplier',
                'batches.storeLocation',
                'transactions.batch',
                'transactions.fromLocation',
                'transactions.toLocation',
                'transactions.fromDepartment',
                'transactions.toDepartment',
                'transactions.issuedToUser',
                'transactions.receivedFromUser',
                'transactions.performedBy',
            ])
        );
    })->name('api.inventory-items.show');

    Route::get('suppliers', function (Request $request) {
        abort_unless($request->user()->can('supplier.view'), 403);

        return SupplierResource::collection(
            Supplier::query()->withCount(['purchaseOrders', 'goodsReceipts'])->orderBy('supplier_name')->get()
        );
    })->name('api.suppliers.index');

    Route::get('purchase-requisitions', function (Request $request) {
        abort_unless($request->user()->can('requisition.view'), 403);

        return PurchaseRequisitionResource::collection(
            PurchaseRequisition::query()->with(['department', 'requestedBy'])->latest('request_date')->get()
        );
    })->name('api.purchase-requisitions.index');

    Route::get('purchase-orders', function (Request $request) {
        abort_unless($request->user()->can('purchase-order.view'), 403);

        return PurchaseOrderResource::collection(
            PurchaseOrder::query()->with(['supplier', 'requisition'])->latest('po_date')->get()
        );
    })->name('api.purchase-orders.index');

    Route::get('goods-receipts', function (Request $request) {
        abort_unless($request->user()->can('goods-receipt.view'), 403);

        return GoodsReceiptResource::collection(
            GoodsReceipt::query()->with(['supplier', 'purchaseOrder', 'receivedBy'])->latest('receipt_date')->get()
        );
    })->name('api.goods-receipts.index');
});
