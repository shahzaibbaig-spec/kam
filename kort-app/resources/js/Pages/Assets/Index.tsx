import { router } from '@inertiajs/vue3';
import { Archive, Printer, ScanLine, Tags } from 'lucide-react';
import { useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppEmptyState, AppEmptyStateAction } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AssetActionMenu } from '@/Components/domain/assets/AssetActionMenu';
import { AssetFiltersBar } from '@/Components/domain/assets/AssetFiltersBar';
import { AssetStatusBadge } from '@/Components/domain/shared/AssetStatusBadge';
import { ConditionBadge } from '@/Components/domain/shared/ConditionBadge';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppCheckbox } from '@/Components/ui/AppCheckbox';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import type { AssetIndexPageProps, AssetListFilters, AssetListPermissions } from '@/types/assets';
import { formatDateTime, joinDisplayParts } from '@/Lib/utils';

function emptyFilters(): AssetListFilters {
    return {
        search: '',
        category_id: '',
        department_id: '',
        location_id: '',
        asset_status: '',
        condition_status: '',
        assigned_user_id: '',
        warranty: '',
        tag_generated: '',
    };
}

function derivePermissions(permissionNames: string[]): AssetListPermissions {
    return {
        create: permissionNames.includes('asset.create'),
        scan: permissionNames.includes('asset.scan'),
        bulkGenerateTags: permissionNames.includes('asset-tag.bulk-generate'),
        printLabels: permissionNames.includes('asset-tag.print'),
        edit: permissionNames.includes('asset.edit'),
        generateTag: permissionNames.includes('asset-tag.generate'),
        regenerateTag: permissionNames.includes('asset-tag.regenerate'),
        printLabel: permissionNames.includes('asset-tag.print'),
        issue: permissionNames.includes('asset-issue.create'),
        transfer: permissionNames.includes('asset-transfer.create'),
    };
}

export default function AssetsIndexPage() {
    const { props } = useReactPage<AssetIndexPageProps>();
    const permissionNames = props.auth.user?.permissions ?? [];
    const permissions = props.permissions ?? derivePermissions(permissionNames);
    const [filters, setFilters] = useState<AssetListFilters>({
        ...emptyFilters(),
        ...props.filters,
    });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const assets = props.assets.data;
    const allSelected = assets.length > 0 && assets.every((asset) => selectedIds.includes(asset.id));

    const setFilter = <TField extends keyof AssetListFilters>(field: TField, value: AssetListFilters[TField]) => {
        setFilters((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const applyFilters = () => {
        router.get(route('assets.index'), filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const next = emptyFilters();
        setFilters(next);
        router.get(route('assets.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const toggleAll = (checked: boolean) => {
        setSelectedIds(checked ? assets.map((asset) => asset.id) : []);
    };

    const toggleId = (assetId: number, checked: boolean) => {
        setSelectedIds((current) => {
            if (checked) {
                return current.includes(assetId) ? current : [...current, assetId];
            }

            return current.filter((value) => value !== assetId);
        });
    };

    const bulkGenerateTags = () => {
        if (selectedIds.length === 0) {
            return;
        }

        router.post(
            route('assets.tags.bulk-generate'),
            { asset_ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
    };

    const bulkPrintLabels = () => {
        if (selectedIds.length === 0) {
            return;
        }

        const params = new URLSearchParams();

        selectedIds.forEach((id, index) => {
            params.append(`assets[${index}]`, String(id));
        });

        window.open(`${route('assets.labels.bulk-print')}?${params.toString()}`, '_blank', 'noopener');
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Assets', href: route('assets.index') }, { label: 'Asset Registry' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="Asset Registry"
                    description="Browse, filter, and manage hospital assets with cleaner custody visibility, tagging workflows, and quick access to detailed equipment records."
                    actions={
                        <>
                            {permissions.scan ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('assets.scan.index')}>
                                        <ScanLine className="h-4 w-4" />
                                        Scan asset
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.create ? (
                                <AppButton asChild>
                                    <AppLink href={route('assets.create')}>
                                        <Archive className="h-4 w-4" />
                                        Add asset
                                    </AppLink>
                                </AppButton>
                            ) : null}
                        </>
                    }
                />

                <AssetFiltersBar filters={filters} options={props.filterOptions} onChange={setFilter} onSubmit={applyFilters} onReset={resetFilters} />

                <AppTableShell
                    title="Asset list"
                    description={`Showing ${props.assets.meta.from ?? 0} to ${props.assets.meta.to ?? 0} of ${props.assets.meta.total} tracked assets.`}
                    toolbar={
                        <div className="flex flex-col gap-3 lg:items-end">
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-3 text-sm text-slate-600">
                                    <AppCheckbox checked={allSelected} onCheckedChange={(checked) => toggleAll(checked === true)} />
                                    <span>Select current page</span>
                                </label>
                                <AppBadge variant="outline">{selectedIds.length} selected</AppBadge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {permissions.bulkGenerateTags ? (
                                    <AppButton type="button" variant="soft" size="sm" onClick={bulkGenerateTags} disabled={selectedIds.length === 0}>
                                        <Tags className="h-4 w-4" />
                                        Bulk generate tags
                                    </AppButton>
                                ) : null}
                                {permissions.printLabels ? (
                                    <AppButton type="button" variant="outline" size="sm" onClick={bulkPrintLabels} disabled={selectedIds.length === 0}>
                                        <Printer className="h-4 w-4" />
                                        Bulk print labels
                                    </AppButton>
                                ) : null}
                            </div>
                        </div>
                    }
                    footer={props.assets.links.length > 0 ? <AppPagination links={props.assets.links} /> : null}
                >
                    {assets.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No assets found"
                                description="Adjust the filters, scan a tag, or create a new asset record to start building the registry."
                                action={
                                    permissions.create ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('assets.create')}>Add asset</AppLink>
                                        </AppEmptyStateAction>
                                    ) : permissions.scan ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('assets.scan.index')}>Scan asset</AppLink>
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
                                        <th className="px-5 py-3.5"></th>
                                        <th className="px-5 py-3.5">Asset</th>
                                        <th className="px-5 py-3.5">Category</th>
                                        <th className="px-5 py-3.5">Department / Location</th>
                                        <th className="px-5 py-3.5">Assigned to</th>
                                        <th className="px-5 py-3.5">Condition</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5">Updated</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {assets.map((asset) => (
                                        <tr key={asset.id} className="transition hover:bg-blue-50/30">
                                            <td className="px-5 py-4">
                                                <AppCheckbox
                                                    checked={selectedIds.includes(asset.id)}
                                                    onCheckedChange={(checked) => toggleId(asset.id, checked === true)}
                                                />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-slate-950">{asset.asset_name}</p>
                                                    <p className="text-xs text-slate-500">{asset.asset_code}</p>
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {asset.tag_number ? <AppBadge variant="outline">{asset.tag_number}</AppBadge> : <AppBadge variant="neutral">No tag</AppBadge>}
                                                        {asset.warranty_end ? <AppBadge variant="info">Warranty {asset.warranty_end}</AppBadge> : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">{asset.category_name ?? 'Unassigned'}</td>
                                            <td className="px-5 py-4 text-slate-700">
                                                {joinDisplayParts([asset.department_name, asset.location_name], ' / ', 'Unassigned')}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">{asset.assigned_user_name ?? asset.custodian_name ?? 'Unassigned'}</td>
                                            <td className="px-5 py-4">
                                                <ConditionBadge value={asset.condition_status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <AssetStatusBadge value={asset.asset_status} />
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">{formatDateTime(asset.updated_at)}</td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <AssetActionMenu asset={asset} permissions={permissions} />
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
