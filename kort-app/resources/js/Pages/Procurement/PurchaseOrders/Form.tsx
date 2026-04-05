import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { ProcurementFormField, ProcurementFormSection } from '@/Components/domain/procurement/ProcurementForm';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { asNumber, asStringValue, getFieldError, removeArrayItem, toAppSelectOptions, updateArrayItem } from '@/Lib/procurement';
import { formatCurrency } from '@/Lib/utils';
import { AppLayout } from '@/Layouts/AppLayout';
import type {
    ProcurementOptionRecord,
    PurchaseOrderFormData,
    PurchaseOrderFormLineData,
    PurchaseOrderFormPageProps,
    RequisitionDetailModel,
} from '@/types/procurement';

function emptyLine(): PurchaseOrderFormLineData {
    return {
        purchase_requisition_item_id: '',
        item_type: 'inventory',
        asset_category_id: '',
        inventory_item_id: '',
        item_description: '',
        quantity_ordered: '1',
        unit_of_measure: '',
        unit_price: '',
        line_total: '',
        remarks: '',
    };
}

function mapRequisitionLine(item: RequisitionDetailModel['items'][number]): PurchaseOrderFormLineData {
    return {
        purchase_requisition_item_id: asStringValue(item.id),
        item_type: item.item_type ?? 'inventory',
        asset_category_id: asStringValue(item.asset_category_id),
        inventory_item_id: asStringValue(item.inventory_item_id),
        item_description: item.item_description ?? '',
        quantity_ordered: asStringValue(item.quantity),
        unit_of_measure: item.unit_of_measure ?? '',
        unit_price: asStringValue(item.estimated_unit_cost),
        line_total: asStringValue(item.estimated_total),
        remarks: item.remarks ?? '',
    };
}

function findOption(records: ProcurementOptionRecord[], id: string) {
    return records.find((record) => String(record.id) === String(id));
}

