import { Building2, FilePlus2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppEmptyState, AppEmptyStateAction } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { ProcurementActionMenu } from '@/Components/domain/procurement/ProcurementActionMenu';
import { ProcurementFiltersBar } from '@/Components/domain/procurement/ProcurementFiltersBar';
import { SupplierActiveBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { hasPermission, toAppSelectOptions } from '@/Lib/procurement';
import { formatDateTime, formatTitleCase } from '@/Lib/utils';
import { AppLayout } from '@/Layouts/AppLayout';
import type { SupplierIndexPageProps, SupplierListFilters, SupplierListRow } from '@/types/procurement';
import type { AppDropdownItem } from '@/types/app-shell';

function supplierActionItems(supplier: SupplierListRow, canEdit: boolean): AppDropdownItem[] {
    return [
        { label: 'View Supplier', href: route('procurement.suppliers.show', supplier.id) },
        ...(canEdit ? [{ label: 'Edit Supplier', href: route('procurement.suppliers.edit', supplier.id) }] : []),
    ];
}

export default function SupplierIndexPage() {
    const { props } = useReactPage<SupplierIndexPageProps>();
    const form = useInertiaForm<SupplierListFilters>({
        search: props.filters.search ?? '',
        supplier_type: props.filters.supplier_type ?? '',
        active: props.filters.active ?? '',
        city: props.filters.city ?? '',
    });
    const userPermissions = props.auth.user?.permissions ?? [];
    const canCreate = props.permissions?.create ?? false;
    const canEdit = hasPermission(userPermissions, 'supplier.edit');

    const submitFilters = () => {
        form.get(route('procurement.suppliers.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        form.setValues({
            search: '',
            supplier_type: '',
            active: '',
            city: '',
        });

        form.get(route('procurement.suppliers.index'), {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Procurement' }, { label: 'Suppliers' }]}>
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Supplier Directory</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Approved procurement suppliers</h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Review vetted vendors, contact points, commercial terms, and operational activity for hospital procurement.
                            </p>
                        </div>
                        {canCreate ? (
                            <AppButton asChild>
                                <AppLink href={route('procurement.suppliers.create')}>
                                    <FilePlus2 className="h-4 w-4" />
                                    Add Supplier
                                </AppLink>
                            </AppButton>
                        ) : null}
                    </div>
                </div>

                <ProcurementFiltersBar
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitFilters();
                    }}
                    onReset={resetFilters}
                >
                    <AppSearchInput
                        placeholder="Search supplier, code, contact, or email"
                        value={form.data.search ?? ''}
                        onChange={(event) => form.setData('search', event.target.value)}
                    />
                    <AppSelect
                        value={form.data.supplier_type ?? ''}
                        onChange={(event) => form.setData('supplier_type', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.types, { label: 'Any supplier type', value: '' })}
                    />
                    <AppSelect
                        value={form.data.active ?? ''}
                        onChange={(event) => form.setData('active', event.target.value)}
                        options={[
                            { label: 'Any activity state', value: '' },
                            { label: 'Active only', value: 'true' },
                            { label: 'Inactive only', value: 'false' },
                        ]}
                    />
                    <AppSelect
                        value={form.data.city ?? ''}
                        onChange={(event) => form.setData('city', event.target.value)}
                        options={[{ label: 'Any city', value: '' }, ...props.filterOptions.cities.map((city) => ({ label: city, value: city }))]}
                    />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">{props.suppliers.meta.total}</p>
                        <p className="mt-1">Supplier records matching current filters</p>
                    </div>
                </ProcurementFiltersBar>

                <AppTableShell
                    title="Supplier records"
                    description="Search, review, and open supplier profiles without leaving the procurement workspace."
                    footer={<AppPagination links={props.suppliers.links} />}
                >
                    {props.suppliers.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No suppliers found"
                                description="Adjust filters or register a new supplier to populate the procurement directory."
                                icon={Building2}
                                action={
                                    canCreate ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('procurement.suppliers.create')}>Add Supplier</AppLink>
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
                                        <th className="px-6 py-3.5">Supplier</th>
                                        <th className="px-6 py-3.5">Type</th>
                                        <th className="px-6 py-3.5">Contact</th>
                                        <th className="px-6 py-3.5">City</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Updated</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.suppliers.data.map((supplier) => (
                                        <tr key={supplier.id} className="transition hover:bg-slate-50/80">
                                            <td className="px-6 py-4">
                                                <AppLink href={route('procurement.suppliers.show', supplier.id)} className="block">
                                                    <p className="font-semibold text-slate-900">{supplier.supplier_name}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{supplier.supplier_code ?? 'Auto code'}</p>
                                                </AppLink>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{formatTitleCase(supplier.supplier_type)}</td>
                                            <td className="px-6 py-4 text-slate-700">
                                                <p>{supplier.contact_person ?? 'No contact recorded'}</p>
                                                <p className="mt-1 text-xs text-slate-500">{supplier.phone ?? supplier.email ?? 'No phone or email'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{supplier.city ?? 'Not recorded'}</td>
                                            <td className="px-6 py-4">
                                                <SupplierActiveBadge active={supplier.is_active} />
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{formatDateTime(supplier.updated_at)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <ProcurementActionMenu items={supplierActionItems(supplier, canEdit)} />
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
