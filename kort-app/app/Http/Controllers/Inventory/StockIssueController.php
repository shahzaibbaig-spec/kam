<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StockIssueRequest;
use App\Services\InventoryOptionsService;
use App\Services\StockIssueService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockIssueController extends Controller
{
    public function create(Request $request, InventoryOptionsService $optionsService): Response
    {
        abort_unless($request->user()->can('stock-issue.create'), 403);

        return Inertia::render('Inventory/Workflow/Issue', [
            'options' => $optionsService->workflowOptions(),
            'selectedItemId' => $request->integer('item') ?: null,
        ]);
    }

    public function store(StockIssueRequest $request, StockIssueService $issueService): RedirectResponse
    {
        $issue = $issueService->issue($request->validated(), $request->user());
        $itemId = $issue->items->first()?->inventory_item_id;

        return redirect()
            ->route($itemId ? 'inventory.items.show' : 'inventory.items.index', $itemId ?: [])
            ->with('success', 'Stock issued successfully.');
    }
}
