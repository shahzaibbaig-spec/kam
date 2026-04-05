<?php

namespace App\Http\Controllers\Organization;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\LocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Location::class, 'location');
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'department_id', 'storage_type', 'active']);

        $locations = Location::query()
            ->with(['department', 'parent'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%"));
            })
            ->when($filters['department_id'] ?? null, fn ($query, string $departmentId) => $query->where('department_id', $departmentId))
            ->when($filters['storage_type'] ?? null, fn ($query, string $type) => $query->where('storage_type', $type))
            ->when(isset($filters['active']) && $filters['active'] !== '', fn ($query) => $query->where('is_active', filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN)))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Organization/Locations/Index', [
            'filters' => $filters,
            'locations' => LocationResource::collection($locations),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Organization/Locations/Form', [
            'location' => null,
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'parents' => Location::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(LocationRequest $request): RedirectResponse
    {
        Location::query()->create($request->validated());

        return redirect()
            ->route('organization.locations.index')
            ->with('success', 'Location created successfully.');
    }

    public function edit(Location $location): Response
    {
        return Inertia::render('Organization/Locations/Form', [
            'location' => LocationResource::make($location->load(['department', 'parent'])),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'parents' => Location::query()->whereKeyNot($location->id)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(LocationRequest $request, Location $location): RedirectResponse
    {
        $location->update($request->validated());

        return redirect()
            ->route('organization.locations.index')
            ->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location): RedirectResponse
    {
        if ($location->users()->exists()) {
            return back()->with('error', 'Location cannot be archived while users are assigned to it.');
        }

        $location->delete();

        return redirect()
            ->route('organization.locations.index')
            ->with('success', 'Location archived successfully.');
    }
}
