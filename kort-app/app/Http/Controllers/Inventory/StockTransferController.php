<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StockTransferRequest;
use App\Services\InventoryOptionsService;
use App\Services\StockTransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function create(Request $request, InventoryOptionsService $optionsService): Response
    {
        abort_unless($request->user()->can('stock-transfer.create'), 403);

        return Inertia::render('Inventory/Workflow/Transfer', [
            'options' => $optionsService->workflowOptions(),
            'selectedItemId' => $request->integer('item') ?: null,
        ]);
    }

    public function store(StockTransferRequest $request, StockTransferService $transferService): RedirectResponse
    {
        $transfer = $transferService->transfer($request->validated(), $request->user());
        $itemId = $transfer->items->first()?->inventory_item_id;

        return redirect()
            ->route($itemId ? 'inventory.items.show' : 'inventory.items.index', $itemId ?: [])
            ->with('success', 'Stock transferred successfully.');
    }
}
