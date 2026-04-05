<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administration\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Support\PermissionRegistry;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::query()
            ->with(['permissions'])
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return Inertia::render('Administration/Roles/Index', [
            'roles' => RoleResource::collection($roles),
            'permissionGroups' => PermissionRegistry::groups(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Role::class);

        return Inertia::render('Administration/Roles/Form', [
            'role' => null,
            'permissionGroups' => PermissionRegistry::groups(),
        ]);
    }

    public function store(RoleRequest $request): RedirectResponse
    {
        $this->authorize('create', Role::class);

        $role = Role::query()->create([
            'name' => $request->validated('name'),
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($request->validated('permissions', []));

        activity('access')
            ->performedOn($role)
            ->causedBy($request->user())
            ->event('created')
            ->withProperties(['permissions' => $request->validated('permissions', [])])
            ->log('Role created');

        return redirect()
            ->route('admin.roles.index')
            ->with('success', 'Role created successfully.');
    }

    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);

        return Inertia::render('Administration/Roles/Form', [
            'role' => RoleResource::make($role->load('permissions')),
            'permissionGroups' => PermissionRegistry::groups(),
        ]);
    }

    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        $role->update([
            'name' => $request->validated('name'),
        ]);

        $role->syncPermissions($request->validated('permissions', []));

        activity('access')
            ->performedOn($role)
            ->causedBy($request->user())
            ->event('updated')
            ->withProperties(['permissions' => $request->validated('permissions', [])])
            ->log('Role permissions updated');

        return redirect()
            ->route('admin.roles.index')
            ->with('success', 'Role updated successfully.');
    }
}
