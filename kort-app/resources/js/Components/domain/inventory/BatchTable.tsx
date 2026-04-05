import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { BatchStatusBadge } from '@/Components/domain/inventory/InventoryBadges';
import { ExpiryBadge } from '@/Components/domain/shared/ExpiryBadge';
import type { InventoryBatchRecord } from '@/types/inventory';
import { formatCurrency, formatShortDate } from '@/Lib/utils';

export interface BatchTableProps {
    items: InventoryBatchRecord[];
    nearExpiryDays: number;
}

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

export function BatchTable({ items, nearExpiryDays }: BatchTableProps) {
    if (items.length === 0) {
        return (
            <AppEmptyState
                title="No batches available"
                description="Batch details will appear here once stock receipts or opening balances are posted."
                className="border-none bg-slate-50"
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                    <tr>
                        <th className="px-5 py-3.5">Batch</th>
                        <th className="px-5 py-3.5">Dates</th>
                        <th className="px-5 py-3.5">Store</th>
                        <th className="px-5 py-3.5">Balances</th>
                        <th className="px-5 py-3.5">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((batch) => (
                        <tr key={batch.id} className="transition hover:bg-slate-50/70">
                            <td className="px-5 py-4">
                                <p className="font-semibold text-slate-950">{batch.batch_number}</p>
                                <p className="mt-1 text-xs text-slate-500">{batch.lot_number ? `Lot ${batch.lot_number}` : 'No lot number'}</p>
                                {batch.unit_cost ? <p className="mt-1 text-xs text-slate-500">Unit cost {formatCurrency(batch.unit_cost)}</p> : null}
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                                <p>Mfg {formatShortDate(batch.manufacture_date)}</p>
                                <p className="mt-1">Expiry {formatShortDate(batch.expiry_date)}</p>
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                                <p>{batch.store_location_name ?? 'No store location'}</p>
                                <p className="mt-1 text-xs text-slate-500">{batch.storage_zone ?? 'Zone not set'}</p>
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-600">
                                <p>Available: {batch.available_quantity}</p>
                                <p>Reserved: {batch.reserved_quantity}</p>
                                <p>Issued: {batch.issued_quantity}</p>
                                <p>Damaged: {batch.damaged_quantity}</p>
                                <p>Quarantined: {batch.quarantined_quantity}</p>
                                <p>Expired: {batch.expired_quantity}</p>
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex flex-wrap gap-2">
                                    <BatchStatusBadge value={batch.status} />
                                    {batch.is_expired ? <ExpiryBadge value="expired" /> : null}
                                    {isNearExpiry(batch, nearExpiryDays) ? <ExpiryBadge value="near_expiry" /> : null}
                                    {batch.is_issuable ? <AppBadge variant="success">Issuable</AppBadge> : <AppBadge variant="neutral">Restricted</AppBadge>}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
