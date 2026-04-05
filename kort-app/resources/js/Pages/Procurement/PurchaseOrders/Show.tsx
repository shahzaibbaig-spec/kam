import { FileCheck2, Pencil, Receipt, Truck, XCircle } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { ApprovalActionPanel, PurchaseOrderFinancialCard, PurchaseOrderHeaderCard, ReceiptProgressCard } from '@/Components/domain/procurement/ProcurementCards';
import { GoodsReceiptStatusBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { PurchaseOrderLineItemsTable } from '@/Components/domain/procurement/ProcurementTables';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatCurrency, formatDateTime, formatShortDate } from '@/Lib/utils';
import type { PurchaseOrderShowPageProps } from '@/types/procurement';

export default function PurchaseOrderShowPage() {
    const { props } = useReactPage<PurchaseOrderShowPageProps>();
    const { purchaseOrder, permissions } = props;
    const issueForm = useInertiaForm({ action: 'issue', remarks: '', reason: '' });
    const cancelForm = useInertiaForm({ action: 'cancel', remarks: '', reason: '' });
    const closeForm = useInertiaForm({ action: 'close', remarks: '', reason: '' });

    const orderedTotal = purchaseOrder.items.reduce((sum, item) => sum + Number(item.quantity_ordered ?? 0), 0);
    const receivedTotal = purchaseOrder.items.reduce((sum, item) => sum + Number(item.quantity_received ?? 0), 0);

    const actions = (
        <>
            {permissions.edit ? (
                <AppButton asChild variant="outline">
                    <AppLink href={route('procurement.purchase-orders.edit', purchaseOrder.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit PO
                    </AppLink>
                </AppButton>
            ) : null}
            {permissions.receive ? (
                <AppButton asChild>
                    <AppLink href={route('procurement.goods-receipts.create', { purchase_order: purchaseOrder.id })}>
                        <Receipt className="h-4 w-4" />
                        Create Goods Receipt
                    </AppLink>
                </AppButton>
            ) : null}
        </>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Purchase Orders', href: route('procurement.purchase-orders.index') },
                { label: purchaseOrder.po_number },
            ]}
        >
            <div className="space-y-6">
                <PurchaseOrderHeaderCard purchaseOrder={purchaseOrder} actions={actions} />

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <PurchaseOrderLineItemsTable items={purchaseOrder.items} />

                    <div className="space-y-6">
                        <PurchaseOrderFinancialCard purchaseOrder={purchaseOrder} />

                        <ReceiptProgressCard ordered={orderedTotal} received={receivedTotal} />

                        <ApprovalActionPanel
                            title="PO Overview"
                            description="Commercial and lifecycle details that matter before issuing, cancelling, or closing the order."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Supplier</p>
                                    <p className="mt-2 font-semibold text-slate-950">{purchaseOrder.supplier_name ?? 'No supplier'}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Linked Requisition</p>
                                    <p className="mt-2 font-semibold text-slate-950">{purchaseOrder.requisition_number ?? 'Standalone'}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Approved By</p>
                                    <p className="mt-2 font-semibold text-slate-950">{purchaseOrder.approved_by_name ?? 'Not approved'}</p>
                                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(purchaseOrder.approved_at)}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Issued By</p>
                                    <p className="mt-2 font-semibold text-slate-950">{purchaseOrder.issued_by_name ?? 'Not issued'}</p>
                                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(purchaseOrder.issued_at)}</p>
                                </div>
                            </div>
                        </ApprovalActionPanel>

                        {permissions.issue ? (
                            <ApprovalActionPanel
                                title="Issue Purchase Order"
                                description="Issue this draft order to lock the commercial details and allow downstream receiving."
                                tone="success"
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        issueForm.post(route('procurement.purchase-orders.issue', purchaseOrder.id));
                                    }}
                                >
                                    <AppTextarea
                                        rows={3}
                                        value={issueForm.data.remarks}
                                        onChange={(event) => issueForm.setData('remarks', event.target.value)}
                                        placeholder="Issue note"
                                    />
                                    {issueForm.errors.remarks ? <p className="text-sm text-rose-600">{issueForm.errors.remarks}</p> : null}
                                    <AppButton type="submit" loading={issueForm.processing}>
                                        <Truck className="h-4 w-4" />
                                        Issue PO
                                    </AppButton>
                                </form>
                            </ApprovalActionPanel>
                        ) : null}

                        {permissions.cancel ? (
                            <ApprovalActionPanel
                                title="Cancel Purchase Order"
                                description="Cancellation should only be used when supplier fulfillment is no longer expected."
                                tone="danger"
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        cancelForm.post(route('procurement.purchase-orders.cancel', purchaseOrder.id));
                                    }}
                                >
                                    <AppTextarea
                                        rows={3}
                                        value={cancelForm.data.reason}
                                        onChange={(event) => cancelForm.setData('reason', event.target.value)}
                                        placeholder="Cancellation reason"
                                    />
                                    {cancelForm.errors.reason ? <p className="text-sm text-rose-600">{cancelForm.errors.reason}</p> : null}
                                    <AppButton type="submit" variant="destructive" loading={cancelForm.processing}>
                                        <XCircle className="h-4 w-4" />
                                        Cancel PO
                                    </AppButton>
                                </form>
                            </ApprovalActionPanel>
                        ) : null}

                        {permissions.close ? (
                            <ApprovalActionPanel
                                title="Close Purchase Order"
                                description="Close the PO when all receiving has been verified and no more receipts are expected."
                                tone="warning"
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        closeForm.post(route('procurement.purchase-orders.close', purchaseOrder.id));
                                    }}
                                >
                                    <AppTextarea
                                        rows={3}
                                        value={closeForm.data.remarks}
                                        onChange={(event) => closeForm.setData('remarks', event.target.value)}
                                        placeholder="Closure note"
                                    />
                                    {closeForm.errors.remarks ? <p className="text-sm text-rose-600">{closeForm.errors.remarks}</p> : null}
                                    <AppButton type="submit" variant="outline" loading={closeForm.processing}>
                                        <FileCheck2 className="h-4 w-4" />
                                        Close PO
                                    </AppButton>
                                </form>
                            </ApprovalActionPanel>
                        ) : null}
                    </div>
                </div>

                <AppTableShell title="Related Goods Receipts" description="Receipts processed against this PO remain linked here for traceability.">
                    {purchaseOrder.goods_receipts.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No goods receipts yet"
                                description="Once deliveries arrive and are processed, related receipt records will appear here."
                            />
                        </div>
                    ) : (
                        <div className="space-y-3 p-6">
                            {purchaseOrder.goods_receipts.map((goodsReceipt) => (
                                <AppLink
                                    key={goodsReceipt.id}
                                    href={route('procurement.goods-receipts.show', goodsReceipt.id)}
                                    className="block rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-900">{goodsReceipt.grn_number}</p>
                                            <p className="mt-1 text-sm text-slate-600">{formatShortDate(goodsReceipt.receipt_date)}</p>
                                        </div>
                                        <GoodsReceiptStatusBadge value={goodsReceipt.status} />
                                    </div>
                                </AppLink>
                            ))}
                        </div>
                    )}
                </AppTableShell>
            </div>
        </AppLayout>
    );
}
