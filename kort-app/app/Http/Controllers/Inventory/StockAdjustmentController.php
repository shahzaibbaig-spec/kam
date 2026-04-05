<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StockAdjustmentRequest;
use App\Services\InventoryOptionsService;
use App\Services\StockAdjustmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function create(Request $request, InventoryOptionsService $optionsService): Response
    {
        abort_unless($request->user()->can('stock-adjustment.create'), 403);

        return Inertia::render('Inventory/Workflow/Adjust', [
            'options' => $optionsService->workflowOptions(),
            'selectedItemId' => $request->integer('item') ?: null,
        ]);
    }

    public function store(StockAdjustmentRequest $request, StockAdjustmentService $adjustmentService): RedirectResponse
    {
        $adjustment = $adjustmentService->adjust($request->validated(), $request->user());
        $itemId = $adjustment->items->first()?->inventory_item_id;

        return redirect()
            ->route($itemId ? 'inventory.items.show' : 'inventory.items.index', $itemId ?: [])
            ->with('success', 'Stock adjustment posted successfully.');
    }
}
