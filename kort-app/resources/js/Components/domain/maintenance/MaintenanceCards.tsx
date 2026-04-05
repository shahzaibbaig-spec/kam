import { motion } from 'framer-motion';
import { Clock3, ClipboardList, Wrench } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppInlineEmptyState } from '@/Components/data-display/AppInlineEmptyState';
import { MaintenanceFitBadge, MaintenanceStatusBadge } from '@/Components/domain/maintenance/MaintenanceBadges';
import { AssetStatusBadge } from '@/Components/domain/shared/AssetStatusBadge';
import { ConditionBadge } from '@/Components/domain/shared/ConditionBadge';
import { cn, formatCurrency, formatDateTime, formatShortDate, formatTitleCase, joinDisplayParts } from '@/Lib/utils';
import type { MaintenanceAssetSummary, MaintenanceDetailModel } from '@/types/maintenance';

interface MetricItem {
    label: string;
    value: ReactNode;
    helper?: ReactNode;
}

function MetricGrid({ items, columns = 3 }: { items: MetricItem[]; columns?: 2 | 3 | 4 }) {
    const columnClassMap = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 xl:grid-cols-3',
        4: 'md:grid-cols-2 xl:grid-cols-4',
    } as const;

    return (
        <dl className={cn('grid gap-4', columnClassMap[columns])}>
            {items.map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{item.label}</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-950">{item.value}</dd>
                    {item.helper ? <div className="mt-2 text-xs leading-5 text-slate-500">{item.helper}</div> : null}
                </div>
            ))}
        </dl>
    );
}

export interface MaintenanceHeaderCardProps {
    ticket: MaintenanceDetailModel;
    actions?: ReactNode;
}

export function MaintenanceHeaderCard({ ticket, actions }: MaintenanceHeaderCardProps) {
    return (
        <AppCard className="overflow-hidden">
            <AppCardHeader className="gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <MaintenanceStatusBadge value={ticket.status} />
                        {ticket.fit_status ? <MaintenanceFitBadge value={ticket.fit_status} /> : null}
                        {ticket.warranty_claim ? <AppBadge variant="warning">Warranty Claim</AppBadge> : null}
                        <AppBadge variant="outline">{formatTitleCase(ticket.maintenance_type ?? 'Maintenance')}</AppBadge>
                    </div>
                    <div>
                        <AppCardTitle className="text-2xl">{ticket.ticket_number}</AppCardTitle>
                        <AppCardDescription className="mt-2">
                            {joinDisplayParts(
                                [ticket.asset_name, ticket.asset_code, ticket.engineer_name ?? ticket.reported_by_name],
                                ' / ',
                                'Maintenance ticket',
                            )}
                        </AppCardDescription>
                    </div>
                </div>
                {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
            </AppCardHeader>
            <AppCardContent className="pt-6">
                <MetricGrid
                    columns={4}
                    items={[
                        { label: 'Reported By', value: ticket.reported_by_name ?? 'Not recorded' },
                        { label: 'Assigned To', value: ticket.engineer_name ?? 'Not assigned' },
                        { label: 'Downtime', value: ticket.downtime_minutes ? `${ticket.downtime_minutes} min` : 'Not recorded' },
                        { label: 'Cost', value: formatCurrency(ticket.cost) },
                    ]}
                />
                {ticket.fault_report ? (
                    <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Issue Description</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{ticket.fault_report}</p>
                    </div>
                ) : null}
            </AppCardContent>
        </AppCard>
    );
}

export interface MaintenanceAssetSummaryCardProps {
    asset: MaintenanceAssetSummary | null | undefined;
}

export function MaintenanceAssetSummaryCard({ asset }: MaintenanceAssetSummaryCardProps) {
    return (
        <AppCard>
            <AppCardHeader>
                <AppCardTitle>Asset Summary</AppCardTitle>
                <AppCardDescription>Linked equipment identity, assignment, and current operational state.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
                {!asset ? (
                    <AppInlineEmptyState
                        title="No linked asset summary"
                        description="Select an asset to keep location, assignment, and service context visible."
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                            {asset.status ? <AssetStatusBadge value={asset.status} /> : null}
                            {asset.condition_status ? <ConditionBadge value={asset.condition_status} /> : null}
                            {asset.tag_number ? <AppBadge variant="outline">{asset.tag_number}</AppBadge> : null}
                        </div>
                        <MetricGrid
                            columns={2}
                            items={[
                                { label: 'Asset', value: joinDisplayParts([asset.asset_name, asset.asset_code], ' / ') },
                                { label: 'Serial Number', value: asset.serial_number ?? 'Not recorded' },
                                { label: 'Department', value: asset.department_name ?? 'Not assigned' },
                                { label: 'Location', value: joinDisplayParts([asset.location_name, asset.room_or_area], ' / ', 'Not assigned') },
                                { label: 'Assigned User', value: asset.assigned_user_name ?? 'Not assigned' },
                                { label: 'Supplier', value: asset.supplier_name ?? 'Not recorded' },
                            ]}
                        />
                    </div>
                )}
            </AppCardContent>
        </AppCard>
    );
}

export interface MaintenanceActionPanelProps {
    title: string;
    description: string;
    tone?: 'default' | 'warning' | 'success';
    children: ReactNode;
}

export function MaintenanceActionPanel({
    title,
    description,
    tone = 'default',
    children,
}: MaintenanceActionPanelProps) {
    const toneClassMap = {
        default: 'border-slate-200 bg-white',
        warning: 'border-amber-200 bg-amber-50/50',
        success: 'border-emerald-200 bg-emerald-50/50',
    } as const;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            <AppCard className={toneClassMap[tone]}>
                <AppCardHeader>
                    <AppCardTitle>{title}</AppCardTitle>
                    <AppCardDescription>{description}</AppCardDescription>
                </AppCardHeader>
                <AppCardContent>{children}</AppCardContent>
            </AppCard>
        </motion.div>
    );
}

