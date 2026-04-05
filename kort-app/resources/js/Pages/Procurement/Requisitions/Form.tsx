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
import type { ProcurementOptionRecord, RequisitionFormData, RequisitionFormLineData, RequisitionFormPageProps } from '@/types/procurement';

function emptyLine(): RequisitionFormLineData {
    return {
        item_type: 'inventory',
        asset_category_id: '',
        inventory_item_id: '',
        item_description: '',
        quantity: '1',
        unit_of_measure: '',
        estimated_unit_cost: '',
        estimated_total: '',
        preferred_supplier_id: '',
        needed_by_date: '',
        remarks: '',
    };
}

function itemNameFor(records: ProcurementOptionRecord[], id: string) {
    return records.find((record) => String(record.id) === String(id));
}

export default function RequisitionFormPage() {
    const { props } = useReactPage<RequisitionFormPageProps>();
    const requisition = props.requisition;
    const form = useInertiaForm<RequisitionFormData>({
        requisition_type: requisition?.requisition_type ?? 'inventory',
        department_id: asStringValue(requisition?.department_id),
        requested_by: asStringValue(requisition?.requested_by ?? props.currentUserId),
        request_date: requisition?.request_date ?? new Date().toISOString().slice(0, 10),
        priority: requisition?.priority ?? 'normal',
        purpose: requisition?.purpose ?? '',
        remarks: requisition?.remarks ?? '',
        items:
            requisition?.items?.map((item) => ({
                item_type: item.item_type ?? 'inventory',
                asset_category_id: asStringValue(item.asset_category_id),
                inventory_item_id: asStringValue(item.inventory_item_id),
                item_description: item.item_description ?? '',
                quantity: asStringValue(item.quantity),
                unit_of_measure: item.unit_of_measure ?? '',
                estimated_unit_cost: asStringValue(item.estimated_unit_cost),
                estimated_total: asStringValue(item.estimated_total),
                preferred_supplier_id: asStringValue(item.preferred_supplier_id),
                needed_by_date: item.needed_by_date ?? '',
                remarks: item.remarks ?? '',
            })) ?? [emptyLine()],
    });

    const updateLine = (index: number, field: keyof RequisitionFormLineData, value: string) => {
        form.setData(
            'items',
            updateArrayItem(form.data.items, index, (item) => {
                const next = { ...item, [field]: value };

                if (field === 'quantity' || field === 'estimated_unit_cost') {
                    const total = asNumber(next.quantity) * asNumber(next.estimated_unit_cost);
                    next.estimated_total = total > 0 ? total.toFixed(2) : '';
                }

                if (field === 'inventory_item_id') {
                    const inventoryItem = itemNameFor(props.options.inventoryItems, value);
                    if (inventoryItem) {
                        next.unit_of_measure = inventoryItem.unit_of_measure ?? next.unit_of_measure;
                        next.item_description = next.item_description || inventoryItem.item_name || '';
                    }
                }

                return next;
            }),
        );
    };

    const addLine = () => form.setData('items', [...form.data.items, emptyLine()]);

    const removeLine = (index: number) => {
        if (form.data.items.length === 1) {
            return;
        }

        form.setData('items', removeArrayItem(form.data.items, index));
    };

    const totalEstimate = form.data.items.reduce((sum, item) => sum + asNumber(item.estimated_total), 0);
    const backHref = requisition ? route('procurement.requisitions.show', requisition.id) : route('procurement.requisitions.index');

    const submit = () => {
        if (requisition) {
            form.put(route('procurement.requisitions.update', requisition.id));
            return;
        }

        form.post(route('procurement.requisitions.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Requisitions', href: route('procurement.requisitions.index') },
                { label: requisition ? 'Edit Requisition' : 'Create Requisition' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Requisition Builder</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                                {requisition ? 'Edit purchase requisition' : 'Create purchase requisition'}
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Prepare a clear, auditable procurement request with structured line items and department context.
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
                    <ProcurementFormSection title="Requisition Overview" description="Header details for ownership, timing, and operational purpose.">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <ProcurementFormField label="Requisition Type" required error={form.errors.requisition_type}>
                                <AppSelect
                                    value={form.data.requisition_type}
                                    onChange={(event) => form.setData('requisition_type', event.target.value)}
                                    options={toAppSelectOptions(props.options.types)}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Department" error={form.errors.department_id}>
                                <AppSelect
                                    value={form.data.department_id}
                                    onChange={(event) => form.setData('department_id', event.target.value)}
                                    options={toAppSelectOptions(props.options.departments, { label: 'Select department', value: '' })}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Requested By" error={form.errors.requested_by}>
                                <AppSelect
                                    value={form.data.requested_by}
                                    onChange={(event) => form.setData('requested_by', event.target.value)}
                                    options={toAppSelectOptions(props.options.users)}
                                />
                            </ProcurementFormField>
                            <ProcurementFormField label="Request Date" required error={form.errors.request_date}>
                                <AppInput type="date" value={form.data.request_date} onChange={(event) => form.setData('request_date', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Priority" required error={form.errors.priority}>
                                <AppSelect
                                    value={form.data.priority}
                                    onChange={(event) => form.setData('priority', event.target.value)}
                                    options={toAppSelectOptions(props.options.priorities)}
                                />
                            </ProcurementFormField>
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Estimated Total</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(totalEstimate)}</p>
                            </div>
                            <ProcurementFormField label="Purpose" error={form.errors.purpose} className="md:col-span-2 xl:col-span-3">
                                <AppTextarea rows={3} value={form.data.purpose} onChange={(event) => form.setData('purpose', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Remarks" error={form.errors.remarks} className="md:col-span-2 xl:col-span-3">
                                <AppTextarea rows={3} value={form.data.remarks} onChange={(event) => form.setData('remarks', event.target.value)} />
                            </ProcurementFormField>
                        </div>
                    </ProcurementFormSection>

                    <ProcurementFormSection
                        title="Line Items"
                        description="Define asset or inventory demand with quantities, supplier preference, and estimated costing."
                    >
                        <div className="space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-slate-600">Add repeatable lines and keep totals visible as you build the request.</p>
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
                                            <p className="text-xs text-slate-500">Capture structured demand or use a controlled free-text description.</p>
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
                                        <ProcurementFormField label="Item Description" error={getFieldError(form.errors, `items.${index}.item_description`)} className="xl:col-span-2">
                                            <AppInput value={line.item_description} onChange={(event) => updateLine(index, 'item_description', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Quantity" required error={getFieldError(form.errors, `items.${index}.quantity`)}>
                                            <AppInput type="number" min={0.01} step="0.01" value={line.quantity} onChange={(event) => updateLine(index, 'quantity', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Unit of Measure" error={getFieldError(form.errors, `items.${index}.unit_of_measure`)}>
                                            <AppInput value={line.unit_of_measure} onChange={(event) => updateLine(index, 'unit_of_measure', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Estimated Unit Cost" error={getFieldError(form.errors, `items.${index}.estimated_unit_cost`)}>
                                            <AppInput type="number" min={0} step="0.01" value={line.estimated_unit_cost} onChange={(event) => updateLine(index, 'estimated_unit_cost', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Estimated Total" error={getFieldError(form.errors, `items.${index}.estimated_total`)}>
                                            <AppInput type="number" min={0} step="0.01" value={line.estimated_total} onChange={(event) => updateLine(index, 'estimated_total', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Preferred Supplier" error={getFieldError(form.errors, `items.${index}.preferred_supplier_id`)}>
                                            <AppSelect
                                                value={line.preferred_supplier_id}
                                                onChange={(event) => updateLine(index, 'preferred_supplier_id', event.target.value)}
                                                options={toAppSelectOptions(props.options.suppliers, { label: 'Any approved supplier', value: '' })}
                                            />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Needed By Date" error={getFieldError(form.errors, `items.${index}.needed_by_date`)}>
                                            <AppInput type="date" value={line.needed_by_date} onChange={(event) => updateLine(index, 'needed_by_date', event.target.value)} />
                                        </ProcurementFormField>
                                        <ProcurementFormField label="Line Remarks" error={getFieldError(form.errors, `items.${index}.remarks`)} className="xl:col-span-2">
                                            <AppInput value={line.remarks} onChange={(event) => updateLine(index, 'remarks', event.target.value)} />
                                        </ProcurementFormField>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ProcurementFormSection>

                    <div className="flex flex-wrap justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={backHref}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" />
                            {requisition ? 'Update Requisition' : 'Save Draft Requisition'}
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
