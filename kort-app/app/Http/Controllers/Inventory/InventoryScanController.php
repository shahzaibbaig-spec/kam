<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\InventoryScanRequest;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryItem;
use Inertia\Inertia;
use Inertia\Response;

class InventoryScanController extends Controller
{
    public function index(): Response
    {
        abort_unless(request()->user()->can('inventory-item.scan'), 403);

        return Inertia::render('Inventory/Scan/Index', [
            'query' => '',
            'results' => [],
            'searched' => false,
        ]);
    }

    public function lookup(InventoryScanRequest $request): Response|\Illuminate\Http\RedirectResponse
    {
        $query = trim($request->validated()['query']);

        $results = InventoryItem::query()
            ->with(['category', 'storeLocation'])
            ->where(function ($builder) use ($query) {
                $builder->where('barcode_value', $query)
                    ->orWhere('item_code', $query)
                    ->orWhere('item_name', 'like', "%{$query}%")
                    ->orWhereHas('batches', fn ($batchQuery) => $batchQuery->where('batch_number', $query));
            })
            ->orderBy('item_name')
            ->get();

        if ($results->count() === 1) {
            return redirect()->route('inventory.items.show', $results->first());
        }

        return Inertia::render('Inventory/Scan/Index', [
            'query' => $query,
            'results' => InventoryItemResource::collection($results),
            'searched' => true,
        ]);
    }
}
