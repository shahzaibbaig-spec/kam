<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\InventoryItemRequest;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Services\BatchService;
use App\Services\InventoryCodeService;
use App\Services\InventoryOptionsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryItemController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(InventoryItem::class, 'item');
    }

    public function index(Request $request, InventoryOptionsService $optionsService): Response
    {
        $user = $request->user();
        $filters = $request->only([
            'search',
            'category_id',
            'location_id',
            'supplier_id',
            'active',
            'low_stock',
            'near_expiry',
            'batch_status',
            'temperature_sensitive',
            'sterile_item',
            'high_risk_item',
            'controlled_use',
        ]);

        $nearExpiryDate = now()->addDays((int) config('kort.inventory_near_expiry_days', 60))->toDateString();

        $items = InventoryItem::query()
            ->with(['category', 'supplier', 'storeLocation'])
            ->withCount('batches')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('item_name', 'like', "%{$search}%")
                    ->orWhere('item_code', 'like', "%{$search}%")
                    ->orWhere('barcode_value', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('batches', fn ($batchQuery) => $batchQuery->where('batch_number', 'like', "%{$search}%")));
            })
            ->when($filters['category_id'] ?? null, fn ($query, string $categoryId) => $query->where('inventory_category_id', $categoryId))
            ->when($filters['location_id'] ?? null, fn ($query, string $locationId) => $query->where('store_location_id', $locationId))
            ->when($filters['supplier_id'] ?? null, fn ($query, string $supplierId) => $query->where('supplier_id', $supplierId))
            ->when(isset($filters['active']) && $filters['active'] !== '', fn ($query) => $query->where('is_active', filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN)))
            ->when(($filters['temperature_sensitive'] ?? null) === 'yes', fn ($query) => $query->where('temperature_sensitive', true))
            ->when(($filters['sterile_item'] ?? null) === 'yes', fn ($query) => $query->where('sterile_item', true))
            ->when(($filters['high_risk_item'] ?? null) === 'yes', fn ($query) => $query->where('high_risk_item', true))
            ->when(($filters['controlled_use'] ?? null) === 'yes', fn ($query) => $query->where('controlled_use', true))
            ->when(($filters['low_stock'] ?? null) === 'yes', fn ($query) => $query->whereRaw('(current_quantity - reserved_quantity - damaged_quantity - quarantined_quantity - expired_quantity) <= reorder_level'))
            ->when(($filters['near_expiry'] ?? null) === 'yes', fn ($query) => $query->whereHas('batches', fn ($batchQuery) => $batchQuery
                ->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '>=', now()->toDateString())
                ->whereDate('expiry_date', '<=', $nearExpiryDate)))
            ->when($filters['batch_status'] ?? null, fn ($query, string $status) => $query->whereHas('batches', fn ($batchQuery) => $batchQuery->where('status', $status)))
            ->orderBy('item_name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Inventory/Items/Index', [
            'filters' => $filters,
            'items' => InventoryItemResource::collection($items),
            'filterOptions' => $optionsService->filters(),
            'nearExpiryDays' => (int) config('kort.inventory_near_expiry_days', 60),
            'permissions' => [
                'create' => $user->can('inventory-item.create'),
                'receive' => $user->can('stock-receipt.create'),
                'issue' => $user->can('stock-issue.create'),
                'return' => $user->can('stock-return.create'),
                'transfer' => $user->can('stock-transfer.create'),
                'adjust' => $user->can('stock-adjustment.create'),
                'scan' => $user->can('inventory-item.scan'),
                'edit' => $user->can('inventory-item.edit'),
                'ledger' => $user->can('inventory-ledger.view'),
            ],
        ]);
    }

    public function create(InventoryOptionsService $optionsService): Response
    {
        return Inertia::render('Inventory/Items/Form', [
            'item' => null,
            'options' => $optionsService->formOptions(),
        ]);
    }

    public function store(InventoryItemRequest $request, InventoryCodeService $codes): RedirectResponse
    {
        $validated = $request->validated();
        $category = InventoryCategory::query()->find($validated['inventory_category_id']);

        $item = InventoryItem::query()->create([
            ...$validated,
            'item_uuid' => $codes->generateUuid(),
            'item_code' => $validated['item_code'] ?: $codes->generateItemCode($category),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        activity('inventory')
            ->performedOn($item)
            ->causedBy($request->user())
            ->event('inventory-item-created')
            ->log('Inventory item created');

        return redirect()
            ->route('inventory.items.show', $item)
            ->with('success', 'Inventory item created successfully.');
    }

    public function show(InventoryItem $item, BatchService $batches): Response
    {
        $batches->refreshStatusesForItem($item);

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
        ]);

        return Inertia::render('Inventory/Items/Show', [
            'item' => InventoryItemResource::make($item),
            'permissions' => [
                'edit' => request()->user()->can('inventory-item.edit'),
                'delete' => request()->user()->can('inventory-item.delete'),
                'receive' => request()->user()->can('stock-receipt.create'),
                'issue' => request()->user()->can('stock-issue.create'),
                'return' => request()->user()->can('stock-return.create'),
                'transfer' => request()->user()->can('stock-transfer.create'),
                'adjust' => request()->user()->can('stock-adjustment.create'),
                'scan' => request()->user()->can('inventory-item.scan'),
                'ledger' => request()->user()->can('inventory-ledger.view'),
            ],
            'nearExpiryDays' => (int) config('kort.inventory_near_expiry_days', 60),
        ]);
    }

    public function edit(InventoryItem $item, InventoryOptionsService $optionsService): Response
    {
        return Inertia::render('Inventory/Items/Form', [
            'item' => InventoryItemResource::make($item->load(['category', 'supplier', 'storeLocation'])),
            'options' => $optionsService->formOptions(),
        ]);
    }

    public function update(InventoryItemRequest $request, InventoryItem $item, InventoryCodeService $codes): RedirectResponse
    {
        $validated = $request->validated();

        if (blank($validated['item_code'] ?? null)) {
            $category = InventoryCategory::query()->find($validated['inventory_category_id']);
            $validated['item_code'] = $item->item_code ?: $codes->generateItemCode($category);
        }

        $item->update([
            ...$validated,
            'updated_by' => $request->user()->id,
        ]);

        activity('inventory')
            ->performedOn($item)
            ->causedBy($request->user())
            ->event('inventory-item-updated')
            ->withProperties(['changed' => array_keys($item->getChanges())])
            ->log('Inventory item updated');

        return redirect()
            ->route('inventory.items.show', $item)
            ->with('success', 'Inventory item updated successfully.');
    }

    public function destroy(InventoryItem $item): RedirectResponse
    {
        if ((float) $item->current_quantity > 0) {
            return back()->with('error', 'Items with stock on hand must be issued, adjusted, or transferred down to zero before archiving.');
        }

        $item->delete();

        activity('inventory')
            ->performedOn($item)
            ->causedBy(request()->user())
            ->event('inventory-item-archived')
            ->log('Inventory item archived');

        return redirect()
            ->route('inventory.items.index')
            ->with('success', 'Inventory item archived successfully.');
    }
}
