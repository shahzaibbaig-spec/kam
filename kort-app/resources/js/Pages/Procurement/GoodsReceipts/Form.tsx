import { AlertTriangle, ArrowLeft, FileCheck2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { DiscrepancyBanner, OrderedVsReceivedCard } from '@/Components/domain/procurement/ProcurementCards';
import { PurchaseOrderStatusBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { ProcurementFormField, ProcurementFormSection } from '@/Components/domain/procurement/ProcurementForm';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { asNumber, asStringValue, getFieldError, toAppSelectOptions, updateArrayItem } from '@/Lib/procurement';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatCurrency, formatShortDate } from '@/Lib/utils';
import type { GoodsReceiptFormData, GoodsReceiptFormLineData, GoodsReceiptFormPageProps, PurchaseOrderDetailModel } from '@/types/procurement';

function mapPurchaseOrderLine(item: PurchaseOrderDetailModel['items'][number]): GoodsReceiptFormLineData {
    const quantity = asStringValue(item.remaining_quantity ?? item.quantity_ordered);

    return {
        purchase_order_item_id: asStringValue(item.id),
        item_type: item.item_type ?? 'inventory',
        asset_category_id: asStringValue(item.asset_category_id),
        inventory_item_id: asStringValue(item.inventory_item_id),
        item_description: item.item_description ?? '',
        quantity_received: quantity,
        quantity_accepted: quantity,
        quantity_rejected: '0',
        rejection_reason: '',
        batch_number: '',
        manufacture_date: '',
        expiry_date: '',
        serial_number: '',
        unit_cost: asStringValue(item.unit_price),
        storage_location_id: '',
        room_or_area: '',
        remarks: '',
    };
}

export default function GoodsReceiptFormPage() {
    const { props } = useReactPage<GoodsReceiptFormPageProps>();
    const goodsReceipt = props.goodsReceipt;
    const form = useInertiaForm<GoodsReceiptFormData>({
        purchase_order_id: asStringValue(goodsReceipt?.purchase_order_id ?? props.selectedPurchaseOrder?.id),
        supplier_id: asStringValue(goodsReceipt?.supplier_id ?? props.selectedPurchaseOrder?.supplier_id),
        receipt_date: goodsReceipt?.receipt_date ?? new Date().toISOString().slice(0, 10),
        invoice_reference: goodsReceipt?.invoice_reference ?? '',
        delivery_note_number: goodsReceipt?.delivery_note_number ?? '',
        received_by: '',
        inspected_by: '',
        remarks: goodsReceipt?.remarks ?? '',
        items:
            props.selectedPurchaseOrder?.items
                ?.filter((item) => Number(item.remaining_quantity ?? item.quantity_ordered) > 0)
                .map(mapPurchaseOrderLine) ?? [],
    });

    const selectedPurchaseOrder =
        props.options.purchaseOrders.find((purchaseOrder) => String(purchaseOrder.id) === String(form.data.purchase_order_id)) ??
        props.selectedPurchaseOrder;
    const selectedPurchaseOrderLineCount =
        selectedPurchaseOrder?.items?.filter((item) => Number(item.remaining_quantity ?? item.quantity_ordered) > 0).length ?? 0;

    const loadPurchaseOrderLines = (purchaseOrderId: string) => {
        const purchaseOrder = props.options.purchaseOrders.find((item) => String(item.id) === String(purchaseOrderId));

        if (!purchaseOrder) {
            form.setValues({ items: [], supplier_id: '' });
            return;
        }

        form.setValues({
            supplier_id: asStringValue(purchaseOrder.supplier_id),
            items:
                purchaseOrder.items
                    ?.filter((item) => Number(item.remaining_quantity ?? item.quantity_ordered) > 0)
                    .map(mapPurchaseOrderLine) ?? [],
        });
    };

    const updateLine = (index: number, field: keyof GoodsReceiptFormLineData, value: string) => {
        form.setData(
            'items',
            updateArrayItem(form.data.items, index, (item) => {
                const next = { ...item, [field]: value };

                if (field === 'quantity_received' || field === 'quantity_accepted') {
                    const received = asNumber(field === 'quantity_received' ? value : next.quantity_received);
                    const accepted = Math.min(received, asNumber(field === 'quantity_accepted' ? value : next.quantity_accepted));
                    next.quantity_accepted = accepted > 0 ? accepted.toString() : '0';
                    next.quantity_rejected = Math.max(received - accepted, 0).toString();
                }

                return next;
            }),
        );
    };

    const totals = form.data.items.reduce(
        (summary, item) => ({
            ordered: summary.ordered + asNumber(item.quantity_received),
            received: summary.received + asNumber(item.quantity_received),
            accepted: summary.accepted + asNumber(item.quantity_accepted),
            rejected: summary.rejected + asNumber(item.quantity_rejected),
        }),
        { ordered: 0, received: 0, accepted: 0, rejected: 0 },
    );

    const hasGlobalDiscrepancy = form.data.items.some(
        (item) => Math.abs(asNumber(item.quantity_received) - (asNumber(item.quantity_accepted) + asNumber(item.quantity_rejected))) > 0.001,
    );

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Goods Receipts', href: route('procurement.goods-receipts.index') },
                { label: 'Create Goods Receipt' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Receiving Workflow</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Create goods receipt</h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Process delivered purchase order lines with clear accepted, rejected, and discrepancy-aware outcomes.
                            </p>
                        </div>
                        <AppButton asChild variant="outline">
                            <AppLink href={route('procurement.goods-receipts.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </AppLink>
                        </AppButton>
                    </div>
                </div>

                {selectedPurchaseOrder ? (
                    <div className="app-surface overflow-hidden p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Selected Purchase Order</p>
                                <h2 className="text-xl font-semibold text-slate-950">{selectedPurchaseOrder.po_number}</h2>
                                <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                    {selectedPurchaseOrder.supplier_name ?? 'No supplier'} - delivery target {formatShortDate(selectedPurchaseOrder.expected_delivery_date)}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <PurchaseOrderStatusBadge value={selectedPurchaseOrder.status} />
                                <AppButton asChild variant="outline" size="sm">
                                    <AppLink href={route('procurement.purchase-orders.show', selectedPurchaseOrder.id)}>View Purchase Order</AppLink>
                                </AppButton>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Linked Requisition</p>
                                <p className="mt-2 text-sm font-semibold text-slate-950">{selectedPurchaseOrder.requisition_number ?? 'Standalone PO'}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Open Lines</p>
                                <p className="mt-2 text-sm font-semibold text-slate-950">{selectedPurchaseOrderLineCount}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">PO Date</p>
                                <p className="mt-2 text-sm font-semibold text-slate-950">{formatShortDate(selectedPurchaseOrder.po_date)}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Total Amount</p>
                                <p className="mt-2 text-sm font-semibold text-slate-950">
                                    {formatCurrency(selectedPurchaseOrder.total_amount, selectedPurchaseOrder.currency ?? 'PKR')}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {hasGlobalDiscrepancy ? (
                    <DiscrepancyBanner description="One or more lines do not balance: accepted plus rejected must equal received before Laravel will process the receipt." />
                ) : null}

                <form
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(route('procurement.goods-receipts.store'));
                    }}
                >
                    <ProcurementFormSection title="Receipt Overview" description="Link the purchase order and capture the delivery context for this receipt.">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <ProcurementFormField label="Linked Purchase Order" required error={form.errors.purchase_order_id}>
                                <AppSelect
                                    value={form.data.purchase_order_id}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        form.setData('purchase_order_id', value);
                                        loadPurchaseOrderLines(value);
                                    }}
                                    options={toAppSelectOptions(props.options.purchaseOrders, { label: 'Select purchase order', value: '' })}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Supplier" error={form.errors.supplier_id}>
                                <AppSelect
                                    value={form.data.supplier_id}
                                    onChange={(event) => form.setData('supplier_id', event.target.value)}
                                    options={toAppSelectOptions(props.options.suppliers, { label: 'Select supplier', value: '' })}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Receipt Date" required error={form.errors.receipt_date}>
                                <AppInput type="date" value={form.data.receipt_date} onChange={(event) => form.setData('receipt_date', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Invoice Reference" error={form.errors.invoice_reference}>
                                <AppInput value={form.data.invoice_reference} onChange={(event) => form.setData('invoice_reference', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Delivery Note Number" error={form.errors.delivery_note_number}>
                                <AppInput value={form.data.delivery_note_number} onChange={(event) => form.setData('delivery_note_number', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Received By" error={form.errors.received_by}>
                                <AppSelect
                                    value={form.data.received_by}
                                    onChange={(event) => form.setData('received_by', event.target.value)}
                                    options={toAppSelectOptions(props.options.users, { label: 'Select user', value: '' })}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Inspected By" error={form.errors.inspected_by}>
                                <AppSelect
                                    value={form.data.inspected_by}
                                    onChange={(event) => form.setData('inspected_by', event.target.value)}
                                    options={toAppSelectOptions(props.options.users, { label: 'Select user', value: '' })}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Remarks" error={form.errors.remarks} className="md:col-span-2 xl:col-span-3">
                                <AppTextarea rows={3} value={form.data.remarks} onChange={(event) => form.setData('remarks', event.target.value)} />
                            </ProcurementFormField>
                        </div>
                    </ProcurementFormSection>

                    <OrderedVsReceivedCard
                        title="Receipt Totals"
                        ordered={totals.ordered}
                        received={totals.received}
                        accepted={totals.accepted}
                        rejected={totals.rejected}
                    />

                    <ProcurementFormSection title="Line Processing" description="Accepted plus rejected must equal received. Inventory lines need batch and storage details.">
                        <div className="space-y-5">
                            {form.data.items.length === 0 ? (
                                <AppAlert
                                    variant="warning"
                                    title="No receipt lines available"
                                    description="Select a purchase order with remaining quantities to load line items for processing."
                                />
                            ) : null}

                            {form.data.items.map((line, index) => {
                                const received = asNumber(line.quantity_received);
                                const accepted = asNumber(line.quantity_accepted);
                                const rejected = asNumber(line.quantity_rejected);
                                const hasLineDiscrepancy = Math.abs(received - (accepted + rejected)) > 0.001;

                                return (
                                    <div key={index} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/60 p-5">
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{line.item_description || `PO Line ${index + 1}`}</p>
                                                <p className="mt-1 text-xs text-slate-500">{line.item_type} receiving workflow</p>
                                            </div>
                                            {hasLineDiscrepancy ? (
                                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    Balance mismatch
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                            <ProcurementFormField label="Quantity Received" required error={getFieldError(form.errors, `items.${index}.quantity_received`)}>
                                                <AppInput type="number" min={0.01} step="0.01" value={line.quantity_received} onChange={(event) => updateLine(index, 'quantity_received', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Quantity Accepted" required error={getFieldError(form.errors, `items.${index}.quantity_accepted`)}>
                                                <AppInput type="number" min={0} step="0.01" value={line.quantity_accepted} onChange={(event) => updateLine(index, 'quantity_accepted', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Quantity Rejected" error={getFieldError(form.errors, `items.${index}.quantity_rejected`)}>
                                                <AppInput type="number" min={0} step="0.01" value={line.quantity_rejected} onChange={(event) => updateLine(index, 'quantity_rejected', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Unit Cost" error={getFieldError(form.errors, `items.${index}.unit_cost`)}>
                                                <AppInput type="number" min={0} step="0.01" value={line.unit_cost} onChange={(event) => updateLine(index, 'unit_cost', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Rejection Reason" error={getFieldError(form.errors, `items.${index}.rejection_reason`)} className="xl:col-span-2">
                                                <AppInput value={line.rejection_reason} onChange={(event) => updateLine(index, 'rejection_reason', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Storage Location" error={getFieldError(form.errors, `items.${index}.storage_location_id`)}>
                                                <AppSelect
                                                    value={line.storage_location_id}
                                                    onChange={(event) => updateLine(index, 'storage_location_id', event.target.value)}
                                                    options={toAppSelectOptions(props.options.locations, { label: 'Select location', value: '' })}
                                                />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Room / Area" error={getFieldError(form.errors, `items.${index}.room_or_area`)}>
                                                <AppInput value={line.room_or_area} onChange={(event) => updateLine(index, 'room_or_area', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Batch Number" error={getFieldError(form.errors, `items.${index}.batch_number`)}>
                                                <AppInput value={line.batch_number} onChange={(event) => updateLine(index, 'batch_number', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Manufacture Date" error={getFieldError(form.errors, `items.${index}.manufacture_date`)}>
                                                <AppInput type="date" value={line.manufacture_date} onChange={(event) => updateLine(index, 'manufacture_date', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Expiry Date" error={getFieldError(form.errors, `items.${index}.expiry_date`)}>
                                                <AppInput type="date" value={line.expiry_date} onChange={(event) => updateLine(index, 'expiry_date', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Serial Number" error={getFieldError(form.errors, `items.${index}.serial_number`)}>
                                                <AppInput value={line.serial_number} onChange={(event) => updateLine(index, 'serial_number', event.target.value)} />
                                            </ProcurementFormField>
                                            <ProcurementFormField label="Line Remarks" error={getFieldError(form.errors, `items.${index}.remarks`)} className="xl:col-span-4">
                                                <AppInput value={line.remarks} onChange={(event) => updateLine(index, 'remarks', event.target.value)} />
                                            </ProcurementFormField>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ProcurementFormSection>

                    <div className="flex flex-wrap justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={route('procurement.goods-receipts.index')}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <FileCheck2 className="h-4 w-4" />
                            Process Goods Receipt
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
