<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetCategoryRequest;
use App\Http\Resources\AssetCategoryResource;
use App\Models\AssetCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetCategoryController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(AssetCategory::class, 'category');
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'active', 'parent_id']);

        $categories = AssetCategory::query()
            ->with('parent')
            ->withCount('assets')
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

        return Inertia::render('Assets/Categories/Index', [
            'filters' => $filters,
            'categories' => AssetCategoryResource::collection($categories),
            'parents' => AssetCategory::query()->whereNull('parent_id')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Assets/Categories/Form', [
            'category' => null,
            'parents' => AssetCategory::query()->whereNull('parent_id')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(AssetCategoryRequest $request): RedirectResponse
    {
        AssetCategory::query()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('assets.categories.index')
            ->with('success', 'Asset category created successfully.');
    }

    public function edit(AssetCategory $category): Response
    {
        return Inertia::render('Assets/Categories/Form', [
            'category' => AssetCategoryResource::make($category->load('parent')),
            'parents' => AssetCategory::query()
                ->whereNull('parent_id')
                ->whereKeyNot($category->id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function update(AssetCategoryRequest $request, AssetCategory $category): RedirectResponse
    {
        $category->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('assets.categories.index')
            ->with('success', 'Asset category updated successfully.');
    }

    public function destroy(AssetCategory $category): RedirectResponse
    {
        if ($category->assets()->exists()) {
            return back()->with('error', 'This asset category cannot be archived while assets are still linked to it.');
        }

        $category->delete();

        return redirect()
            ->route('assets.categories.index')
            ->with('success', 'Asset category archived successfully.');
    }
}
