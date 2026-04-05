import { ClipboardPlus, FileText } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppEmptyState, AppEmptyStateAction } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { ProcurementActionMenu } from '@/Components/domain/procurement/ProcurementActionMenu';
import { ProcurementFiltersBar } from '@/Components/domain/procurement/ProcurementFiltersBar';
import { RequisitionStatusBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { PriorityBadge } from '@/Components/domain/shared/PriorityBadge';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { asStringValue, hasPermission, toAppSelectOptions } from '@/Lib/procurement';
import { formatCurrency, formatShortDate, formatTitleCase } from '@/Lib/utils';
import { AppLayout } from '@/Layouts/AppLayout';
import type { RequisitionIndexPageProps, RequisitionListFilters, RequisitionListRow } from '@/types/procurement';
import type { AppDropdownItem } from '@/types/app-shell';

function requisitionActionItems(requisition: RequisitionListRow, canEdit: boolean, canCreatePo: boolean): AppDropdownItem[] {
    return [
        { label: 'View Requisition', href: route('procurement.requisitions.show', requisition.id) },
        ...(canEdit && requisition.status === 'draft'
            ? [{ label: 'Edit Draft', href: route('procurement.requisitions.edit', requisition.id) }]
            : []),
        ...(canCreatePo && ['approved', 'partially_ordered'].includes(String(requisition.status ?? ''))
            ? [{ label: 'Create Purchase Order', href: route('procurement.purchase-orders.create', { requisition: requisition.id }) }]
            : []),
    ];
}

export default function RequisitionIndexPage() {
    const { props } = useReactPage<RequisitionIndexPageProps>();
    const form = useInertiaForm<RequisitionListFilters>({
        search: props.filters.search ?? '',
        status: props.filters.status ?? '',
        requisition_type: props.filters.requisition_type ?? '',
        department_id: props.filters.department_id ?? '',
        priority: props.filters.priority ?? '',
    });
    const userPermissions = props.auth.user?.permissions ?? [];
    const canCreate = props.permissions?.create ?? false;
    const canEdit = hasPermission(userPermissions, 'requisition.edit');
    const canCreatePo = hasPermission(userPermissions, 'purchase-order.create');

    const submitFilters = () => {
        form.get(route('procurement.requisitions.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        form.setValues({
            search: '',
            status: '',
            requisition_type: '',
            department_id: '',
            priority: '',
        });

        form.get(route('procurement.requisitions.index'), {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Requisitions' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Requisition Control</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Purchase requisitions</h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Track departmental procurement requests from draft through approval, ordering, and receipt progress.
                            </p>
                        </div>
                        {canCreate ? (
                            <AppButton asChild>
                                <AppLink href={route('procurement.requisitions.create')}>
                                    <ClipboardPlus className="h-4 w-4" />
                                    Create Requisition
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
                        placeholder="Search requisition number or purpose"
                        value={form.data.search ?? ''}
                        onChange={(event) => form.setData('search', event.target.value)}
                    />
                    <AppSelect
                        value={form.data.status ?? ''}
                        onChange={(event) => form.setData('status', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.statuses, { label: 'Any status', value: '' })}
                    />
                    <AppSelect
                        value={form.data.requisition_type ?? ''}
                        onChange={(event) => form.setData('requisition_type', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.types, { label: 'Any type', value: '' })}
                    />
                    <AppSelect
                        value={form.data.department_id ?? ''}
                        onChange={(event) => form.setData('department_id', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.departments, { label: 'Any department', value: '' })}
                    />
                    <AppSelect
                        value={form.data.priority ?? ''}
                        onChange={(event) => form.setData('priority', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.priorities, { label: 'Any priority', value: '' })}
                    />
                </ProcurementFiltersBar>

                <AppTableShell
                    title="Requisition records"
                    description="Operational procurement demand and approval visibility for all departments."
                    footer={<AppPagination links={props.requisitions.links} />}
                >
                    {props.requisitions.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No requisitions found"
                                description="Adjust filters or create a new requisition to start the procurement flow."
                                icon={FileText}
                                action={
                                    canCreate ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('procurement.requisitions.create')}>Create Requisition</AppLink>
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
                                        <th className="px-6 py-3.5">Requisition</th>
                                        <th className="px-6 py-3.5">Department</th>
                                        <th className="px-6 py-3.5">Requested By</th>
                                        <th className="px-6 py-3.5">Priority</th>
                                        <th className="px-6 py-3.5">Estimated Total</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.requisitions.data.map((requisition) => (
                                        <tr key={requisition.id} className="transition hover:bg-slate-50/80">
                                            <td className="px-6 py-4">
                                                <AppLink href={route('procurement.requisitions.show', requisition.id)} className="block">
                                                    <p className="font-semibold text-slate-900">{requisition.requisition_number}</p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {formatShortDate(requisition.request_date)} • {formatTitleCase(requisition.requisition_type ?? 'request')}
                                                    </p>
                                                </AppLink>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{requisition.department_name ?? 'No department'}</td>
                                            <td className="px-6 py-4 text-slate-700">{requisition.requested_by_name ?? 'System'}</td>
                                            <td className="px-6 py-4">
                                                <PriorityBadge value={requisition.priority} />
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{formatCurrency(requisition.total_estimated_amount)}</td>
                                            <td className="px-6 py-4">
                                                <RequisitionStatusBadge value={requisition.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <ProcurementActionMenu items={requisitionActionItems(requisition, canEdit, canCreatePo)} />
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
