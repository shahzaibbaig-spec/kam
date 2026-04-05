import { CheckCircle2, ClipboardPlus, Pencil, Send, XCircle } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { ApprovalActionPanel, ApprovalTimelineCard, ProcurementProgressCard, RequisitionHeaderCard } from '@/Components/domain/procurement/ProcurementCards';
import { PurchaseOrderStatusBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { RequisitionLineItemsTable } from '@/Components/domain/procurement/ProcurementTables';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatCurrency, formatDateTime, formatShortDate } from '@/Lib/utils';
import type { RequisitionShowPageProps } from '@/types/procurement';

export default function RequisitionShowPage() {
    const { props } = useReactPage<RequisitionShowPageProps>();
    const { requisition, permissions, currentStageLabel } = props;
    const submitForm = useInertiaForm({ comments: '' });
    const approveForm = useInertiaForm({ action: 'approve', comments: '', reason: '' });
    const rejectForm = useInertiaForm({ action: 'reject', comments: '', reason: '' });
    const cancelForm = useInertiaForm({ reason: '' });

    const orderedTotal = requisition.items.reduce((sum, item) => sum + Number(item.ordered_quantity ?? 0), 0);
    const receivedTotal = requisition.items.reduce((sum, item) => sum + Number(item.received_quantity ?? 0), 0);

    const actions = (
        <>
            {permissions.edit ? (
                <AppButton asChild variant="outline">
                    <AppLink href={route('procurement.requisitions.edit', requisition.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit Requisition
                    </AppLink>
                </AppButton>
            ) : null}
            {permissions.createPo ? (
                <AppButton asChild>
                    <AppLink href={route('procurement.purchase-orders.create', { requisition: requisition.id })}>
                        <ClipboardPlus className="h-4 w-4" />
                        Convert to Purchase Order
                    </AppLink>
                </AppButton>
            ) : null}
        </>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Requisitions', href: route('procurement.requisitions.index') },
                { label: requisition.requisition_number },
            ]}
        >
            <div className="space-y-6">
                <RequisitionHeaderCard requisition={requisition} currentStageLabel={currentStageLabel} actions={actions} />

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <RequisitionLineItemsTable items={requisition.items} />

                    <div className="space-y-6">
                        <ProcurementProgressCard
                            title="Procurement Progress"
                            description="Ordered and received quantities across this requisition."
                            ordered={orderedTotal}
                            received={receivedTotal}
                        />

                        <ApprovalActionPanel
                            title="Requisition Overview"
                            description="High-level requisition context, approval stage, and timing."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Request Date</p>
                                    <p className="mt-2 font-semibold text-slate-950">{formatShortDate(requisition.request_date)}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Approval Stage</p>
                                    <p className="mt-2 font-semibold text-slate-950">{currentStageLabel ?? 'No pending stage'}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Estimated Total</p>
                                    <p className="mt-2 font-semibold text-slate-950">{formatCurrency(requisition.total_estimated_amount)}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Final Approved</p>
                                    <p className="mt-2 font-semibold text-slate-950">{formatDateTime(requisition.final_approved_at)}</p>
                                </div>
                            </div>
                            {requisition.remarks ? <p className="mt-4 text-sm leading-6 text-slate-600">{requisition.remarks}</p> : null}
                        </ApprovalActionPanel>

                        {permissions.submit ? (
                            <ApprovalActionPanel
                                title="Submit for Approval"
                                description="Send the draft requisition into the configured approval workflow."
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        submitForm.post(route('procurement.requisitions.submit', requisition.id));
                                    }}
                                >
                                    <AppTextarea
                                        rows={3}
                                        value={submitForm.data.comments}
                                        onChange={(event) => submitForm.setData('comments', event.target.value)}
                                        placeholder="Optional submission comment"
                                    />
                                    {submitForm.errors.comments ? <p className="text-sm text-rose-600">{submitForm.errors.comments}</p> : null}
                                    <AppButton type="submit" loading={submitForm.processing}>
                                        <Send className="h-4 w-4" />
                                        Submit Requisition
                                    </AppButton>
                                </form>
                            </ApprovalActionPanel>
                        ) : null}

                        {permissions.approve ? (
                            <ApprovalActionPanel
                                title="Approve Requisition"
                                description="Approve this requisition and move it to the next procurement stage."
                                tone="success"
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        approveForm.post(route('procurement.requisitions.approval.store', requisition.id));
                                    }}
                                >
                                    <AppTextarea
                                        rows={3}
                                        value={approveForm.data.comments}
                                        onChange={(event) => approveForm.setData('comments', event.target.value)}
                                        placeholder="Approval comment"
                                    />
                                    {approveForm.errors.comments ? <p className="text-sm text-rose-600">{approveForm.errors.comments}</p> : null}
                                    <AppButton type="submit" loading={approveForm.processing}>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Approve
                                    </AppButton>
                                </form>
                            </ApprovalActionPanel>
                        ) : null}

                        {permissions.reject ? (
                            <ApprovalActionPanel
                                title="Reject Requisition"
                                description="Rejection requires a clear reason so the requester understands what to correct."
                                tone="danger"
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        rejectForm.post(route('procurement.requisitions.approval.store', requisition.id));
                                    }}
                                >
                                    <AppInput type="hidden" value={rejectForm.data.action} readOnly />
                                    <AppTextarea
                                        rows={3}
                                        value={rejectForm.data.reason}
                                        onChange={(event) => rejectForm.setData('reason', event.target.value)}
                                        placeholder="Rejection reason"
                                    />
                                    {rejectForm.errors.reason ? <p className="text-sm text-rose-600">{rejectForm.errors.reason}</p> : null}
                                    <AppButton type="submit" variant="destructive" loading={rejectForm.processing}>
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </AppButton>
                                </form>
                            </ApprovalActionPanel>
                        ) : null}

                        {permissions.cancel ? (
                            <ApprovalActionPanel
                                title="Cancel Requisition"
                                description="Use cancellation when the procurement need is no longer valid."
                                tone="warning"
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        cancelForm.post(route('procurement.requisitions.cancel', requisition.id));
                                    }}
                                >
                                    <AppTextarea
                                        rows={3}
                                        value={cancelForm.data.reason}
                                        onChange={(event) => cancelForm.setData('reason', event.target.value)}
                                        placeholder="Cancellation reason"
                                    />
                                    {cancelForm.errors.reason ? <p className="text-sm text-rose-600">{cancelForm.errors.reason}</p> : null}
                                    <AppButton type="submit" variant="outline" loading={cancelForm.processing}>
                                        Cancel Requisition
                                    </AppButton>
                                </form>
                            </ApprovalActionPanel>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <ApprovalTimelineCard entries={requisition.approval_history} />

                    <AppTableShell title="Related Purchase Orders" description="Purchase orders created from this requisition remain linked here.">
                        {requisition.purchase_orders.length === 0 ? (
                            <div className="p-6">
                                <AppEmptyState
                                    title="No purchase orders yet"
                                    description="Once this requisition is approved and converted, linked purchase orders will appear here."
                                />
                            </div>
                        ) : (
                            <div className="space-y-3 p-6">
                                {requisition.purchase_orders.map((purchaseOrder) => (
                                    <AppLink
                                        key={purchaseOrder.id}
                                        href={route('procurement.purchase-orders.show', purchaseOrder.id)}
                                        className="block rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{purchaseOrder.po_number}</p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {purchaseOrder.supplier_name ?? 'No supplier'} • {formatShortDate(purchaseOrder.po_date)}
                                                </p>
                                            </div>
                                            <div className="space-y-2 text-right">
                                                <PurchaseOrderStatusBadge value={purchaseOrder.status} />
                                                <p className="text-sm text-slate-600">{formatCurrency(purchaseOrder.total_amount)}</p>
                                            </div>
                                        </div>
                                    </AppLink>
                                ))}
                            </div>
                        )}
                    </AppTableShell>
                </div>
            </div>
        </AppLayout>
    );
}
