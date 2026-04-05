import { ClipboardPenLine, Pencil, Wrench } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppNoDataCard } from '@/Components/data-display/AppNoDataCard';
import { MaintenanceActionPanel, MaintenanceAssetSummaryCard, MaintenanceHeaderCard, MaintenanceTimelineCard } from '@/Components/domain/maintenance/MaintenanceCards';
import { MaintenanceFitBadge, MaintenanceStatusBadge } from '@/Components/domain/maintenance/MaintenanceBadges';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { asStringValue, toAppSelectOptions } from '@/Lib/forms';
import { formatCurrency, formatDateTime, formatShortDate, joinDisplayParts } from '@/Lib/utils';
import type { MaintenanceShowPageProps, MaintenanceStatusUpdateData } from '@/types/maintenance';

export default function MaintenanceShowPage() {
    const { props } = useReactPage<MaintenanceShowPageProps>();
    const { ticket, permissions } = props;
    const statusForm = useInertiaForm<MaintenanceStatusUpdateData>({
        status: ticket.status ?? 'open',
        engineer_id: asStringValue(ticket.engineer_id),
        started_at: ticket.started_at ? ticket.started_at.slice(0, 10) : '',
        completed_at: ticket.completed_at ? ticket.completed_at.slice(0, 10) : '',
        resolution_notes: ticket.resolution_notes ?? '',
        fit_status: ticket.fit_status ?? '',
    });

    const actions = (
        <>
            {permissions.viewAsset && ticket.asset_id ? (
                <AppButton asChild variant="outline">
                    <AppLink href={route('assets.show', ticket.asset_id)}>
                        <Wrench className="h-4 w-4" />
                        View Asset
                    </AppLink>
                </AppButton>
            ) : null}
            {permissions.edit ? (
                <AppButton asChild>
                    <AppLink href={route('maintenance.edit', ticket.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit Ticket
                    </AppLink>
                </AppButton>
            ) : null}
        </>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Maintenance', href: route('maintenance.index') },
                { label: ticket.ticket_number },
            ]}
        >
            <div className="space-y-6">
                <MaintenanceHeaderCard ticket={ticket} actions={actions} />

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <MaintenanceAssetSummaryCard asset={ticket.asset} />

                        <MaintenanceActionPanel
                            title="Service and downtime details"
                            description="Resolution context, fit status, parts used, and downtime impact for this incident."
                            tone={ticket.status === 'completed' || ticket.status === 'closed' ? 'success' : 'default'}
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Started</p>
                                    <p className="mt-2 font-semibold text-slate-950">{formatDateTime(ticket.started_at)}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Completed</p>
                                    <p className="mt-2 font-semibold text-slate-950">{formatDateTime(ticket.completed_at)}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Downtime</p>
                                    <p className="mt-2 font-semibold text-slate-950">
                                        {ticket.downtime_minutes ? `${ticket.downtime_minutes} minutes` : 'Not recorded'}
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Service Cost</p>
                                    <p className="mt-2 font-semibold text-slate-950">{formatCurrency(ticket.cost)}</p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fit Result</p>
                                    <div className="mt-2">
                                        <MaintenanceFitBadge value={ticket.fit_status} />
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Service Vendor</p>
                                    <p className="mt-2 font-semibold text-slate-950">{ticket.supplier_name ?? 'Internal team / not recorded'}</p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Spare Parts Used</p>
                                    {ticket.spare_parts_used.length > 0 ? (
                                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                            {ticket.spare_parts_used.map((part) => (
                                                <li key={part}>- {part}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2 text-sm text-slate-600">No spare parts were recorded for this ticket.</p>
                                    )}
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Operational Notes</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {joinDisplayParts(
                                            [
                                                ticket.warranty_claim ? 'Warranty claim in scope' : null,
                                                ticket.completed_at ? `Completed ${formatShortDate(ticket.completed_at)}` : null,
                                                ticket.engineer_name ? `Handled by ${ticket.engineer_name}` : null,
                                            ],
                                            ' / ',
                                            'No additional operational notes recorded.',
                                        )}
                                    </p>
                                </div>
                            </div>
                        </MaintenanceActionPanel>
                    </div>

                    <div className="space-y-6">
                        {permissions.changeStatus ? (
                            <MaintenanceActionPanel
                                title="Change status or add update"
                                description="Keep assignment, progress, fit result, and service notes synchronized with the ticket record."
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        statusForm.patch(route('maintenance.status.update', ticket.id));
                                    }}
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                                            <AppSelect
                                                value={statusForm.data.status}
                                                onChange={(event) => statusForm.setData('status', event.target.value)}
                                                options={toAppSelectOptions(props.statusOptions)}
                                            />
                                            {statusForm.errors.status ? <p className="mt-2 text-sm text-rose-600">{statusForm.errors.status}</p> : null}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Assign / Reassign</label>
                                            <AppSelect
                                                value={statusForm.data.engineer_id}
                                                onChange={(event) => statusForm.setData('engineer_id', event.target.value)}
                                                options={toAppSelectOptions(props.engineerOptions, { label: 'No engineer assigned', value: '' })}
                                            />
                                            {statusForm.errors.engineer_id ? <p className="mt-2 text-sm text-rose-600">{statusForm.errors.engineer_id}</p> : null}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Started</label>
                                            <AppDateField value={statusForm.data.started_at} onChange={(event) => statusForm.setData('started_at', event.target.value)} />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Completed</label>
                                            <AppDateField value={statusForm.data.completed_at} onChange={(event) => statusForm.setData('completed_at', event.target.value)} />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Fit Result</label>
                                            <AppSelect
                                                value={statusForm.data.fit_status}
                                                onChange={(event) => statusForm.setData('fit_status', event.target.value)}
                                                options={toAppSelectOptions(props.fitStatusOptions, { label: 'Not recorded', value: '' })}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Current State</label>
                                            <div className="flex h-11 items-center rounded-2xl border border-input bg-white px-4">
                                                <MaintenanceStatusBadge value={statusForm.data.status} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Work Notes / Resolution</label>
                                            <AppTextarea
                                                rows={4}
                                                value={statusForm.data.resolution_notes}
                                                onChange={(event) => statusForm.setData('resolution_notes', event.target.value)}
                                                placeholder="Add a work update, resolution note, spare part outcome, or fit-for-use statement."
                                            />
                                            {statusForm.errors.resolution_notes ? <p className="mt-2 text-sm text-rose-600">{statusForm.errors.resolution_notes}</p> : null}
                                        </div>
                                    </div>
                                    <AppButton type="submit" loading={statusForm.processing}>
                                        <ClipboardPenLine className="h-4 w-4" />
                                        Save Update
                                    </AppButton>
                                </form>
                            </MaintenanceActionPanel>
                        ) : null}

                        <MaintenanceTimelineCard ticket={ticket} />

                        {!permissions.changeStatus ? (
                            <AppNoDataCard
                                title="Status updates are read-only for this role"
                                description="You can still review the ticket, timeline, and linked asset details, but editing and service updates stay restricted."
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
