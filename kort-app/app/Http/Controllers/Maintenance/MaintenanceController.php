<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Maintenance\MaintenanceTicketRequest;
use App\Http\Resources\AssetCalibrationResource;
use App\Http\Resources\AssetMaintenanceResource;
use App\Models\Asset;
use App\Models\AssetCalibration;
use App\Models\AssetMaintenance;
use App\Services\MaintenanceOptionsService;
use App\Services\SystemSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    public function index(Request $request, MaintenanceOptionsService $options): Response
    {
        abort_unless($request->user()?->can('maintenance.view'), 403);

        $filters = $request->only(['search', 'status', 'maintenance_type', 'engineer_id', 'department_id', 'location_id', 'warranty_claim']);

        $tickets = AssetMaintenance::query()
            ->with(['asset.department', 'asset.location', 'reportedBy', 'engineer', 'supplier'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('ticket_number', 'like', "%{$search}%")
                        ->orWhere('fault_report', 'like', "%{$search}%")
                        ->orWhere('resolution_notes', 'like', "%{$search}%")
                        ->orWhereHas('asset', fn ($assetQuery) => $assetQuery
                            ->where('asset_name', 'like', "%{$search}%")
                            ->orWhere('asset_code', 'like', "%{$search}%")
                            ->orWhere('serial_number', 'like', "%{$search}%"));
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['maintenance_type'] ?? null, fn ($query, string $type) => $query->where('maintenance_type', $type))
            ->when($filters['engineer_id'] ?? null, fn ($query, string $engineerId) => $query->where('engineer_id', $engineerId))
            ->when($filters['department_id'] ?? null, fn ($query, string $departmentId) => $query->whereHas('asset', fn ($assetQuery) => $assetQuery->where('department_id', $departmentId)))
            ->when($filters['location_id'] ?? null, fn ($query, string $locationId) => $query->whereHas('asset', fn ($assetQuery) => $assetQuery->where('location_id', $locationId)))
            ->when(($filters['warranty_claim'] ?? null) === 'yes', fn ($query) => $query->where('warranty_claim', true))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Maintenance/Index', [
            'filters' => $filters,
            'tickets' => AssetMaintenanceResource::collection($tickets),
            'filterOptions' => $options->ticketOptions(),
            'permissions' => [
                'create' => ($request->user()?->can('maintenance.manage') ?? false) || ($request->user()?->can('faults.report') ?? false),
                'manage' => $request->user()?->can('maintenance.manage') ?? false,
                'viewSchedule' => $request->user()?->can('calibrations.manage') ?? false,
            ],
        ]);
    }

    public function create(Request $request, MaintenanceOptionsService $options): Response
    {
        abort_unless(($request->user()?->can('maintenance.manage') ?? false) || ($request->user()?->can('faults.report') ?? false), 403);

        $selectedAsset = $request->filled('asset')
            ? Asset::query()->with(['department', 'location', 'supplier', 'assignedUser'])->findOrFail($request->integer('asset'))
            : null;

        return Inertia::render('Maintenance/Create', [
            'ticket' => null,
            'selectedAsset' => $selectedAsset ? [
                'id' => $selectedAsset->id,
                'asset_name' => $selectedAsset->asset_name,
                'asset_code' => $selectedAsset->asset_code,
                'serial_number' => $selectedAsset->serial_number,
                'tag_number' => $selectedAsset->tag_number,
                'department_name' => $selectedAsset->department?->name,
                'location_name' => $selectedAsset->location?->name,
                'assigned_user_name' => $selectedAsset->assignedUser?->name,
                'status' => $selectedAsset->asset_status?->value ?? $selectedAsset->asset_status,
                'condition_status' => $selectedAsset->condition_status?->value ?? $selectedAsset->condition_status,
            ] : null,
            'options' => $options->ticketOptions(),
        ]);
    }

    public function store(MaintenanceTicketRequest $request): RedirectResponse
    {
        $payload = $request->validated();

        $ticket = AssetMaintenance::query()->create([
            ...$payload,
            'ticket_number' => $payload['ticket_number'] ?: $this->generateTicketNumber(),
            'status' => $payload['status'] ?: 'open',
            'reported_by_id' => $payload['reported_by_id'] ?? $request->user()?->id,
            'spare_parts_used' => collect($payload['spare_parts_used'] ?? [])->filter()->values()->all(),
        ]);

        return redirect()->route('maintenance.show', $ticket)->with('success', 'Maintenance ticket created successfully.');
    }

    public function show(Request $request, AssetMaintenance $ticket, MaintenanceOptionsService $options): Response
    {
        abort_unless($request->user()?->can('maintenance.view'), 403);

        $ticket->load([
            'asset.department',
            'asset.location',
            'asset.supplier',
            'asset.assignedUser',
            'asset.maintenances.engineer',
            'asset.maintenances.reportedBy',
            'asset.calibrations',
            'reportedBy',
            'engineer',
            'supplier',
        ]);

        return Inertia::render('Maintenance/Show', [
            'ticket' => AssetMaintenanceResource::make($ticket),
            'permissions' => [
                'edit' => $request->user()?->can('maintenance.manage') ?? false,
                'changeStatus' => $request->user()?->can('maintenance.manage') ?? false,
                'close' => $request->user()?->can('maintenance.manage') ?? false,
                'viewAsset' => $request->user()?->can('asset.view') ?? false,
                'fitCertify' => $request->user()?->can('maintenance.fit-certify') ?? false,
            ],
            'statusOptions' => $this->statusOptions(),
            'fitStatusOptions' => $this->fitStatusOptions(),
            'engineerOptions' => $options->ticketOptions()['users'],
        ]);
    }

    public function edit(Request $request, AssetMaintenance $ticket, MaintenanceOptionsService $options): Response
    {
        abort_unless($request->user()?->can('maintenance.manage'), 403);

        $ticket->load(['asset.department', 'asset.location', 'asset.supplier', 'asset.assignedUser', 'reportedBy', 'engineer', 'supplier']);

        return Inertia::render('Maintenance/Edit', [
            'ticket' => AssetMaintenanceResource::make($ticket),
            'selectedAsset' => [
                'id' => $ticket->asset?->id,
                'asset_name' => $ticket->asset?->asset_name,
                'asset_code' => $ticket->asset?->asset_code,
                'serial_number' => $ticket->asset?->serial_number,
                'tag_number' => $ticket->asset?->tag_number,
                'department_name' => $ticket->asset?->department?->name,
                'location_name' => $ticket->asset?->location?->name,
                'assigned_user_name' => $ticket->asset?->assignedUser?->name,
                'status' => $ticket->asset?->asset_status?->value ?? $ticket->asset?->asset_status,
                'condition_status' => $ticket->asset?->condition_status?->value ?? $ticket->asset?->condition_status,
            ],
            'options' => $options->ticketOptions(),
        ]);
    }

    public function update(MaintenanceTicketRequest $request, AssetMaintenance $ticket): RedirectResponse
    {
        abort_unless($request->user()?->can('maintenance.manage'), 403);

        $payload = $request->validated();

        $ticket->update([
            ...$payload,
            'ticket_number' => $payload['ticket_number'] ?: $ticket->ticket_number,
            'spare_parts_used' => collect($payload['spare_parts_used'] ?? [])->filter()->values()->all(),
        ]);

        return redirect()->route('maintenance.show', $ticket)->with('success', 'Maintenance ticket updated successfully.');
    }

    public function updateStatus(Request $request, AssetMaintenance $ticket): RedirectResponse
    {
        abort_unless($request->user()?->can('maintenance.manage'), 403);

        $validated = Validator::make($request->all(), [
            'status' => ['required', 'string', 'in:open,assigned,in_progress,awaiting_parts,completed,closed'],
            'engineer_id' => ['nullable', 'exists:users,id'],
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
            'resolution_notes' => ['nullable', 'string'],
            'fit_status' => ['nullable', 'string', 'in:fit_for_use,unfit_for_use,conditional'],
        ])->validate();

        $ticket->update($validated);

        return redirect()->route('maintenance.show', $ticket)->with('success', 'Maintenance status updated successfully.');
    }

    public function schedule(Request $request, MaintenanceOptionsService $options, SystemSettingsService $settings): Response
    {
        abort_unless(($request->user()?->can('maintenance.view') ?? false) || ($request->user()?->can('calibrations.manage') ?? false), 403);

        $filters = $request->only(['search', 'status', 'performed_by_id', 'due_state']);
        $dueSoonDays = (int) ($settings->generalValues()['maintenance_due_soon_days'] ?? 14);
        $dueSoonDate = now()->addDays($dueSoonDays);

        $calibrations = AssetCalibration::query()
            ->with(['asset.department', 'asset.location', 'performedBy', 'supplier'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('certificate_number', 'like', "%{$search}%")
                        ->orWhere('notes', 'like', "%{$search}%")
                        ->orWhereHas('asset', fn ($assetQuery) => $assetQuery
                            ->where('asset_name', 'like', "%{$search}%")
                            ->orWhere('asset_code', 'like', "%{$search}%")
                            ->orWhere('serial_number', 'like', "%{$search}%"));
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['performed_by_id'] ?? null, fn ($query, string $userId) => $query->where('performed_by_id', $userId))
            ->when($filters['due_state'] ?? null, function ($query, string $dueState) use ($dueSoonDate) {
                return match ($dueState) {
                    'overdue' => $query->where('status', '!=', 'completed')->where('due_at', '<', now()),
                    'due_soon' => $query->where('status', '!=', 'completed')->whereBetween('due_at', [now(), $dueSoonDate]),
                    'upcoming' => $query->where('status', '!=', 'completed')->where('due_at', '>', $dueSoonDate),
                    default => $query,
                };
            })
            ->orderBy('due_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Maintenance/Schedule', [
            'filters' => $filters,
            'calibrations' => AssetCalibrationResource::collection($calibrations),
            'filterOptions' => [
                ...$options->scheduleOptions(),
                'dueStates' => [
                    ['value' => 'upcoming', 'label' => 'Upcoming'],
                    ['value' => 'due_soon', 'label' => 'Due Soon'],
                    ['value' => 'overdue', 'label' => 'Overdue'],
                ],
            ],
            'permissions' => [
                'viewTickets' => $request->user()?->can('maintenance.view') ?? false,
                'manageCalibrations' => $request->user()?->can('calibrations.manage') ?? false,
            ],
            'dueSoonDays' => $dueSoonDays,
        ]);
    }

    protected function generateTicketNumber(): string
    {
        $datePrefix = now()->format('Ymd');
        $sequence = str_pad((string) (AssetMaintenance::query()->whereDate('created_at', today())->count() + 1), 4, '0', STR_PAD_LEFT);

        return "MT-{$datePrefix}-{$sequence}";
    }

    protected function statusOptions(): array
    {
        return collect(['open', 'assigned', 'in_progress', 'awaiting_parts', 'completed', 'closed'])
            ->map(fn (string $value) => ['value' => $value, 'label' => str($value)->replace('_', ' ')->title()->toString()])
            ->values()
            ->all();
    }

    protected function fitStatusOptions(): array
    {
        return collect(['fit_for_use', 'unfit_for_use', 'conditional'])
            ->map(fn (string $value) => ['value' => $value, 'label' => str($value)->replace('_', ' ')->title()->toString()])
            ->values()
            ->all();
    }
}
