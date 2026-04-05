<?php

namespace App\Support;

use App\Models\User;

class AppNavigation
{
    public static function for(?User $user): array
    {
        if (! $user) {
            return [];
        }

        $sections = [
            [
                'label' => 'Overview',
                'items' => [
                    ['label' => 'Dashboard', 'route' => 'dashboard', 'permission' => 'dashboard.view'],
                ],
            ],
            [
                'label' => 'Administration',
                'items' => [
                    ['label' => 'Users', 'route' => 'admin.users.index', 'permission' => 'users.view'],
                    ['label' => 'Roles', 'route' => 'admin.roles.index', 'permission' => 'roles.view'],
                    ['label' => 'Departments', 'route' => 'organization.departments.index', 'permission' => 'departments.view'],
                    ['label' => 'Locations', 'route' => 'organization.locations.index', 'permission' => 'locations.view'],
                ],
            ],
            [
                'label' => 'Assets',
                'items' => [
                    ['label' => 'Asset Registry', 'route' => 'assets.index', 'permission' => 'asset.view'],
                    ['label' => 'Asset Categories', 'route' => 'assets.categories.index', 'permission' => 'asset-category.view'],
                    ['label' => 'Scan Asset', 'route' => 'assets.scan.index', 'permission' => 'asset.scan'],
                ],
            ],
            [
                'label' => 'Inventory',
                'items' => [
                    ['label' => 'Inventory Items', 'route' => 'inventory.items.index', 'permission' => 'inventory-item.view'],
                    ['label' => 'Inventory Categories', 'route' => 'inventory.categories.index', 'permission' => 'inventory-category.view'],
                    ['label' => 'Stock Ledger', 'route' => 'inventory.ledger.index', 'permission' => 'inventory-ledger.view'],
                    ['label' => 'Scan Item', 'route' => 'inventory.scan.index', 'permission' => 'inventory-item.scan'],
                ],
            ],
            [
                'label' => 'Procurement',
                'items' => [
                    ['label' => 'Suppliers', 'route' => 'procurement.suppliers.index', 'permission' => 'supplier.view'],
                    ['label' => 'Requisitions', 'route' => 'procurement.requisitions.index', 'permission' => 'requisition.view'],
                    ['label' => 'Purchase Orders', 'route' => 'procurement.purchase-orders.index', 'permission' => 'purchase-order.view'],
                    ['label' => 'Goods Receipts', 'route' => 'procurement.goods-receipts.index', 'permission' => 'goods-receipt.view'],
                ],
            ],
            [
                'label' => 'Maintenance',
                'items' => [
                    ['label' => 'Maintenance Tickets', 'route' => 'maintenance.index', 'permission' => 'maintenance.view'],
                    ['label' => 'Calibration Schedule', 'route' => 'maintenance.schedule', 'permission' => 'calibrations.manage'],
                ],
            ],
            [
                'label' => 'Security',
                'items' => [
                    ['label' => 'Audit Logs', 'route' => 'security.audit-logs.index', 'permission' => 'audit-logs.view'],
                ],
            ],
            [
                'label' => 'Settings',
                'items' => [
                    ['label' => 'System Settings', 'route' => 'settings.index', 'permission' => 'settings.view'],
                ],
            ],
        ];

        return collect($sections)
            ->map(function (array $section) use ($user) {
                $section['items'] = collect($section['items'])
                    ->filter(fn (array $item) => $user->can($item['permission']))
                    ->values()
                    ->all();

                return $section;
            })
            ->filter(fn (array $section) => count($section['items']) > 0)
            ->values()
            ->all();
    }
}
