<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StockReceiptRequest;
use App\Services\InventoryOptionsService;
use App\Services\StockReceiptService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockReceiptController extends Controller
{
    public function create(Request $request, InventoryOptionsService $optionsService): Response
    {
        abort_unless($request->user()->can('stock-receipt.create'), 403);

        return Inertia::render('Inventory/Workflow/Receive', [
            'options' => $optionsService->workflowOptions(),
            'selectedItemId' => $request->integer('item') ?: null,
        ]);
    }

    public function store(StockReceiptRequest $request, StockReceiptService $receiptService): RedirectResponse
    {
        $receipt = $receiptService->receive($request->validated(), $request->user());
        $itemId = $receipt->items->first()?->inventory_item_id;

        return redirect()
            ->route($itemId ? 'inventory.items.show' : 'inventory.items.index', $itemId ?: [])
            ->with('success', 'Stock received successfully.');
    }
}
