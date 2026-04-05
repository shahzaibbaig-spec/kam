import { router } from '@inertiajs/core';
import { ArrowRightLeft, Boxes, ScanLine } from 'lucide-react';
import { useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppEmptyState, AppEmptyStateAction } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { InventoryActionMenu } from '@/Components/domain/inventory/InventoryActionMenu';
import { InventoryFiltersBar } from '@/Components/domain/inventory/InventoryFiltersBar';
import { InventoryStatusBadge } from '@/Components/domain/inventory/InventoryBadges';
import { ExpiryBadge } from '@/Components/domain/shared/ExpiryBadge';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryIndexPageProps, InventoryListFilters, InventoryListPermissions } from '@/types/inventory';
import { formatDateTime } from '@/Lib/utils';

function emptyFilters(): InventoryListFilters {
    return {
        search: '',
        category_id: '',
        location_id: '',
        supplier_id: '',
        active: '',
        low_stock: '',
        near_expiry: '',
        batch_status: '',
        temperature_sensitive: '',
        sterile_item: '',
        high_risk_item: '',
        controlled_use: '',
    };
}

function derivePermissions(permissionNames: string[]): InventoryListPermissions {
    return {
        create: permissionNames.includes('inventory-item.create'),
        receive: permissionNames.includes('stock-receipt.create'),
        issue: permissionNames.includes('stock-issue.create'),
        return: permissionNames.includes('stock-return.create'),
        transfer: permissionNames.includes('stock-transfer.create'),
        adjust: permissionNames.includes('stock-adjustment.create'),
        scan: permissionNames.includes('inventory-item.scan'),
        edit: permissionNames.includes('inventory-item.edit'),
        ledger: permissionNames.includes('inventory-ledger.view'),
    };
}

function rowPrimaryState(item: InventoryIndexPageProps['items']['data'][number]) {
    if (!item.is_active) {
        return 'inactive';
    }

    if (item.available_balance <= 0) {
        return 'exhausted';
    }

    if (item.is_low_stock) {
        return 'low_stock';
    }

    return 'in_stock';
}

export default function InventoryItemsIndexPage() {
    const { props } = useReactPage<InventoryIndexPageProps>();
    const permissionNames = props.auth.user?.permissions ?? [];
    const permissions = props.permissions ?? derivePermissions(permissionNames);
    const [filters, setFilters] = useState<InventoryListFilters>({
        ...emptyFilters(),
        ...props.filters,
    });

    const setFilter = <TField extends keyof InventoryListFilters>(field: TField, value: InventoryListFilters[TField]) => {
        setFilters((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const applyFilters = () => {
        router.get(route('inventory.items.index'), filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const next = emptyFilters();
        setFilters(next);
        router.get(route('inventory.items.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Inventory', href: route('inventory.items.index') }, { label: 'Inventory Items' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="Inventory Items"
                    description="Browse consumables, monitor live stock positions, and move quickly into receiving, issue, scan, and adjustment workflows."
                    actions={
                        <>
                            {permissions.scan ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.scan.index')}>
                                        <ScanLine className="h-4 w-4" />
                                        Scan item
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.receive ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.receipts.create')}>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Receive stock
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.issue ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.issues.create')}>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Issue stock
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.create ? (
                                <AppButton asChild>
                                    <AppLink href={route('inventory.items.create')}>
                                        <Boxes className="h-4 w-4" />
                                        Add inventory item
                                    </AppLink>
                                </AppButton>
                            ) : null}
                        </>
                    }
                />

                <InventoryFiltersBar filters={filters} options={props.filterOptions} onChange={setFilter} onSubmit={applyFilters} onReset={resetFilters} />

                <AppTableShell
                    title="Inventory list"
                    description={`Showing ${props.items.meta.from ?? 0} to ${props.items.meta.to ?? 0} of ${props.items.meta.total} inventory items.`}
                    footer={props.items.links.length > 0 ? <AppPagination links={props.items.links} /> : null}
                >
                    {props.items.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No inventory items found"
                                description="Widen the filters, reset the search, or create a new item record to start managing stock."
                                action={
                                    permissions.create ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('inventory.items.create')}>Add inventory item</AppLink>
                                        </AppEmptyStateAction>
                                    ) : undefined
                                }
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Item</th>
                                        <th className="px-5 py-3.5">Category</th>
                                        <th className="px-5 py-3.5">Store</th>
                                        <th className="px-5 py-3.5">Quantity</th>
                                        <th className="px-5 py-3.5">Flags</th>
                                        <th className="px-5 py-3.5">State</th>
                                        <th className="px-5 py-3.5">Updated</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.items.data.map((item) => (
                                        <tr key={item.id} className="transition hover:bg-blue-50/30">
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-slate-950">{item.item_name}</p>
                                                    <p className="text-xs text-slate-500">{item.item_code}</p>
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        <AppBadge variant="outline">{item.barcode_value ?? 'No barcode'}</AppBadge>
                                                        {item.supplier_name ? <AppBadge variant="neutral">{item.supplier_name}</AppBadge> : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">{item.category_name ?? 'Unassigned'}</td>
                                            <td className="px-5 py-4 text-slate-700">
                                                <p>{item.store_location_name ?? 'No default store'}</p>
                                                <p className="mt-1 text-xs text-slate-500">{item.storage_zone ?? 'Zone not set'}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {item.available_balance} {item.unit_of_measure}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    On hand {item.current_quantity} • reorder {item.reorder_level}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {item.temperature_sensitive ? <AppBadge variant="info">Temperature</AppBadge> : null}
                                                    {item.sterile_item ? <AppBadge variant="primary">Sterile</AppBadge> : null}
                                                    {item.high_risk_item ? <AppBadge variant="danger">High-risk</AppBadge> : null}
                                                    {item.controlled_use ? <AppBadge variant="warning">Controlled</AppBadge> : null}
                                                    {!item.temperature_sensitive && !item.sterile_item && !item.high_risk_item && !item.controlled_use ? (
                                                        <span className="text-xs text-slate-500">Standard</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <InventoryStatusBadge value={rowPrimaryState(item)} />
                                                    {item.near_expiry_batch_count && item.near_expiry_batch_count > 0 ? <ExpiryBadge value="near_expiry" /> : null}
                                                    {(Number(item.quarantined_quantity) || 0) > 0 ? <InventoryStatusBadge value="quarantined" /> : null}
                                                    {(Number(item.damaged_quantity) || 0) > 0 ? <InventoryStatusBadge value="damaged" /> : null}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">{formatDateTime(item.updated_at)}</td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <InventoryActionMenu item={item} permissions={permissions} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AppTableShell>
            </div>
        </AppLayout>
    );
}
