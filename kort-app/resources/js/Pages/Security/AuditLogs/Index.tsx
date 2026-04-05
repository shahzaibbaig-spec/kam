import { router } from '@inertiajs/vue3';
import { Eye } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppDrawer } from '@/Components/ui/AppDrawer';
import { AuditActionBadge, AuditCodeBlock, AuditDetailCard, AuditMetaList, AuditModuleBadge, AuditSummaryLine } from '@/Components/domain/audit/AuditComponents';
import { AuditFiltersBar } from '@/Components/domain/audit/AuditFiltersBar';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatDateTime, formatTitleCase } from '@/Lib/utils';
import type { AuditLogDetailModel, AuditLogFilters, AuditLogIndexPageProps } from '@/types/audit';

function emptyFilters(): AuditLogFilters {
    return {
        search: '',
        causer_id: '',
        event: '',
        log_name: '',
        date_from: '',
        date_to: '',
    };
}

export default function AuditLogsIndexPage() {
    const { props } = useReactPage<AuditLogIndexPageProps>();
    const [filters, setFilters] = useState<AuditLogFilters>({ ...emptyFilters(), ...props.filters });
    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

    const selectedLog = useMemo<AuditLogDetailModel | null>(
        () => props.logs.data.find((log) => log.id === selectedLogId) ?? null,
        [props.logs.data, selectedLogId],
    );

    const setFilter = <TField extends keyof AuditLogFilters>(field: TField, value: AuditLogFilters[TField]) => {
        setFilters((current) => ({ ...current, [field]: value }));
    };

    const applyFilters = () => {
        router.get(route('security.audit-logs.index'), filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const next = emptyFilters();
        setFilters(next);
        router.get(route('security.audit-logs.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Security' }, { label: 'Audit Logs' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="Audit Logs"
                    description="Review user activity, workflow actions, entity changes, and request context in one readable operational timeline."
                />

                <AuditFiltersBar
                    filters={filters}
                    options={props.filterOptions}
                    onChange={setFilter}
                    onSubmit={applyFilters}
                    onReset={resetFilters}
                />

                <AppTableShell
                    title="Audit activity"
                    description={`Showing ${props.logs.meta.from ?? 0} to ${props.logs.meta.to ?? 0} of ${props.logs.meta.total} audit events.`}
                    footer={props.logs.links.length > 0 ? <AppPagination links={props.logs.links} /> : null}
                >
                    {props.logs.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No audit events found"
                                description="Try widening the date range or removing filters to restore activity records."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Timestamp</th>
                                        <th className="px-5 py-3.5">Actor</th>
                                        <th className="px-5 py-3.5">Module</th>
                                        <th className="px-5 py-3.5">Action</th>
                                        <th className="px-5 py-3.5">Entity</th>
                                        <th className="px-5 py-3.5">Summary</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.logs.data.map((log) => (
                                        <tr key={log.id} className="transition hover:bg-blue-50/30">
                                            <td className="px-5 py-4 text-slate-700">{formatDateTime(log.created_at)}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-900">{log.causer_name ?? 'System'}</p>
                                                <p className="mt-1 text-xs text-slate-500">{log.ip_address ?? 'No IP captured'}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <AuditModuleBadge value={log.module ?? log.log_name} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <AuditActionBadge value={log.action ?? log.event} />
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                <p>{formatTitleCase(log.entity_type)}</p>
                                                <p className="mt-1 text-xs text-slate-500">{log.entity_identifier}</p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">{log.summary}</td>
                                            <td className="px-5 py-4 text-right">
                                                {props.permissions.viewDetails ? (
                                                    <div className="flex justify-end">
                                                        <AppButton variant="ghost" size="sm" onClick={() => setSelectedLogId(log.id)}>
                                                            <Eye className="h-4 w-4" />
                                                            View
                                                        </AppButton>
                                                    </div>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AppTableShell>
            </div>

            <AppDrawer
                open={Boolean(selectedLog)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedLogId(null);
                    }
                }}
                title={selectedLog?.summary ?? 'Audit Detail'}
                description="Detailed before-and-after context for this recorded system action."
                widthClassName="w-full max-w-2xl"
            >
                {selectedLog ? (
                    <div className="space-y-5">
                        <AuditSummaryLine summary={selectedLog.summary} createdAt={selectedLog.created_at} />

                        <AuditDetailCard title="Action Context" description="Who performed the action and where it originated.">
                            <AuditMetaList
                                items={[
                                    { label: 'Actor', value: selectedLog.causer_name ?? 'System' },
                                    { label: 'Module', value: formatTitleCase(selectedLog.module ?? selectedLog.log_name ?? 'System') },
                                    { label: 'Action', value: formatTitleCase(selectedLog.action ?? selectedLog.event ?? 'Recorded') },
                                    { label: 'Entity', value: `${formatTitleCase(selectedLog.entity_type)} / ${selectedLog.entity_identifier}` },
                                    { label: 'IP Address', value: selectedLog.ip_address ?? 'Not recorded' },
                                    { label: 'Device', value: selectedLog.user_agent ?? 'Not recorded' },
                                ]}
                            />
                        </AuditDetailCard>

                        <AuditDetailCard title="Request Metadata" description="Captured metadata from the activity entry payload.">
                            <AuditCodeBlock
                                title="Metadata"
                                value={selectedLog.properties}
                                emptyDescription="This audit event did not include additional structured metadata."
                            />
                        </AuditDetailCard>

                        <AuditDetailCard title="Data Change Summary" description="Before and after payload snapshots when the action included tracked field changes.">
                            <div className="space-y-5">
                                <AuditCodeBlock
                                    title="Changed Fields"
                                    value={selectedLog.changes}
                                    emptyDescription="No changed-fields payload was recorded for this event."
                                />
                                <AuditCodeBlock
                                    title="Previous Values"
                                    value={selectedLog.previous}
                                    emptyDescription="No previous-values payload was recorded for this event."
                                />
                            </div>
                        </AuditDetailCard>
                    </div>
                ) : null}
            </AppDrawer>
        </AppLayout>
    );
}
