import { ClipboardPlus, FilePlus2, Pencil } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { SupplierCommercialCard, SupplierHeaderCard, SupplierInfoCard } from '@/Components/domain/procurement/ProcurementCards';
import { GoodsReceiptStatusBadge, PurchaseOrderStatusBadge, RequisitionStatusBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatCurrency, formatShortDate } from '@/Lib/utils';
import type { SupplierShowPageProps } from '@/types/procurement';

export default function SupplierShowPage() {
    const { props } = useReactPage<SupplierShowPageProps>();
    const { supplier, permissions } = props;

    const actions = (
        <>
            {permissions.edit ? (
                <AppButton asChild variant="outline">
                    <AppLink href={route('procurement.suppliers.edit', supplier.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit Supplier
                    </AppLink>
                </AppButton>
            ) : null}
            {permissions.createRequisition ? (
                <AppButton asChild variant="outline">
                    <AppLink href={route('procurement.requisitions.create')}>
                        <ClipboardPlus className="h-4 w-4" />
                        Create Requisition
                    </AppLink>
                </AppButton>
            ) : null}
            {permissions.createPo ? (
                <AppButton asChild>
                    <AppLink href={route('procurement.purchase-orders.create')}>
                        <FilePlus2 className="h-4 w-4" />
                        Create Purchase Order
                    </AppLink>
                </AppButton>
            ) : null}
        </>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Suppliers', href: route('procurement.suppliers.index') },
                { label: supplier.supplier_name },
            ]}
        >
            <div className="space-y-6">
                <SupplierHeaderCard supplier={supplier} actions={actions} />

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <SupplierInfoCard supplier={supplier} />
                    <SupplierCommercialCard supplier={supplier} />
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <AppTableShell title="Recent Requisitions" description="Requisition demand that recently referenced this supplier as preferred.">
                        {(supplier.recent_requisitions?.length ?? 0) === 0 ? (
                            <div className="p-6">
                                <AppEmptyState
                                    title="No linked requisitions yet"
                                    description="Preferred-supplier requisition activity will appear here once departments reference this supplier."
                                />
                            </div>
                        ) : (
                            <div className="space-y-3 p-6">
                                {supplier.recent_requisitions?.map((requisition) => (
                                    <AppLink
                                        key={requisition.id}
                                        href={route('procurement.requisitions.show', requisition.id)}
                                        className="block rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{requisition.requisition_number}</p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {requisition.department_name ?? 'No department'} • {formatShortDate(requisition.request_date)}
                                                </p>
                                            </div>
                                            <RequisitionStatusBadge value={requisition.status} />
                                        </div>
                                    </AppLink>
                                ))}
                            </div>
                        )}
                    </AppTableShell>

                    <AppTableShell title="Recent Purchase Orders" description="Latest purchase orders associated with this supplier.">
                        {(supplier.recent_purchase_orders?.length ?? 0) === 0 ? (
                            <div className="p-6">
                                <AppEmptyState
                                    title="No purchase orders yet"
                                    description="Purchase orders for this supplier will appear here once procurement issues them."
                                />
                            </div>
                        ) : (
                            <div className="space-y-3 p-6">
                                {supplier.recent_purchase_orders?.map((purchaseOrder) => (
                                    <AppLink
                                        key={purchaseOrder.id}
                                        href={route('procurement.purchase-orders.show', purchaseOrder.id)}
                                        className="block rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{purchaseOrder.po_number}</p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {formatShortDate(purchaseOrder.po_date)} • {formatCurrency(purchaseOrder.total_amount)}
                                                </p>
                                            </div>
                                            <PurchaseOrderStatusBadge value={purchaseOrder.status} />
                                        </div>
                                    </AppLink>
                                ))}
                            </div>
                        )}
                    </AppTableShell>

                    <AppTableShell title="Recent Goods Receipts" description="Latest receiving activity tied to this supplier.">
                        {(supplier.recent_goods_receipts?.length ?? 0) === 0 ? (
                            <div className="p-6">
                                <AppEmptyState
                                    title="No goods receipts yet"
                                    description="Processed receipts for this supplier will appear here once deliveries are received."
                                />
                            </div>
                        ) : (
                            <div className="space-y-3 p-6">
                                {supplier.recent_goods_receipts?.map((goodsReceipt) => (
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
            </div>
        </AppLayout>
    );
}
