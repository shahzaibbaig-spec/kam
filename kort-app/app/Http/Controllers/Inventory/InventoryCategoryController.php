<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\InventoryCategoryRequest;
use App\Http\Resources\InventoryCategoryResource;
use App\Models\InventoryCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryCategoryController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(InventoryCategory::class, 'category');
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'active', 'parent_id']);

        $categories = InventoryCategory::query()
            ->with('parent')
            ->withCount('items')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%"));
            })
            ->when(isset($filters['active']) && $filters['active'] !== '', fn ($query) => $query->where('is_active', filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN)))
            ->when($filters['parent_id'] ?? null, fn ($query, string $parentId) => $query->where('parent_id', $parentId))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Inventory/Categories/Index', [
            'filters' => $filters,
            'categories' => InventoryCategoryResource::collection($categories),
            'parents' => InventoryCategory::query()->whereNull('parent_id')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Inventory/Categories/Form', [
            'category' => null,
            'parents' => InventoryCategory::query()->whereNull('parent_id')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(InventoryCategoryRequest $request): RedirectResponse
    {
        $category = InventoryCategory::query()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        activity('inventory')
            ->performedOn($category)
            ->causedBy($request->user())
            ->event('inventory-category-created')
            ->log('Inventory category created');

        return redirect()
            ->route('inventory.categories.index')
            ->with('success', 'Inventory category created successfully.');
    }

    public function edit(InventoryCategory $category): Response
    {
        return Inertia::render('Inventory/Categories/Form', [
            'category' => InventoryCategoryResource::make($category->load('parent')),
            'parents' => InventoryCategory::query()
                ->whereNull('parent_id')
                ->whereKeyNot($category->id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function update(InventoryCategoryRequest $request, InventoryCategory $category): RedirectResponse
    {
        $category->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        activity('inventory')
            ->performedOn($category)
            ->causedBy($request->user())
            ->event('inventory-category-updated')
            ->log('Inventory category updated');

        return redirect()
            ->route('inventory.categories.index')
            ->with('success', 'Inventory category updated successfully.');
    }

    public function destroy(InventoryCategory $category): RedirectResponse
    {
        if ($category->items()->exists()) {
            return back()->with('error', 'This inventory category cannot be archived while items are still linked to it.');
        }

        $category->delete();

        activity('inventory')
            ->performedOn($category)
            ->causedBy(request()->user())
            ->event('inventory-category-archived')
            ->log('Inventory category archived');

        return redirect()
            ->route('inventory.categories.index')
            ->with('success', 'Inventory category archived successfully.');
    }
}
