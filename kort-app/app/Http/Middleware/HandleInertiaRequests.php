<?php

namespace App\Http\Middleware;

use App\Support\AppNavigation;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'app' => [
                'name' => config('kort.product_name'),
                'asset_tag_pattern' => config('kort.asset_tag_pattern'),
            ],
            'auth' => [
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'employee_id' => $request->user()->employee_id,
                        'designation' => $request->user()->designation,
                        'roles' => $request->user()->getRoleNames(),
                        'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                    ]
                    : null,
            ],
            'navigation' => AppNavigation::for($request->user()),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $request->user()
                ? [
                    'unread_count' => $request->user()->unreadNotifications()->count(),
                    'items' => $request->user()->unreadNotifications()
                        ->latest()
                        ->limit(8)
                        ->get()
                        ->map(fn ($notification) => [
                            'id' => $notification->id,
                            'title' => (string) ($notification->data['title'] ?? 'Notification'),
                            'body' => (string) ($notification->data['body'] ?? ''),
                            'url' => $notification->data['url'] ?? null,
                            'created_at' => $notification->created_at?->toDateTimeString(),
                        ])
                        ->values()
                        ->all(),
                ]
                : [
                    'unread_count' => 0,
                    'items' => [],
                ],
        ];
    }
}
