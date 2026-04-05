import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { InventoryStatusBadge } from '@/Components/domain/inventory/InventoryBadges';
import type { InventoryTransactionRecord } from '@/types/inventory';
import { formatDateTime, joinDisplayParts } from '@/Lib/utils';

export interface InventoryLedgerTableProps {
    items: InventoryTransactionRecord[];
}

export function InventoryLedgerTable({ items }: InventoryLedgerTableProps) {
    if (items.length === 0) {
        return (
            <AppEmptyState
                title="No ledger entries yet"
                description="Receipts, issues, returns, transfers, and adjustments will appear here once transactions are posted."
                className="border-none bg-slate-50"
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                    <tr>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Type</th>
                        <th className="px-5 py-3.5">Batch</th>
                        <th className="px-5 py-3.5">Quantity</th>
                        <th className="px-5 py-3.5">Balance</th>
                        <th className="px-5 py-3.5">Movement</th>
                        <th className="px-5 py-3.5">Reference</th>
                        <th className="px-5 py-3.5">By</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((transaction) => (
                        <tr key={transaction.id} className="transition hover:bg-slate-50/70">
                            <td className="px-5 py-4 text-slate-700">{formatDateTime(transaction.transaction_datetime)}</td>
                            <td className="px-5 py-4">
                                <InventoryStatusBadge value={transaction.transaction_type} />
                            </td>
                            <td className="px-5 py-4 text-slate-700">{transaction.batch_number ?? 'N/A'}</td>
                            <td className="px-5 py-4 text-slate-700">
                                {transaction.quantity} {transaction.unit_of_measure}
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-600">
                                <p>Before: {transaction.before_quantity}</p>
                                <p>After: {transaction.after_quantity}</p>
                                {transaction.before_batch_quantity !== null && transaction.before_batch_quantity !== undefined ? (
                                    <p>Batch before: {transaction.before_batch_quantity}</p>
                                ) : null}
                                {transaction.after_batch_quantity !== null && transaction.after_batch_quantity !== undefined ? (
                                    <p>Batch after: {transaction.after_batch_quantity}</p>
                                ) : null}
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                                {joinDisplayParts(
                                    [
                                        transaction.from_location_name ? `From ${transaction.from_location_name}` : null,
                                        transaction.to_location_name ? `To ${transaction.to_location_name}` : null,
                                        transaction.from_department_name ? `From ${transaction.from_department_name}` : null,
                                        transaction.to_department_name ? `To ${transaction.to_department_name}` : null,
                                        transaction.issued_to_user_name ? `Issue to ${transaction.issued_to_user_name}` : null,
                                        transaction.received_from_user_name ? `Return from ${transaction.received_from_user_name}` : null,
                                    ],
                                    ' • ',
                                    'No movement metadata',
                                )}
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                                <div className="space-y-1">
                                    <p>{transaction.reference_number ?? 'Manual'}</p>
                                    {transaction.reference_type ? <AppBadge variant="outline">{transaction.reference_type}</AppBadge> : null}
                                    {transaction.remarks ? <p className="text-xs text-slate-500">{transaction.remarks}</p> : null}
                                </div>
                            </td>
                            <td className="px-5 py-4 text-slate-700">{transaction.performed_by_name ?? 'System'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
