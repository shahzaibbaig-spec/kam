import { ArrowRightLeft, ClipboardPenLine, Pencil, RotateCcw, ScanLine } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { BatchTable } from '@/Components/domain/inventory/BatchTable';
import { InventoryFlagsCard, InventoryHeaderCard, InventoryIdentityCard, InventoryStorageCard, InventoryStockSummaryCard } from '@/Components/domain/inventory/InventoryCards';
import { InventoryLedgerTable } from '@/Components/domain/inventory/InventoryLedgerTable';
import { InventoryStatusBadge } from '@/Components/domain/inventory/InventoryBadges';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppTabs } from '@/Components/ui/AppTabs';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryBatchRecord, InventoryShowPageProps } from '@/types/inventory';
import { formatShortDate } from '@/Lib/utils';

function isNearExpiry(batch: InventoryBatchRecord, nearExpiryDays: number) {
    if (!batch.expiry_date) {
        return false;
    }

    const today = new Date();
    const expiry = new Date(batch.expiry_date);

    if (Number.isNaN(expiry.getTime()) || expiry < today) {
        return false;
    }

    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
    return diffDays <= nearExpiryDays;
}

export default function InventoryItemShowPage() {
    const { props } = useReactPage<InventoryShowPageProps>();
    const { item, permissions, nearExpiryDays } = props;

    const nearExpiryBatches = item.batches.filter((batch) => isNearExpiry(batch, nearExpiryDays));
    const quarantinedBatches = item.batches.filter((batch) => batch.status === 'quarantined');
    const damagedBatches = item.batches.filter((batch) => batch.status === 'damaged');
    const expiredBatches = item.batches.filter((batch) => batch.is_expired || batch.status === 'expired');

    return (
        <AppLayout breadcrumbs={[{ label: 'Inventory', href: route('inventory.items.index') }, { label: item.item_name }]}>
            <div className="space-y-6">
                <PageHeader
                    title={item.item_name}
                    description="Review live balances, batch risk, transaction history, and quick workflow actions for this inventory item."
                    meta={
                        <div className="flex flex-wrap gap-2">
                            <InventoryStatusBadge value={item.is_active ? 'active' : 'inactive'} />
                            {item.is_low_stock ? <InventoryStatusBadge value="low_stock" /> : <InventoryStatusBadge value="in_stock" />}
                        </div>
                    }
                    actions={
                        <>
                            {permissions.edit ? (
                                <AppButton asChild>
                                    <AppLink href={route('inventory.items.edit', item.id)}>
                                        <Pencil className="h-4 w-4" />
                                        Edit item
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.receive ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.receipts.create', { item: item.id })}>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Receive stock
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.issue ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.issues.create', { item: item.id })}>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Issue stock
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.return ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.returns.create', { item: item.id })}>
                                        <RotateCcw className="h-4 w-4" />
                                        Return stock
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.transfer ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.transfers.create', { item: item.id })}>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Transfer stock
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.adjust ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.adjustments.create', { item: item.id })}>
                                        <ClipboardPenLine className="h-4 w-4" />
                                        Adjust stock
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.scan ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('inventory.scan.index')}>
                                        <ScanLine className="h-4 w-4" />
                                        Scan item
                                    </AppLink>
                                </AppButton>
                            ) : null}
                        </>
                    }
                />

                <InventoryHeaderCard item={item} nearExpiryDays={nearExpiryDays} />

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <InventoryIdentityCard item={item} />
                        <InventoryStockSummaryCard item={item} />
                    </div>
                    <div className="space-y-6">
                        <InventoryStorageCard item={item} />
                        <InventoryFlagsCard item={item} />
                    </div>
                </div>

                <AppCard>
                    <AppCardHeader className="border-b border-slate-100">
                        <AppCardTitle>Batch and ledger visibility</AppCardTitle>
                        <AppCardDescription>Track batch health and transaction history in one operational view.</AppCardDescription>
                    </AppCardHeader>
                    <AppCardContent className="p-6">
                        <AppTabs
                            items={[
                                {
                                    value: 'batches',
                                    label: `Batches (${item.batches.length})`,
                                    content: <BatchTable items={item.batches} nearExpiryDays={nearExpiryDays} />,
                                },
                                {
                                    value: 'ledger',
                                    label: `Transactions (${item.transactions.length})`,
                                    content: <InventoryLedgerTable items={item.transactions.slice(0, 20)} />,
                                },
                                {
                                    value: 'warnings',
                                    label: 'Warnings',
                                    content: (
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                            <AppCard>
                                                <AppCardContent className="p-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Near expiry</p>
                                                    <p className="mt-3 text-2xl font-semibold text-amber-700">{nearExpiryBatches.length}</p>
                                                    <p className="mt-1 text-sm text-slate-500">Batches expiring within {nearExpiryDays} days</p>
                                                </AppCardContent>
                                            </AppCard>
                                            <AppCard>
                                                <AppCardContent className="p-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quarantined</p>
                                                    <p className="mt-3 text-2xl font-semibold text-amber-700">{quarantinedBatches.length}</p>
                                                    <p className="mt-1 text-sm text-slate-500">Held from issue</p>
                                                </AppCardContent>
                                            </AppCard>
                                            <AppCard>
                                                <AppCardContent className="p-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Damaged</p>
                                                    <p className="mt-3 text-2xl font-semibold text-rose-700">{damagedBatches.length}</p>
                                                    <p className="mt-1 text-sm text-slate-500">Damaged batch records</p>
                                                </AppCardContent>
                                            </AppCard>
                                            <AppCard>
                                                <AppCardContent className="p-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Expired</p>
                                                    <p className="mt-3 text-2xl font-semibold text-rose-700">{expiredBatches.length}</p>
                                                    <p className="mt-1 text-sm text-slate-500">Expired batch records</p>
                                                </AppCardContent>
                                            </AppCard>

                                            {nearExpiryBatches.length + quarantinedBatches.length + damagedBatches.length + expiredBatches.length === 0 ? (
                                                <div className="md:col-span-2 xl:col-span-4">
                                                    <AppEmptyState
                                                        title="No active warnings"
                                                        description="This item currently has no near-expiry, quarantined, damaged, or expired batch warnings."
                                                    />
                                                </div>
                                            ) : (
                                                <div className="md:col-span-2 xl:col-span-4">
                                                    <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
                                                        <p className="text-sm font-semibold text-slate-900">Warning details</p>
                                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                            {nearExpiryBatches.map((batch) => (
                                                                <div key={`near-${batch.id}`} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <AppBadge variant="warning">Near expiry</AppBadge>
                                                                        <span className="text-sm font-semibold text-slate-900">{batch.batch_number}</span>
                                                                    </div>
                                                                    <p className="mt-2 text-sm text-slate-700">Expiry {formatShortDate(batch.expiry_date)}</p>
                                                                </div>
                                                            ))}
                                                            {quarantinedBatches.map((batch) => (
                                                                <div key={`q-${batch.id}`} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <InventoryStatusBadge value="quarantined" />
                                                                        <span className="text-sm font-semibold text-slate-900">{batch.batch_number}</span>
                                                                    </div>
                                                                    <p className="mt-2 text-sm text-slate-700">{batch.available_quantity} available but not issuable</p>
                                                                </div>
                                                            ))}
                                                            {damagedBatches.map((batch) => (
                                                                <div key={`d-${batch.id}`} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <InventoryStatusBadge value="damaged" />
                                                                        <span className="text-sm font-semibold text-slate-900">{batch.batch_number}</span>
                                                                    </div>
                                                                    <p className="mt-2 text-sm text-slate-700">Damaged quantity {batch.damaged_quantity}</p>
                                                                </div>
                                                            ))}
                                                            {expiredBatches.map((batch) => (
                                                                <div key={`e-${batch.id}`} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <InventoryStatusBadge value="expired" />
                                                                        <span className="text-sm font-semibold text-slate-900">{batch.batch_number}</span>
                                                                    </div>
                                                                    <p className="mt-2 text-sm text-slate-700">Expired {formatShortDate(batch.expiry_date)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </AppCardContent>
                </AppCard>

                <AppCard>
                    <AppCardHeader className="border-b border-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <AppCardTitle>Notes</AppCardTitle>
                                <AppCardDescription>Operational notes and handling reminders for this inventory item.</AppCardDescription>
                            </div>
                            {permissions.ledger ? (
                                <AppButton asChild variant="outline" size="sm">
                                    <AppLink href={route('inventory.ledger.index', { item_id: item.id })}>Open full ledger</AppLink>
                                </AppButton>
                            ) : null}
                        </div>
                    </AppCardHeader>
                    <AppCardContent className="p-6 text-sm leading-6 text-slate-700">
                        {item.notes ? item.notes : 'No additional notes have been recorded for this item.'}
                    </AppCardContent>
                </AppCard>
            </div>
        </AppLayout>
    );
}
