import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AppInlineEmptyState } from '@/Components/data-display/AppInlineEmptyState';
import { formatDateTime, formatTitleCase } from '@/Lib/utils';

const auditActionVariantMap: Record<string, AppBadgeProps['variant']> = {
    created: 'success',
    create: 'success',
    updated: 'info',
    update: 'info',
    deleted: 'danger',
    delete: 'danger',
    approval: 'warning',
    issue: 'primary',
    transfer: 'primary',
    login: 'neutral',
    status_change: 'warning',
};

export function AuditActionBadge({ value }: { value: string | null | undefined }) {
    const variant = auditActionVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Recorded')}</AppBadge>;
}

export function AuditModuleBadge({ value }: { value: string | null | undefined }) {
    return <AppBadge variant="outline">{formatTitleCase(value ?? 'System')}</AppBadge>;
}

export function AuditDetailCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            <AppCard>
                <AppCardHeader>
                    <AppCardTitle>{title}</AppCardTitle>
                    {description ? <AppCardDescription>{description}</AppCardDescription> : null}
                </AppCardHeader>
                <AppCardContent>{children}</AppCardContent>
            </AppCard>
        </motion.div>
    );
}

export function AuditMetaList({
    items,
}: {
    items: Array<{ label: string; value: ReactNode }>;
}) {
    return (
        <dl className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{item.label}</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-950">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function AuditCodeBlock({
    title,
    value,
    emptyDescription,
}: {
    title: string;
    value: Record<string, unknown> | null | undefined;
    emptyDescription: string;
}) {
    const hasContent = value && Object.keys(value).length > 0;

    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {hasContent ? (
                <pre className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-950 px-4 py-4 text-xs leading-6 text-slate-100">
                    {JSON.stringify(value, null, 2)}
                </pre>
            ) : (
                <AppInlineEmptyState title={`No ${title.toLowerCase()} recorded`} description={emptyDescription} />
            )}
        </div>
    );
}

export function AuditSummaryLine({
    summary,
    createdAt,
}: {
    summary: string;
    createdAt: string | null;
}) {
    return (
        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">{summary}</p>
            <p className="mt-2 text-sm text-slate-600">{formatDateTime(createdAt)}</p>
        </div>
    );
}
