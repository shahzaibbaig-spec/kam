<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\GeneralSettingsRequest;
use App\Http\Requests\Settings\LabelSettingsRequest;
use App\Http\Requests\Settings\NotificationSettingsRequest;
use App\Services\SystemSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request, SystemSettingsService $settings): Response
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        return Inertia::render('Settings/Index', [
            'settingsNavigation' => $settings->settingsNavigation($request->user()),
            'permissions' => [
                'view' => $request->user()?->can('settings.view') ?? false,
                'update' => $request->user()?->can('settings.update') ?? false,
            ],
            'summary' => [
                'generalConfigured' => count(array_filter($settings->generalValues(), fn ($value) => $value !== null && $value !== '')),
                'labelsConfigured' => count(array_filter($settings->labelValues(), fn ($value) => $value !== null && $value !== '')),
                'notificationsConfigured' => count(array_filter($settings->notificationValues(), fn ($value) => $value !== null && $value !== '')),
            ],
        ]);
    }

    public function general(Request $request, SystemSettingsService $settings): Response
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        return Inertia::render('Settings/General', [
            'settingsNavigation' => $settings->settingsNavigation($request->user()),
            'settings' => $settings->generalValues(),
            'permissions' => [
                'update' => $request->user()?->can('settings.update') ?? false,
            ],
        ]);
    }

    public function updateGeneral(GeneralSettingsRequest $request, SystemSettingsService $settings): RedirectResponse
    {
        $settings->saveGroup('general', $request->validated());

        return redirect()->route('settings.general')->with('success', 'General settings saved successfully.');
    }

    public function labels(Request $request, SystemSettingsService $settings): Response
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        return Inertia::render('Settings/Labels', [
            'settingsNavigation' => $settings->settingsNavigation($request->user()),
            'settings' => $settings->labelValues(),
            'permissions' => [
                'update' => $request->user()?->can('settings.update') ?? false,
            ],
        ]);
    }

    public function updateLabels(LabelSettingsRequest $request, SystemSettingsService $settings): RedirectResponse
    {
        $settings->saveGroup('labels', $request->validated());

        return redirect()->route('settings.labels')->with('success', 'Label settings saved successfully.');
    }

    public function notifications(Request $request, SystemSettingsService $settings): Response
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        return Inertia::render('Settings/Notifications', [
            'settingsNavigation' => $settings->settingsNavigation($request->user()),
            'settings' => $settings->notificationValues(),
            'permissions' => [
                'update' => $request->user()?->can('settings.update') ?? false,
            ],
        ]);
    }

    public function updateNotifications(NotificationSettingsRequest $request, SystemSettingsService $settings): RedirectResponse
    {
        $settings->saveGroup('notifications', $request->validated());

        return redirect()->route('settings.notifications')->with('success', 'Notification settings saved successfully.');
    }
}
