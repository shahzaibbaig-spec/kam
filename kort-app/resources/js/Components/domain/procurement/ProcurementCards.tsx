import { motion } from 'framer-motion';
import { ClipboardList, ShieldAlert } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import {
    AppCard,
    AppCardContent,
    AppCardDescription,
    AppCardHeader,
    AppCardTitle,
} from '@/Components/data-display/AppCard';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { GoodsReceiptStatusBadge, PurchaseOrderStatusBadge, RequisitionStatusBadge, SupplierActiveBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { ApprovalStatusBadge } from '@/Components/domain/shared/ApprovalStatusBadge';
import { PriorityBadge } from '@/Components/domain/shared/PriorityBadge';
import { cn, formatCurrency, formatDateTime, formatShortDate, formatTitleCase, joinDisplayParts } from '@/Lib/utils';
import type { GoodsReceiptDetailModel, PurchaseOrderDetailModel, RequisitionApprovalHistoryEntry, RequisitionDetailModel, SupplierDetailModel } from '@/types/procurement';

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

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
    );
}

export interface SupplierHeaderCardProps {
    supplier: SupplierDetailModel;
    actions?: ReactNode;
}

export function SupplierHeaderCard({ supplier, actions }: SupplierHeaderCardProps) {
    return (
        <AppCard className="overflow-hidden">
            <AppCardHeader className="gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <SupplierActiveBadge active={supplier.is_active} />
                        <AppBadge variant="outline">{formatTitleCase(supplier.supplier_type)}</AppBadge>
                    </div>
                    <div>
                        <AppCardTitle className="text-2xl">{supplier.supplier_name}</AppCardTitle>
                        <AppCardDescription className="mt-2">
                            {joinDisplayParts(
                                [supplier.supplier_code, supplier.contact_person, supplier.city],
                                ' • ',
                                'Supplier record',
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
                        { label: 'Purchase Orders', value: supplier.purchase_orders_count ?? 0 },
                        { label: 'Goods Receipts', value: supplier.goods_receipts_count ?? 0 },
                        { label: 'Preferred Lines', value: supplier.requisition_items_count ?? 0 },
                        { label: 'Lead Time', value: supplier.lead_time_days ? `${supplier.lead_time_days} days` : 'Not set' },
                    ]}
                />
            </AppCardContent>
        </AppCard>
    );
}

export interface SupplierInfoCardProps {
    supplier: SupplierDetailModel;
}

export function SupplierInfoCard({ supplier }: SupplierInfoCardProps) {
    return (
        <AppCard>
            <AppCardHeader>
                <AppCardTitle>Basic Information</AppCardTitle>
                <AppCardDescription>Primary supplier identity and contact details used across procurement workflows.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
                <MetricGrid
                    items={[
                        { label: 'Supplier Code', value: supplier.supplier_code ?? 'Auto-generated' },
                        { label: 'Contact Person', value: supplier.contact_person ?? 'Not recorded' },
                        { label: 'Primary Phone', value: supplier.phone ?? 'Not recorded' },
                        { label: 'Alternate Phone', value: supplier.alternate_phone ?? 'Not recorded' },
                        { label: 'Email', value: supplier.email ?? 'Not recorded' },
                        { label: 'Location', value: joinDisplayParts([supplier.city, supplier.country], ', ', 'Not recorded') },
                    ]}
                />
            </AppCardContent>
        </AppCard>
    );
}

export interface SupplierCommercialCardProps {
    supplier: SupplierDetailModel;
}

export function SupplierCommercialCard({ supplier }: SupplierCommercialCardProps) {
    return (
        <AppCard>
            <AppCardHeader>
                <AppCardTitle>Commercial Information</AppCardTitle>
                <AppCardDescription>Commercial terms, identifiers, and notes relevant to supplier due diligence.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="space-y-6">
                <MetricGrid
                    items={[
                        { label: 'Tax Number', value: supplier.tax_number ?? 'Not recorded' },
                        { label: 'Registration Number', value: supplier.registration_number ?? 'Not recorded' },
                        { label: 'Payment Terms', value: supplier.payment_terms ?? 'Not recorded' },
                        { label: 'Lead Time', value: supplier.lead_time_days ? `${supplier.lead_time_days} days` : 'Not recorded' },
                    ]}
                />

                {supplier.address || supplier.notes ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Address</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">{supplier.address ?? 'No address recorded'}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Notes</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">{supplier.notes ?? 'No supplier notes recorded'}</p>
                        </div>
                    </div>
                ) : null}
            </AppCardContent>
        </AppCard>
    );
}

export interface RequisitionHeaderCardProps {
    requisition: RequisitionDetailModel;
    currentStageLabel?: string | null;
    actions?: ReactNode;
}

