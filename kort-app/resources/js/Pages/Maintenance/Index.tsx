import { router } from '@inertiajs/vue3';
import { CalendarClock, ClipboardPlus } from 'lucide-react';
import { useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppEmptyState, AppEmptyStateAction } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { MaintenanceActionMenu } from '@/Components/domain/maintenance/MaintenanceActionMenu';
import { MaintenanceFiltersBar } from '@/Components/domain/maintenance/MaintenanceFiltersBar';
import { MaintenanceStatusBadge } from '@/Components/domain/maintenance/MaintenanceBadges';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import { hasPermission } from '@/Lib/forms';
import { formatDateTime, formatTitleCase } from '@/Lib/utils';
import type { MaintenanceIndexPageProps, MaintenanceListFilters } from '@/types/maintenance';

function emptyFilters(): MaintenanceListFilters {
    return {
        search: '',
        status: '',
        maintenance_type: '',
        engineer_id: '',
        department_id: '',
        location_id: '',
        warranty_claim: '',
    };
}

export default function MaintenanceIndexPage() {
    const { props } = useReactPage<MaintenanceIndexPageProps>();
    const [filters, setFilters] = useState<MaintenanceListFilters>({ ...emptyFilters(), ...props.filters });
    const canViewAsset = hasPermission(props.auth.user?.permissions, 'asset.view');
    const createLabel = hasPermission(props.auth.user?.permissions, 'maintenance.manage') ? 'Create maintenance ticket' : 'Report issue';

    const setFilter = <TField extends keyof MaintenanceListFilters>(field: TField, value: MaintenanceListFilters[TField]) => {
        setFilters((current) => ({ ...current, [field]: value }));
    };

    const applyFilters = () => {
        router.get(route('maintenance.index'), filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const next = emptyFilters();
        setFilters(next);
        router.get(route('maintenance.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Maintenance' }, { label: 'Maintenance Tickets' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="Maintenance Tickets"
                    description="Track corrective and preventive service work, assign engineers clearly, and keep equipment downtime visible to hospital operations."
                    actions={
                        <>
                            {props.permissions.viewSchedule ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('maintenance.schedule')}>
                                        <CalendarClock className="h-4 w-4" />
                                        Calibration Schedule
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {props.permissions.create ? (
                                <AppButton asChild>
                                    <AppLink href={route('maintenance.create')}>
                                        <ClipboardPlus className="h-4 w-4" />
                                        {createLabel}
                                    </AppLink>
                                </AppButton>
                            ) : null}
                        </>
                    }
                />

                <MaintenanceFiltersBar
                    filters={filters}
                    options={props.filterOptions}
                    onChange={setFilter}
                    onSubmit={applyFilters}
                    onReset={resetFilters}
                />

                <AppTableShell
                    title="Maintenance queue"
                    description={`Showing ${props.tickets.meta.from ?? 0} to ${props.tickets.meta.to ?? 0} of ${props.tickets.meta.total} maintenance tickets.`}
                    footer={props.tickets.links.length > 0 ? <AppPagination links={props.tickets.links} /> : null}
                >
                    {props.tickets.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No maintenance tickets found"
                                description="Adjust the filters or create a new ticket so engineering and biomedical staff can begin tracking work."
                                action={
                                    props.permissions.create ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('maintenance.create')}>{createLabel}</AppLink>
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
                                        <th className="px-5 py-3.5">Ticket</th>
                                        <th className="px-5 py-3.5">Asset</th>
                                        <th className="px-5 py-3.5">Context</th>
                                        <th className="px-5 py-3.5">Ownership</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5">Updated</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.tickets.data.map((ticket) => (
                                        <tr key={ticket.id} className="transition hover:bg-blue-50/30">
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-slate-950">{ticket.ticket_number}</p>
                                                    <p className="text-xs text-slate-500">{formatTitleCase(ticket.maintenance_type ?? 'Maintenance')}</p>
                                                    {ticket.warranty_claim ? <AppBadge variant="warning">Warranty</AppBadge> : null}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-900">{ticket.asset_name ?? 'No asset linked'}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {ticket.asset_code ?? 'No code'} / {ticket.asset_serial_number ?? 'No serial'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                <p>{ticket.department_name ?? 'No department'}</p>
                                                <p className="mt-1 text-xs text-slate-500">{ticket.location_name ?? 'No location'}</p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                <p>{ticket.reported_by_name ?? 'System'}</p>
                                                <p className="mt-1 text-xs text-slate-500">{ticket.engineer_name ?? 'Awaiting assignment'}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-2">
                                                    <MaintenanceStatusBadge value={ticket.status} />
                                                    <p className="text-xs text-slate-500">
                                                        {ticket.downtime_minutes ? `${ticket.downtime_minutes} min downtime` : 'Downtime not recorded'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">{formatDateTime(ticket.updated_at)}</td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <MaintenanceActionMenu ticket={ticket} canEdit={props.permissions.manage} canViewAsset={canViewAsset} />
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
