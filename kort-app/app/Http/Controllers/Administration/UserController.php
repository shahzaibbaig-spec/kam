<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administration\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\Department;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role', 'department_id', 'status']);

        $users = User::query()
            ->with(['department', 'defaultLocation', 'roles', 'permissions'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%"));
            })
            ->when($filters['department_id'] ?? null, fn ($query, string $departmentId) => $query->where('department_id', $departmentId))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['role'] ?? null, fn ($query, string $role) => $query->role($role))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Administration/Users/Index', [
            'filters' => $filters,
            'users' => UserResource::collection($users),
            'roles' => Role::query()->orderBy('name')->get(['id', 'name']),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Administration/Users/Form', [
            'user' => null,
            'roles' => Role::query()->orderBy('name')->get(['id', 'name']),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'locations' => Location::query()->with('department:id,name')->orderBy('name')->get(['id', 'department_id', 'name']),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $roles = $validated['role_names'];
        unset($validated['role_names']);

        $user = User::query()->create($validated);
        $user->syncRoles($roles);

        activity('access')
            ->performedOn($user)
            ->causedBy($request->user())
            ->event('roles-updated')
            ->withProperties(['roles' => $roles])
            ->log('User roles assigned');

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Administration/Users/Form', [
            'user' => UserResource::make($user->load(['department', 'defaultLocation', 'roles', 'permissions'])),
            'roles' => Role::query()->orderBy('name')->get(['id', 'name']),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'locations' => Location::query()->with('department:id,name')->orderBy('name')->get(['id', 'department_id', 'name']),
        ]);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $roles = $validated['role_names'];
        unset($validated['role_names']);

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $user->update($validated);
        $user->syncRoles($roles);

        activity('access')
            ->performedOn($user)
            ->causedBy($request->user())
            ->event('roles-updated')
            ->withProperties(['roles' => $roles])
            ->log('User roles synced');

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deactivated successfully.');
    }
}