export function RequisitionHeaderCard({ requisition, currentStageLabel, actions }: RequisitionHeaderCardProps) {
    return (
        <AppCard className="overflow-hidden">
            <AppCardHeader className="gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <RequisitionStatusBadge value={requisition.status} />
                        <PriorityBadge value={requisition.priority} />
                        <AppBadge variant="outline">{formatTitleCase(requisition.requisition_type ?? 'requisition')}</AppBadge>
                        {currentStageLabel ? <ApprovalStatusBadge value={currentStageLabel} /> : null}
                    </div>
                    <div>
                        <AppCardTitle className="text-2xl">{requisition.requisition_number}</AppCardTitle>
                        <AppCardDescription className="mt-2">
                            {joinDisplayParts(
                                [requisition.department_name, requisition.requested_by_name, formatShortDate(requisition.request_date)],
                                ' • ',
                                'Procurement requisition',
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
                        { label: 'Estimated Total', value: formatCurrency(requisition.total_estimated_amount) },
                        { label: 'Approval Level', value: requisition.current_approval_level ?? 'Not started' },
                        { label: 'Final Approved', value: formatDateTime(requisition.final_approved_at) },
                        { label: 'Rejected At', value: formatDateTime(requisition.rejected_at) },
                    ]}
                />
                {requisition.purpose ? (
                    <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Purpose</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{requisition.purpose}</p>
                    </div>
                ) : null}
                {requisition.rejection_reason ? (
                    <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                        <p className="font-semibold">Rejection reason</p>
                        <p className="mt-2 leading-6">{requisition.rejection_reason}</p>
                    </div>
                ) : null}
            </AppCardContent>
        </AppCard>
    );
}

export interface ApprovalTimelineCardProps {
    entries: RequisitionApprovalHistoryEntry[];
}

