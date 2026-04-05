<?php

namespace App\Http\Controllers\Organization;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\DepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Department::class, 'department');
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type', 'active']);

        $departments = Department::query()
            ->with('manager')
            ->withCount(['users', 'locations'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('cost_center', 'like', "%{$search}%"));
            })
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('type', $type))
            ->when(isset($filters['active']) && $filters['active'] !== '', fn ($query) => $query->where('is_active', filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN)))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Organization/Departments/Index', [
            'filters' => $filters,
            'departments' => DepartmentResource::collection($departments),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Organization/Departments/Form', [
            'department' => null,
            'managers' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(DepartmentRequest $request): RedirectResponse
    {
        Department::query()->create($request->validated());

        return redirect()
            ->route('organization.departments.index')
            ->with('success', 'Department created successfully.');
    }

    public function edit(Department $department): Response
    {
        return Inertia::render('Organization/Departments/Form', [
            'department' => DepartmentResource::make($department->load('manager')),
            'managers' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(DepartmentRequest $request, Department $department): RedirectResponse
    {
        $department->update($request->validated());

        return redirect()
            ->route('organization.departments.index')
            ->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        if ($department->locations()->exists() || $department->users()->exists()) {
            return back()->with('error', 'Department cannot be archived while it still has active users or locations.');
        }

        $department->delete();

        return redirect()
            ->route('organization.departments.index')
            ->with('success', 'Department archived successfully.');
    }
}