export default function PurchaseOrderFormPage() {
    const { props } = useReactPage<PurchaseOrderFormPageProps>();
    const purchaseOrder = props.purchaseOrder;
    const form = useInertiaForm<PurchaseOrderFormData>({
        purchase_requisition_id: asStringValue(purchaseOrder?.purchase_requisition_id ?? props.selectedRequisition?.id),
        supplier_id: asStringValue(purchaseOrder?.supplier_id ?? props.selectedRequisition?.items?.find((item) => item.preferred_supplier_id)?.preferred_supplier_id),
        po_date: purchaseOrder?.po_date ?? new Date().toISOString().slice(0, 10),
        expected_delivery_date: purchaseOrder?.expected_delivery_date ?? '',
        currency: purchaseOrder?.currency ?? props.options.currency ?? 'PKR',
        payment_terms: purchaseOrder?.payment_terms ?? '',
        remarks: purchaseOrder?.remarks ?? '',
        tax_amount: asStringValue(purchaseOrder?.tax_amount),
        discount_amount: asStringValue(purchaseOrder?.discount_amount),
        items:
            purchaseOrder?.items?.map((item) => ({
                purchase_requisition_item_id: asStringValue(item.purchase_requisition_item_id),
                item_type: item.item_type ?? 'inventory',
                asset_category_id: asStringValue(item.asset_category_id),
                inventory_item_id: asStringValue(item.inventory_item_id),
                item_description: item.item_description ?? '',
                quantity_ordered: asStringValue(item.quantity_ordered),
                unit_of_measure: item.unit_of_measure ?? '',
                unit_price: asStringValue(item.unit_price),
                line_total: asStringValue(item.line_total),
                remarks: item.remarks ?? '',
            })) ??
            props.selectedRequisition?.items?.map(mapRequisitionLine) ?? [emptyLine()],
    });

    const requisitionItemOptions = props.options.approvedRequisitions.flatMap((requisition) =>
        (requisition.items ?? []).map((item) => ({
            value: item.id ?? 0,
            label: `${requisition.requisition_number} • ${item.item_description ?? 'Line item'}`,
        })),
    );

    const updateLine = (index: number, field: keyof PurchaseOrderFormLineData, value: string) => {
        form.setData(
            'items',
            updateArrayItem(form.data.items, index, (item) => {
                const next = { ...item, [field]: value };

                if (field === 'quantity_ordered' || field === 'unit_price') {
                    const total = asNumber(next.quantity_ordered) * asNumber(next.unit_price);
                    next.line_total = total > 0 ? total.toFixed(2) : '';
                }

                if (field === 'inventory_item_id') {
                    const inventoryItem = findOption(props.options.inventoryItems, value);
                    if (inventoryItem) {
                        next.unit_of_measure = inventoryItem.unit_of_measure ?? next.unit_of_measure;
                        next.item_description = next.item_description || inventoryItem.item_name || '';
                    }
                }

                return next;
            }),
        );
    };

    const loadRequisitionLines = (requisitionId: string) => {
        const requisition = props.options.approvedRequisitions.find((item) => String(item.id) === String(requisitionId));

        if (!requisition) {
            return;
        }

        form.setValues({
            supplier_id: asStringValue(requisition.items?.find((item) => item.preferred_supplier_id)?.preferred_supplier_id),
            items: requisition.items?.map(mapRequisitionLine) ?? [emptyLine()],
        });
    };

    const addLine = () => form.setData('items', [...form.data.items, emptyLine()]);

    const removeLine = (index: number) => {
        if (form.data.items.length === 1) {
            return;
        }

        form.setData('items', removeArrayItem(form.data.items, index));
    };

    const subtotal = form.data.items.reduce((sum, item) => sum + asNumber(item.line_total), 0);
    const grandTotal = subtotal + asNumber(form.data.tax_amount) - asNumber(form.data.discount_amount);
    const backHref = purchaseOrder ? route('procurement.purchase-orders.show', purchaseOrder.id) : route('procurement.purchase-orders.index');

    const submit = () => {
        if (purchaseOrder) {
            form.put(route('procurement.purchase-orders.update', purchaseOrder.id));
            return;
        }

        form.post(route('procurement.purchase-orders.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Purchase Orders', href: route('procurement.purchase-orders.index') },
                { label: purchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">PO Builder</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                                {purchaseOrder ? 'Edit purchase order' : 'Create purchase order'}
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Convert approved demand into a supplier-ready purchase order with clear financial totals and receipt traceability.
                            </p>
                        </div>
                        <AppButton asChild variant="outline">
                            <AppLink href={backHref}>
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </AppLink>
                        </AppButton>
                    </div>
                </div>

                <form
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                    }}
                >
                    <ProcurementFormSection title="Purchase Order Overview" description="Supplier, requisition, and commercial timing for this order.">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <ProcurementFormField label="Linked Requisition" error={form.errors.purchase_requisition_id}>
                                <AppSelect
                                    value={form.data.purchase_requisition_id}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        form.setData('purchase_requisition_id', value);
                                        if (value) {
                                            loadRequisitionLines(value);
                                        }
                                    }}
                                    options={toAppSelectOptions(props.options.approvedRequisitions, { label: 'Standalone purchase order', value: '' })}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Supplier" required error={form.errors.supplier_id}>
                                <AppSelect
                                    value={form.data.supplier_id}
                                    onChange={(event) => form.setData('supplier_id', event.target.value)}
                                    options={toAppSelectOptions(props.options.suppliers, { label: 'Select supplier', value: '' })}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="PO Date" required error={form.errors.po_date}>
                                <AppInput type="date" value={form.data.po_date} onChange={(event) => form.setData('po_date', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Expected Delivery Date" error={form.errors.expected_delivery_date}>
                                <AppInput
                                    type="date"
                                    value={form.data.expected_delivery_date}
                                    onChange={(event) => form.setData('expected_delivery_date', event.target.value)}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Currency" error={form.errors.currency}>
                                <AppInput value={form.data.currency} onChange={(event) => form.setData('currency', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Payment Terms" error={form.errors.payment_terms}>
                                <AppInput value={form.data.payment_terms} onChange={(event) => form.setData('payment_terms', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Remarks" error={form.errors.remarks} className="md:col-span-2 xl:col-span-3">
                                <AppTextarea rows={3} value={form.data.remarks} onChange={(event) => form.setData('remarks', event.target.value)} />
                            </ProcurementFormField>
                        </div>
                    </ProcurementFormSection>

                    <ProcurementFormSection title="PO Line Items" description="Order lines can be pulled from approved requisitions or entered as controlled standalone items.">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-slate-600">Use requisition-linked lines where possible so ordered and received progress stays traceable.</p>
                                <AppButton type="button" size="sm" onClick={addLine}>
                                    <Plus className="h-4 w-4" />
                                    Add Line
                                </AppButton>
                            </div>

                            {form.data.items.map((line, index) => (
                                <div key={index} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/60 p-5">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Line {index + 1}</p>
                                            <p className="text-xs text-slate-500">Ordered quantity, pricing, and source reference.</p>
                                        </div>
                                        <AppButton type="button" variant="ghost" size="sm" onClick={() => removeLine(index)} disabled={form.data.items.length === 1}>
                                            <Trash2 className="h-4 w-4" />
                                            Remove
                                        </AppButton>
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                        <ProcurementFormField label="Item Type" required error={getFieldError(form.errors, `items.${index}.item_type`)}>
                                            <AppSelect value={line.item_type} onChange={(event) => updateLine(index, 'item_type', event.target.value)}>
                                                <option value="inventory">Inventory</option>
                                                <option value="asset">Asset</option>
                                            </AppSelect>
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Requisition Line" error={getFieldError(form.errors, `items.${index}.purchase_requisition_item_id`)}>
                                            <AppSelect
                                                value={line.purchase_requisition_item_id}
                                                onChange={(event) => updateLine(index, 'purchase_requisition_item_id', event.target.value)}
                                                options={[{ label: 'Standalone line', value: '' }, ...requisitionItemOptions]}
                                            />
                                        </ProcurementFormField>
                                        {line.item_type === 'inventory' ? (
                                            <ProcurementFormField label="Inventory Item" error={getFieldError(form.errors, `items.${index}.inventory_item_id`)}>
                                                <AppSelect
                                                    value={line.inventory_item_id}
                                                    onChange={(event) => updateLine(index, 'inventory_item_id', event.target.value)}
                                                    options={toAppSelectOptions(props.options.inventoryItems, { label: 'Select item', value: '' })}
                                                />
                                            </ProcurementFormField>
                                        ) : (
                                            <ProcurementFormField label="Asset Category" error={getFieldError(form.errors, `items.${index}.asset_category_id`)}>
                                                <AppSelect
                                                    value={line.asset_category_id}
                                                    onChange={(event) => updateLine(index, 'asset_category_id', event.target.value)}
                                                    options={toAppSelectOptions(props.options.assetCategories, { label: 'Select category', value: '' })}
                                                />
                                            </ProcurementFormField>
                                        )}
                                        <ProcurementFormField label="Description" error={getFieldError(form.errors, `items.${index}.item_description`)} className="xl:col-span-2">
                                            <AppInput value={line.item_description} onChange={(event) => updateLine(index, 'item_description', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Quantity Ordered" required error={getFieldError(form.errors, `items.${index}.quantity_ordered`)}>
                                            <AppInput type="number" min={0.01} step="0.01" value={line.quantity_ordered} onChange={(event) => updateLine(index, 'quantity_ordered', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Unit of Measure" error={getFieldError(form.errors, `items.${index}.unit_of_measure`)}>
                                            <AppInput value={line.unit_of_measure} onChange={(event) => updateLine(index, 'unit_of_measure', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Unit Price" error={getFieldError(form.errors, `items.${index}.unit_price`)}>
                                            <AppInput type="number" min={0} step="0.01" value={line.unit_price} onChange={(event) => updateLine(index, 'unit_price', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Line Total" error={getFieldError(form.errors, `items.${index}.line_total`)}>
                                            <AppInput type="number" min={0} step="0.01" value={line.line_total} onChange={(event) => updateLine(index, 'line_total', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Remarks" error={getFieldError(form.errors, `items.${index}.remarks`)} className="xl:col-span-4">
                                            <AppInput value={line.remarks} onChange={(event) => updateLine(index, 'remarks', event.target.value)} />
                                        </ProcurementFormField>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ProcurementFormSection>

                    <ProcurementFormSection title="Financial Totals" description="Clean subtotal, tax, discount, and total visibility before saving or issuing.">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <ProcurementFormField label="Tax Amount" error={form.errors.tax_amount}>
                                <AppInput type="number" min={0} step="0.01" value={form.data.tax_amount} onChange={(event) => form.setData('tax_amount', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Discount Amount" error={form.errors.discount_amount}>
                                <AppInput type="number" min={0} step="0.01" value={form.data.discount_amount} onChange={(event) => form.setData('discount_amount', event.target.value)} />
                            </ProcurementFormField>
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Subtotal</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(subtotal, form.data.currency || 'PKR')}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Total</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(grandTotal, form.data.currency || 'PKR')}</p>
                            </div>
                        </div>
                    </ProcurementFormSection>

                    <div className="flex flex-wrap justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={backHref}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" />
                            {purchaseOrder ? 'Update Purchase Order' : 'Save Draft Purchase Order'}
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
