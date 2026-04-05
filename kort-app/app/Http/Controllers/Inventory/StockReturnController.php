<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StockReturnRequest;
use App\Services\InventoryOptionsService;
use App\Services\StockReturnService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockReturnController extends Controller
{
    public function create(Request $request, InventoryOptionsService $optionsService): Response
    {
        abort_unless($request->user()->can('stock-return.create'), 403);

        return Inertia::render('Inventory/Workflow/Return', [
            'options' => $optionsService->workflowOptions(),
            'selectedItemId' => $request->integer('item') ?: null,
        ]);
    }

    public function store(StockReturnRequest $request, StockReturnService $returnService): RedirectResponse
    {
        $stockReturn = $returnService->receive($request->validated(), $request->user());
        $itemId = $stockReturn->items->first()?->inventory_item_id;

        return redirect()
            ->route($itemId ? 'inventory.items.show' : 'inventory.items.index', $itemId ?: [])
            ->with('success', 'Stock return processed successfully.');
    }
}
