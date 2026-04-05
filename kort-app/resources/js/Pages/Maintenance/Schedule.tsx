import { router } from '@inertiajs/core';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { MaintenanceScheduleFiltersBar } from '@/Components/domain/maintenance/MaintenanceFiltersBar';
import { MaintenanceStatusBadge } from '@/Components/domain/maintenance/MaintenanceBadges';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatShortDate } from '@/Lib/utils';
import type { CalibrationScheduleFilters, MaintenanceSchedulePageProps } from '@/types/maintenance';

function emptyFilters(): CalibrationScheduleFilters {
    return {
        search: '',
        status: '',
        performed_by_id: '',
        due_state: '',
    };
}

function dueStateFor(dueAt: string | null, status: string | null, dueSoonDays: number) {
    if (!dueAt || status === 'completed') {
        return status ?? 'scheduled';
    }

    const dueDate = new Date(dueAt);
    const now = new Date();
    const dueSoon = new Date();
    dueSoon.setDate(now.getDate() + dueSoonDays);

    if (dueDate < now) {
        return 'overdue';
    }

    if (dueDate <= dueSoon) {
        return 'due_soon';
    }

    return 'upcoming';
}

export default function MaintenanceSchedulePage() {
    const { props } = useReactPage<MaintenanceSchedulePageProps>();
    const [filters, setFilters] = useState<CalibrationScheduleFilters>({ ...emptyFilters(), ...props.filters });

    const setFilter = (field: 'search' | 'status' | 'performed_by_id' | 'due_state', value: string) => {
        setFilters((current) => ({ ...current, [field]: value }));
    };

    const applyFilters = () => {
        router.get(route('maintenance.schedule'), filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const next = emptyFilters();
        setFilters(next);
        router.get(route('maintenance.schedule'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Maintenance', href: route('maintenance.index') }, { label: 'Calibration Schedule' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="Calibration and Preventive Schedule"
                    description="Keep upcoming, due-soon, and overdue calibration activity visible so equipment readiness stays audit-ready."
                    actions={
                        props.permissions.viewTickets ? (
                            <AppButton asChild variant="outline">
                                <AppLink href={route('maintenance.index')}>
                                    <ClipboardList className="h-4 w-4" />
                                    View Tickets
                                </AppLink>
                            </AppButton>
                        ) : undefined
                    }
                />

                <MaintenanceScheduleFiltersBar
                    filters={filters}
                    options={props.filterOptions}
                    onChange={setFilter}
                    onSubmit={applyFilters}
                    onReset={resetFilters}
                />

                <AppTableShell
                    title="Scheduled calibrations"
                    description={`Showing ${props.calibrations.meta.from ?? 0} to ${props.calibrations.meta.to ?? 0} of ${props.calibrations.meta.total} scheduled items.`}
                    footer={props.calibrations.links.length > 0 ? <AppPagination links={props.calibrations.links} /> : null}
                >
                    {props.calibrations.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No schedule items found"
                                description="Once calibration or preventive records are available, due states and ownership will appear here."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Asset</th>
                                        <th className="px-5 py-3.5">Certificate</th>
                                        <th className="px-5 py-3.5">Assigned</th>
                                        <th className="px-5 py-3.5">Performed</th>
                                        <th className="px-5 py-3.5">Due</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.calibrations.data.map((calibration) => {
                                        const dueState = dueStateFor(calibration.due_at, calibration.status, props.dueSoonDays);

                                        return (
                                            <tr key={calibration.id} className="transition hover:bg-blue-50/30">
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-slate-950">{calibration.asset_name ?? 'Unknown asset'}</p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {calibration.asset_code ?? 'No code'} / {calibration.serial_number ?? 'No serial'}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-slate-700">{calibration.certificate_number ?? 'Not recorded'}</td>
                                                <td className="px-5 py-4 text-slate-700">
                                                    <p>{calibration.performed_by_name ?? 'Not assigned'}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{calibration.supplier_name ?? 'Internal team'}</p>
                                                </td>
                                                <td className="px-5 py-4 text-slate-700">{formatShortDate(calibration.performed_at)}</td>
                                                <td className="px-5 py-4 text-slate-700">{formatShortDate(calibration.due_at)}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <MaintenanceStatusBadge value={dueState} />
                                                        {calibration.status && calibration.status !== dueState ? <MaintenanceStatusBadge value={calibration.status} /> : null}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <AppButton asChild size="sm" variant="ghost">
                                                            <AppLink href={route('assets.show', calibration.asset_id)}>Asset</AppLink>
                                                        </AppButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AppTableShell>
            </div>
        </AppLayout>
    );
}
