<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Resources\InventoryTransactionResource;
use App\Models\InventoryTransaction;
use App\Services\InventoryOptionsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryLedgerController extends Controller
{
    public function index(Request $request, InventoryOptionsService $optionsService): Response
    {
        abort_unless($request->user()->can('inventory-ledger.view'), 403);

        $filters = $request->only([
            'search',
            'item_id',
            'batch_id',
            'transaction_type',
            'location_id',
            'date_from',
            'date_to',
        ]);

        $transactions = InventoryTransaction::query()
            ->with([
                'item.category',
                'batch',
                'fromLocation',
                'toLocation',
                'fromDepartment',
                'toDepartment',
                'issuedToUser',
                'receivedFromUser',
                'performedBy',
            ])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%")
                    ->orWhereHas('item', fn ($itemQuery) => $itemQuery
                        ->where('item_name', 'like', "%{$search}%")
                        ->orWhere('item_code', 'like', "%{$search}%"))
                    ->orWhereHas('batch', fn ($batchQuery) => $batchQuery->where('batch_number', 'like', "%{$search}%")));
            })
            ->when($filters['item_id'] ?? null, fn ($query, string $itemId) => $query->where('inventory_item_id', $itemId))
            ->when($filters['batch_id'] ?? null, fn ($query, string $batchId) => $query->where('inventory_batch_id', $batchId))
            ->when($filters['transaction_type'] ?? null, fn ($query, string $type) => $query->where('transaction_type', $type))
            ->when($filters['location_id'] ?? null, fn ($query, string $locationId) => $query->where(fn ($inner) => $inner
                ->where('from_location_id', $locationId)
                ->orWhere('to_location_id', $locationId)))
            ->when($filters['date_from'] ?? null, fn ($query, string $dateFrom) => $query->whereDate('transaction_datetime', '>=', $dateFrom))
            ->when($filters['date_to'] ?? null, fn ($query, string $dateTo) => $query->whereDate('transaction_datetime', '<=', $dateTo))
            ->latest('transaction_datetime')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/Ledger/Index', [
            'filters' => $filters,
            'transactions' => InventoryTransactionResource::collection($transactions),
            'filterOptions' => $optionsService->workflowOptions(),
        ]);
    }
}