export interface MaintenanceTimelineCardProps {
    ticket: MaintenanceDetailModel;
}

export function MaintenanceTimelineCard({ ticket }: MaintenanceTimelineCardProps) {
    const milestones = [
        {
            id: 'created',
            label: 'Ticket Created',
            value: formatDateTime(ticket.created_at),
            helper: ticket.reported_by_name ?? 'Reported without a named user',
        },
        ...(ticket.started_at
            ? [
                  {
                      id: 'started',
                      label: 'Work Started',
                      value: formatDateTime(ticket.started_at),
                      helper: ticket.engineer_name ?? 'Assigned engineer not recorded',
                  },
              ]
            : []),
        ...(ticket.completed_at
            ? [
                  {
                      id: 'completed',
                      label: 'Completed',
                      value: formatDateTime(ticket.completed_at),
                      helper: ticket.fit_status ? `Fit result: ${formatTitleCase(ticket.fit_status)}` : 'No fit result recorded',
                  },
              ]
            : []),
    ];

    return (
        <AppCard className="h-full">
            <AppCardHeader>
                <AppCardTitle>Timeline and History</AppCardTitle>
                <AppCardDescription>Recent service milestones and related maintenance incidents for the same asset.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="space-y-6">
                <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
                                {index !== milestones.length - 1 ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
                            </div>
                            <div className="min-w-0 flex-1 rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-slate-900">{milestone.label}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Clock3 className="h-4 w-4" />
                                        <span>{milestone.value}</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{milestone.helper}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Related maintenance history</p>
                        <p className="mt-1 text-sm text-slate-600">Use this to spot repeated failures and downtime patterns on the same equipment.</p>
                    </div>
                    {ticket.recent_history && ticket.recent_history.length > 0 ? (
                        <div className="space-y-3">
                            {ticket.recent_history.map((entry) => (
                                <div key={entry.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-900">{entry.ticket_number}</p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {formatTitleCase(entry.maintenance_type ?? 'Maintenance')} / {entry.engineer_name ?? 'No engineer'}
                                            </p>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <MaintenanceStatusBadge value={entry.status} />
                                            <p className="text-xs text-slate-500">{formatShortDate(entry.completed_at ?? entry.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AppEmptyState
                            title="No related maintenance history"
                            description="This asset does not have earlier maintenance incidents in the loaded history set."
                            icon={ClipboardList}
                        />
                    )}
                </div>

                {ticket.next_calibration ? (
                    <div className="rounded-3xl border border-sky-200 bg-sky-50/70 px-4 py-4">
                        <p className="text-sm font-semibold text-sky-950">Next calibration reference</p>
                        <p className="mt-2 text-sm leading-6 text-sky-900/80">
                            Certificate {ticket.next_calibration.certificate_number ?? 'not recorded'} is due on{' '}
                            {formatShortDate(ticket.next_calibration.due_at)}.
                        </p>
                    </div>
                ) : null}

                {ticket.resolution_notes ? (
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">Resolution Notes</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{ticket.resolution_notes}</p>
                    </div>
                ) : (
                    <AppInlineEmptyState
                        title="No resolution notes yet"
                        description="Once service work is recorded, the outcome and fit status will appear here."
                        icon={Wrench}
                    />
                )}
            </AppCardContent>
        </AppCard>
    );
}
