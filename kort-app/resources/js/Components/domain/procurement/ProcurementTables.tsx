import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { DiscrepancyBadge, PurchaseOrderStatusBadge, RequisitionStatusBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { formatCurrency, formatShortDate } from '@/Lib/utils';
import type { GoodsReceiptLineItemModel, PurchaseOrderLineItemModel, RequisitionLineItemModel } from '@/types/procurement';

export interface RequisitionLineItemsTableProps {
    items: RequisitionLineItemModel[];
}

export function RequisitionLineItemsTable({ items }: RequisitionLineItemsTableProps) {
    if (items.length === 0) {
        return (
            <AppEmptyState
                title="No requisition lines added"
                description="Line items will appear here once the requisition captures requested assets or inventory."
            />
        );
    }

    return (
        <AppTableShell
            title="Line Items"
            description="Requested quantities, supplier preferences, and downstream order progress stay visible here."
        >
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                        <tr>
                            <th className="px-6 py-3.5">Item</th>
                            <th className="px-6 py-3.5">Quantity</th>
                            <th className="px-6 py-3.5">Estimate</th>
                            <th className="px-6 py-3.5">Supplier</th>
                            <th className="px-6 py-3.5">Progress</th>
                            <th className="px-6 py-3.5">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map((item, index) => (
                            <tr key={item.id ?? index} className="transition hover:bg-slate-50/80">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-900">{item.item_description ?? 'Untitled line'}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {item.item_type} • {item.inventory_item_code ?? item.asset_category_name ?? 'Custom line'}
                                    </p>
                                    {item.needed_by_date ? <p className="mt-1 text-xs text-slate-500">Needed by {formatShortDate(item.needed_by_date)}</p> : null}
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    {item.quantity} {item.unit_of_measure ?? ''}
                                </td>
                                <td className="px-6 py-4 text-slate-700">{formatCurrency(item.estimated_total)}</td>
                                <td className="px-6 py-4 text-slate-700">{item.preferred_supplier_name ?? 'Any approved supplier'}</td>
                                <td className="px-6 py-4 text-xs text-slate-600">
                                    <p>Ordered: {item.ordered_quantity}</p>
                                    <p>Received: {item.received_quantity}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <RequisitionStatusBadge value={item.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppTableShell>
    );
}

export interface PurchaseOrderLineItemsTableProps {
    items: PurchaseOrderLineItemModel[];
}

export function PurchaseOrderLineItemsTable({ items }: PurchaseOrderLineItemsTableProps) {
    if (items.length === 0) {
        return (
            <AppEmptyState
                title="No purchase order lines"
                description="Ordered items will appear here once this PO captures requisition or standalone line items."
            />
        );
    }

    return (
        <AppTableShell
            title="PO Line Items"
            description="Ordered, received, and remaining quantities remain visible to stores and procurement teams."
        >
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                        <tr>
                            <th className="px-6 py-3.5">Item</th>
                            <th className="px-6 py-3.5">Ordered</th>
                            <th className="px-6 py-3.5">Received</th>
                            <th className="px-6 py-3.5">Price</th>
                            <th className="px-6 py-3.5">Remaining</th>
                            <th className="px-6 py-3.5">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map((item, index) => (
                            <tr key={item.id ?? index} className="transition hover:bg-slate-50/80">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-900">{item.item_description ?? 'Untitled line'}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {item.item_type} • {item.inventory_item_code ?? item.asset_category_name ?? item.requisition_item_description ?? 'Custom line'}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    {item.quantity_ordered} {item.unit_of_measure ?? ''}
                                </td>
                                <td className="px-6 py-4 text-slate-700">{item.quantity_received}</td>
                                <td className="px-6 py-4 text-slate-700">{formatCurrency(item.line_total)}</td>
                                <td className="px-6 py-4 text-slate-700">{item.remaining_quantity}</td>
                                <td className="px-6 py-4">
                                    <PurchaseOrderStatusBadge value={item.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppTableShell>
    );
}

export interface GoodsReceiptItemsTableProps {
    items: GoodsReceiptLineItemModel[];
}

export function GoodsReceiptItemsTable({ items }: GoodsReceiptItemsTableProps) {
    if (items.length === 0) {
        return (
            <AppEmptyState
                title="No receipt lines"
                description="Processed receipt lines will appear here once goods are accepted or rejected."
            />
        );
    }

    return (
        <AppTableShell
            title="Receipt Line Processing"
            description="Accepted, rejected, and flagged results remain visible for auditability and downstream stock intake."
        >
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                        <tr>
                            <th className="px-6 py-3.5">Item</th>
                            <th className="px-6 py-3.5">Received</th>
                            <th className="px-6 py-3.5">Accepted</th>
                            <th className="px-6 py-3.5">Rejected</th>
                            <th className="px-6 py-3.5">Storage / Batch</th>
                            <th className="px-6 py-3.5">Flags</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map((item, index) => (
                            <tr key={item.id ?? index} className="transition hover:bg-slate-50/80">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-900">{item.item_description ?? 'Untitled line'}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {item.item_type} • {item.inventory_item_name ?? item.asset_category_name ?? 'PO line'}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-slate-700">{item.quantity_received}</td>
                                <td className="px-6 py-4 text-slate-700">{item.quantity_accepted}</td>
                                <td className="px-6 py-4 text-slate-700">
                                    {item.quantity_rejected}
                                    {item.rejection_reason ? <p className="mt-1 text-xs text-rose-600">{item.rejection_reason}</p> : null}
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    <p>{item.storage_location_name ?? 'No storage location'}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {item.batch_number ?? item.serial_number ?? item.room_or_area ?? 'No batch or serial'}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <DiscrepancyBadge flagged={item.has_discrepancy} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppTableShell>
    );
}
