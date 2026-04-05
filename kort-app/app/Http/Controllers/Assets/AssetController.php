<?php

namespace App\Http\Controllers\Assets;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetMovementType;
use App\Enums\AssetStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Models\Department;
use App\Services\AssetCodeService;
use App\Services\AssetMovementService;
use App\Services\AssetOptionsService;
use App\Services\AssetStatusService;
use App\Services\BarcodeLabelService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Asset::class, 'asset');
    }

    public function index(Request $request, AssetOptionsService $optionsService): Response
    {
        $filters = $request->only([
            'search',
            'category_id',
            'department_id',
            'location_id',
            'asset_status',
            'condition_status',
            'assigned_user_id',
            'warranty',
            'tag_generated',
        ]);

        $assets = Asset::query()
            ->with(['category', 'department', 'location', 'assignedUser', 'assignedDepartment', 'assignedLocation', 'activeTag'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('asset_name', 'like', "%{$search}%")
                    ->orWhere('asset_code', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('tag_number', 'like', "%{$search}%")
                    ->orWhere('barcode_value', 'like', "%{$search}%"));
            })
            ->when($filters['category_id'] ?? null, fn ($query, string $categoryId) => $query->where('asset_category_id', $categoryId))
            ->when($filters['department_id'] ?? null, fn ($query, string $departmentId) => $query->where('department_id', $departmentId))
            ->when($filters['location_id'] ?? null, fn ($query, string $locationId) => $query->where('location_id', $locationId))
            ->when($filters['asset_status'] ?? null, fn ($query, string $status) => $query->where('asset_status', $status))
            ->when($filters['condition_status'] ?? null, fn ($query, string $status) => $query->where('condition_status', $status))
            ->when($filters['assigned_user_id'] ?? null, fn ($query, string $userId) => $query->where('assigned_user_id', $userId))
            ->when(($filters['tag_generated'] ?? null) === 'yes', fn ($query) => $query->whereNotNull('tag_number'))
            ->when(($filters['tag_generated'] ?? null) === 'no', fn ($query) => $query->whereNull('tag_number'))
            ->when($filters['warranty'] ?? null, function ($query, string $warranty) {
                match ($warranty) {
                    'expired' => $query->whereDate('warranty_end', '<', now()->toDateString()),
                    '30_days' => $query->whereBetween('warranty_end', [now()->toDateString(), now()->addDays(30)->toDateString()]),
                    '90_days' => $query->whereBetween('warranty_end', [now()->toDateString(), now()->addDays(90)->toDateString()]),
                    'active' => $query->whereDate('warranty_end', '>=', now()->toDateString()),
                    default => null,
                };
            })
            ->orderBy('asset_name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Assets/Index', [
            'filters' => $filters,
            'assets' => AssetResource::collection($assets),
            'filterOptions' => $optionsService->assetFormOptions(),
            'permissions' => [
                'create' => $request->user()->can('asset.create'),
                'scan' => $request->user()->can('asset.scan'),
                'bulkGenerateTags' => $request->user()->can('asset-tag.bulk-generate'),
                'printLabels' => $request->user()->can('asset-tag.print'),
                'edit' => $request->user()->can('asset.edit'),
                'generateTag' => $request->user()->can('asset-tag.generate'),
                'regenerateTag' => $request->user()->can('asset-tag.regenerate'),
                'printLabel' => $request->user()->can('asset-tag.print'),
                'issue' => $request->user()->can('asset-issue.create'),
                'transfer' => $request->user()->can('asset-transfer.create'),
            ],
        ]);
    }

    public function create(AssetOptionsService $optionsService): Response
    {
        return Inertia::render('Assets/Form', [
            'asset' => null,
            'options' => $optionsService->assetFormOptions(),
        ]);
    }

    public function store(
        AssetRequest $request,
        AssetCodeService $codeService,
        AssetMovementService $movementService,
    ): RedirectResponse {
        $validated = $request->validated();
        $status = $validated['asset_status'];
        $condition = $validated['condition_status'];

        $department = filled($validated['department_id'] ?? null)
            ? Department::query()->find($validated['department_id'])
            : null;

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('assets/images', 'public');
        }

        unset($validated['image']);

        $asset = Asset::query()->create([
            ...$validated,
            'asset_uuid' => $codeService->generateUuid(),
            'asset_code' => $validated['asset_code'] ?: $codeService->generateAssetCode($department),
            'asset_status' => $status,
            'condition_status' => $condition,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        $asset->statusLogs()->create([
            'old_status' => null,
            'new_status' => $status,
            'old_condition' => null,
            'new_condition' => $condition,
            'changed_by' => $request->user()->id,
            'changed_at' => now(),
            'reason' => 'Asset created.',
        ]);

        $movementService->record($asset, $request->user(), [
            'movement_type' => AssetMovementType::Created->value,
            'movement_datetime' => now(),
            'to_department_id' => $asset->department_id,
            'to_location_id' => $asset->location_id,
            'to_user_id' => $asset->assigned_user_id,
            'to_room_or_area' => $asset->room_or_area,
            'notes' => 'Asset record created.',
        ]);

        return redirect()
            ->route('assets.show', $asset)
            ->with('success', 'Asset created successfully.');
    }

    public function show(Asset $asset, BarcodeLabelService $labelService): Response
    {
        $asset->load([
            'category',
            'supplier',
            'department',
            'location',
            'assignedUser',
            'assignedDepartment',
            'assignedLocation',
            'activeTag',
            'activeAssignment.department',
            'activeAssignment.location',
            'activeAssignment.assignedUser',
            'activeAssignment.issuedBy',
            'assignments.department',
            'assignments.location',
            'assignments.assignedUser',
            'assignments.issuedBy',
            'assignments.receivedBy',
            'movements.fromDepartment',
            'movements.toDepartment',
            'movements.fromLocation',
            'movements.toLocation',
            'movements.fromUser',
            'movements.toUser',
            'movements.performedBy',
            'statusLogs.changedBy',
        ]);

        return Inertia::render('Assets/Show', [
            'asset' => AssetResource::make($asset),
            'labelPreview' => $asset->activeTag ? $labelService->buildLabelPayload($asset) : null,
            'permissions' => [
                'edit' => request()->user()->can('asset.edit'),
                'delete' => request()->user()->can('asset.delete'),
                'generate_tag' => request()->user()->can('asset-tag.generate'),
                'regenerate_tag' => request()->user()->can('asset-tag.regenerate'),
                'print_label' => request()->user()->can('asset-tag.print'),
                'issue' => request()->user()->can('asset-issue.create'),
                'return' => request()->user()->can('asset-return.create'),
                'transfer' => request()->user()->can('asset-transfer.create'),
                'change_status' => request()->user()->can('asset-status.change'),
            ],
        ]);
    }

    public function edit(Asset $asset, AssetOptionsService $optionsService): Response
    {
        return Inertia::render('Assets/Form', [
            'asset' => AssetResource::make($asset->load(['category', 'supplier', 'department', 'location', 'assignedUser', 'assignedDepartment', 'assignedLocation'])),
            'options' => $optionsService->assetFormOptions(),
        ]);
    }

    public function update(
        AssetRequest $request,
        Asset $asset,
        AssetCodeService $codeService,
        AssetMovementService $movementService,
        AssetStatusService $statusService,
    ): RedirectResponse {
        $validated = $request->validated();
        $requestedStatus = $validated['asset_status'];
        $requestedCondition = $validated['condition_status'];

        unset($validated['asset_status'], $validated['condition_status']);

        if (blank($validated['asset_code'] ?? null)) {
            $department = filled($validated['department_id'] ?? $asset->department_id)
                ? Department::query()->find($validated['department_id'] ?? $asset->department_id)
                : null;

            $validated['asset_code'] = $asset->asset_code ?: $codeService->generateAssetCode($department);
        }

        if ($request->hasFile('image')) {
            if ($asset->image_path) {
                Storage::disk('public')->delete($asset->image_path);
            }

            $validated['image_path'] = $request->file('image')->store('assets/images', 'public');
        }

        unset($validated['image']);

        $asset->fill([
            ...$validated,
            'updated_by' => $request->user()->id,
        ]);

        $dirtyFields = array_keys($asset->getDirty());
        $asset->save();

        $currentStatus = $asset->asset_status instanceof AssetStatus ? $asset->asset_status->value : (string) $asset->asset_status;
        $currentCondition = $asset->condition_status instanceof AssetConditionStatus ? $asset->condition_status->value : (string) $asset->condition_status;

        if ($currentStatus !== $requestedStatus || $currentCondition !== $requestedCondition) {
            $statusService->change(
                $asset,
                $requestedStatus,
                $requestedCondition,
                'Asset master record updated.',
                $request->user(),
                false,
            );

            $dirtyFields[] = 'asset_status';
            $dirtyFields[] = 'condition_status';
        }

        $dirtyFields = collect($dirtyFields)
            ->reject(fn (string $field) => $field === 'updated_at')
            ->unique()
            ->values()
            ->all();

        if ($dirtyFields !== []) {
            $movementService->record($asset, $request->user(), [
                'movement_type' => AssetMovementType::Updated->value,
                'movement_datetime' => now(),
                'from_department_id' => $asset->department_id,
                'to_department_id' => $asset->department_id,
                'from_location_id' => $asset->location_id,
                'to_location_id' => $asset->location_id,
                'from_user_id' => $asset->assigned_user_id,
                'to_user_id' => $asset->assigned_user_id,
                'from_room_or_area' => $asset->room_or_area,
                'to_room_or_area' => $asset->room_or_area,
                'notes' => 'Asset updated: '.implode(', ', $dirtyFields),
            ]);
        }

        return redirect()
            ->route('assets.show', $asset)
            ->with('success', 'Asset updated successfully.');
    }

    public function destroy(Asset $asset): RedirectResponse
    {
        if ($asset->activeAssignment()->exists()) {
            return back()->with('error', 'Active assigned assets must be returned or transferred before archiving.');
        }

        $asset->delete();

        return redirect()
            ->route('assets.index')
            ->with('success', 'Asset archived successfully.');
    }
}
