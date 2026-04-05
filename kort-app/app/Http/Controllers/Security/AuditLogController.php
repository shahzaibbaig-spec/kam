<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('audit-logs.view'), 403);

        $filters = $request->only(['search', 'causer_id', 'event', 'log_name', 'date_from', 'date_to']);

        $logs = Activity::query()
            ->with('causer')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('description', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%"));
            })
            ->when($filters['causer_id'] ?? null, fn ($query, string $causerId) => $query->where('causer_id', $causerId))
            ->when($filters['event'] ?? null, fn ($query, string $event) => $query->where('event', $event))
            ->when($filters['log_name'] ?? null, fn ($query, string $logName) => $query->where('log_name', $logName))
            ->when($filters['date_from'] ?? null, fn ($query, string $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn ($query, string $to) => $query->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Security/AuditLogs/Index', [
            'filters' => $filters,
            'logs' => ActivityLogResource::collection($logs),
            'filterOptions' => [
                'users' => User::query()->orderBy('name')->get(['id', 'name']),
                'events' => Activity::query()->whereNotNull('event')->distinct()->orderBy('event')->pluck('event'),
                'modules' => Activity::query()->whereNotNull('log_name')->distinct()->orderBy('log_name')->pluck('log_name'),
            ],
            'permissions' => [
                'viewDetails' => $request->user()?->can('audit-logs.view') ?? false,
            ],
        ]);
    }
}