export function ApprovalTimelineCard({ entries }: ApprovalTimelineCardProps) {
    return (
        <AppCard className="h-full">
            <AppCardHeader>
                <AppCardTitle>Approval Timeline</AppCardTitle>
                <AppCardDescription>Approval stages, reviewer comments, and decision history remain visible here.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
                {entries.length === 0 ? (
                    <AppEmptyState
                        title="No approval actions yet"
                        description="This requisition has not progressed through any approval steps so far."
                        icon={ClipboardList}
                    />
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry, index) => (
                            <div key={entry.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
                                    {index !== entries.length - 1 ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
                                </div>
                                <div className="min-w-0 flex-1 rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Level {entry.approval_level ?? 'N/A'} • {entry.acted_by_name ?? 'System'}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">{formatDateTime(entry.acted_at)}</p>
                                        </div>
                                        <ApprovalStatusBadge value={entry.action} />
                                    </div>
                                    {entry.comments ? <p className="mt-3 text-sm leading-6 text-slate-700">{entry.comments}</p> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AppCardContent>
        </AppCard>
    );
}

export interface ApprovalActionPanelProps {
    title: string;
    description: string;
    tone?: 'default' | 'warning' | 'danger' | 'success';
    children: ReactNode;
}

export function ApprovalActionPanel({
    title,
    description,
    tone = 'default',
    children,
}: ApprovalActionPanelProps) {
    const toneClassMap = {
        default: 'border-slate-200 bg-white',
        warning: 'border-amber-200 bg-amber-50/50',
        danger: 'border-rose-200 bg-rose-50/50',
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

export interface ProcurementProgressCardProps {
    title: string;
    description: string;
    ordered: number;
    received: number;
}

export function ProcurementProgressCard({
    title,
    description,
    ordered,
    received,
}: ProcurementProgressCardProps) {
    const progress = ordered > 0 ? (received / ordered) * 100 : 0;

    return (
        <AppCard>
            <AppCardHeader>
                <AppCardTitle>{title}</AppCardTitle>
                <AppCardDescription>{description}</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-2xl font-semibold text-slate-950">{received}</p>
                        <p className="text-sm text-slate-500">Received against {ordered} ordered</p>
                    </div>
                    <AppBadge variant={progress >= 100 ? 'success' : progress > 0 ? 'warning' : 'neutral'}>
                        {Math.round(progress)}%
                    </AppBadge>
                </div>
                <ProgressBar value={progress} />
            </AppCardContent>
        </AppCard>
    );
}

export interface PurchaseOrderHeaderCardProps {
    purchaseOrder: PurchaseOrderDetailModel;
    actions?: ReactNode;
}

export function PurchaseOrderHeaderCard({ purchaseOrder, actions }: PurchaseOrderHeaderCardProps) {
    return (
        <AppCard className="overflow-hidden">
            <AppCardHeader className="gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <PurchaseOrderStatusBadge value={purchaseOrder.status} />
                        <AppBadge variant="outline">{purchaseOrder.currency ?? 'PKR'}</AppBadge>
                    </div>
                    <div>
                        <AppCardTitle className="text-2xl">{purchaseOrder.po_number}</AppCardTitle>
                        <AppCardDescription className="mt-2">
                            {joinDisplayParts(
                                [purchaseOrder.supplier_name, purchaseOrder.requisition_number, formatShortDate(purchaseOrder.po_date)],
                                ' • ',
                                'Purchase order',
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
                        { label: 'Expected Delivery', value: formatShortDate(purchaseOrder.expected_delivery_date) },
                        { label: 'Approved By', value: purchaseOrder.approved_by_name ?? 'Not approved' },
                        { label: 'Issued By', value: purchaseOrder.issued_by_name ?? 'Not issued' },
                        { label: 'Total', value: formatCurrency(purchaseOrder.total_amount, purchaseOrder.currency ?? 'PKR') },
                    ]}
                />
            </AppCardContent>
        </AppCard>
    );
}

export interface PurchaseOrderFinancialCardProps {
    purchaseOrder: PurchaseOrderDetailModel;
}

export function PurchaseOrderFinancialCard({ purchaseOrder }: PurchaseOrderFinancialCardProps) {
    return (
        <AppCard>
            <AppCardHeader>
                <AppCardTitle>Financial Summary</AppCardTitle>
                <AppCardDescription>Commercial totals and terms for this purchase order.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
                <MetricGrid
                    items={[
                        { label: 'Subtotal', value: formatCurrency(purchaseOrder.subtotal, purchaseOrder.currency ?? 'PKR') },
                        { label: 'Tax', value: formatCurrency(purchaseOrder.tax_amount, purchaseOrder.currency ?? 'PKR') },
                        { label: 'Discount', value: formatCurrency(purchaseOrder.discount_amount, purchaseOrder.currency ?? 'PKR') },
                        { label: 'Payment Terms', value: purchaseOrder.payment_terms ?? 'Not specified' },
                    ]}
                />
                {purchaseOrder.remarks ? (
                    <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Remarks</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{purchaseOrder.remarks}</p>
                    </div>
                ) : null}
            </AppCardContent>
        </AppCard>
    );
}

export interface ReceiptProgressCardProps {
    ordered: number;
    received: number;
    accepted?: number;
    rejected?: number;
}

export function ReceiptProgressCard({ ordered, received, accepted = 0, rejected = 0 }: ReceiptProgressCardProps) {
    const progress = ordered > 0 ? (received / ordered) * 100 : 0;

    return (
        <AppCard>
            <AppCardHeader>
                <AppCardTitle>Receipt Progress</AppCardTitle>
                <AppCardDescription>Ordered, received, accepted, and rejected quantities stay visible at a glance.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-sm text-slate-500">Ordered vs received</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                            {received} / {ordered}
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-sm text-slate-500">Accepted vs rejected</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                            {accepted} / {rejected}
                        </p>
                    </div>
                </div>
                <ProgressBar value={progress} />
                <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span>{Math.round(progress)}% received</span>
                    <span>{ordered - received > 0 ? `${ordered - received} pending` : 'All received'}</span>
                </div>
            </AppCardContent>
        </AppCard>
    );
}

export interface GoodsReceiptHeaderCardProps {
    goodsReceipt: GoodsReceiptDetailModel;
    actions?: ReactNode;
}

export function GoodsReceiptHeaderCard({ goodsReceipt, actions }: GoodsReceiptHeaderCardProps) {
    const hasDiscrepancy = goodsReceipt.items?.some((item) => item.has_discrepancy) ?? false;

    return (
        <AppCard className="overflow-hidden">
            <AppCardHeader className="gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <GoodsReceiptStatusBadge value={goodsReceipt.status} />
                        {hasDiscrepancy ? <AppBadge variant="danger">Discrepancy detected</AppBadge> : null}
                    </div>
                    <div>
                        <AppCardTitle className="text-2xl">{goodsReceipt.grn_number}</AppCardTitle>
                        <AppCardDescription className="mt-2">
                            {joinDisplayParts(
                                [goodsReceipt.supplier_name, goodsReceipt.purchase_order_number, formatShortDate(goodsReceipt.receipt_date)],
                                ' • ',
                                'Goods receipt',
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
                        { label: 'Invoice Reference', value: goodsReceipt.invoice_reference ?? 'Not recorded' },
                        { label: 'Delivery Note', value: goodsReceipt.delivery_note_number ?? 'Not recorded' },
                        { label: 'Received By', value: goodsReceipt.received_by_name ?? 'Not recorded' },
                        { label: 'Inspected By', value: goodsReceipt.inspected_by_name ?? 'Not recorded' },
                    ]}
                />
            </AppCardContent>
        </AppCard>
    );
}

export interface DiscrepancyBannerProps {
    title?: string;
    description: string;
}

export function DiscrepancyBanner({
    title = 'Discrepancy detected',
    description,
}: DiscrepancyBannerProps) {
    return (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            <div className="flex items-start gap-4 rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-6">{description}</p>
                </div>
            </div>
        </motion.div>
    );
}

export interface OrderedVsReceivedCardProps {
    title: string;
    ordered: number;
    received: number;
    accepted?: number;
    rejected?: number;
}

export function OrderedVsReceivedCard({
    title,
    ordered,
    received,
    accepted = 0,
    rejected = 0,
}: OrderedVsReceivedCardProps) {
    const progress = ordered > 0 ? (received / ordered) * 100 : 0;

    return (
        <AppCard>
            <AppCardHeader>
                <AppCardTitle>{title}</AppCardTitle>
                <AppCardDescription>Ordered quantity compared against received and processed results.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ordered</p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">{ordered}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Received</p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">{received}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Accepted</p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">{accepted}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Rejected</p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">{rejected}</p>
                    </div>
                </div>
                <ProgressBar value={progress} />
            </AppCardContent>
        </AppCard>
    );
}
