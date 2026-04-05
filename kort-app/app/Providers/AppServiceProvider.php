<?php

namespace App\Providers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\GoodsReceipt;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequisition;
use App\Models\Supplier;
use App\Models\User;
use App\Policies\AssetCategoryPolicy;
use App\Policies\AssetPolicy;
use App\Policies\GoodsReceiptPolicy;
use App\Policies\InventoryCategoryPolicy;
use App\Policies\InventoryItemPolicy;
use App\Policies\PurchaseOrderPolicy;
use App\Policies\PurchaseRequisitionPolicy;
use App\Policies\RolePolicy;
use App\Policies\SupplierPolicy;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Role;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Asset::class, AssetPolicy::class);
        Gate::policy(AssetCategory::class, AssetCategoryPolicy::class);
        Gate::policy(InventoryCategory::class, InventoryCategoryPolicy::class);
        Gate::policy(InventoryItem::class, InventoryItemPolicy::class);
        Gate::policy(Supplier::class, SupplierPolicy::class);
        Gate::policy(PurchaseRequisition::class, PurchaseRequisitionPolicy::class);
        Gate::policy(PurchaseOrder::class, PurchaseOrderPolicy::class);
        Gate::policy(GoodsReceipt::class, GoodsReceiptPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);
        Gate::before(fn (User $user, string $ability) => $user->hasRole('Super Admin') ? true : null);

        Event::listen(Login::class, function (Login $event): void {
            $event->user->forceFill(['last_login_at' => now()])->saveQuietly();

            activity('auth')
                ->causedBy($event->user)
                ->event('login')
                ->withProperties([
                    'ip_address' => request()?->ip(),
                    'user_agent' => request()?->userAgent(),
                ])
                ->log('User logged in');
        });

        Event::listen(Logout::class, function (Logout $event): void {
            if (! $event->user) {
                return;
            }

            activity('auth')
                ->causedBy($event->user)
                ->event('logout')
                ->withProperties([
                    'ip_address' => request()?->ip(),
                    'user_agent' => request()?->userAgent(),
                ])
                ->log('User logged out');
        });
    }
}
