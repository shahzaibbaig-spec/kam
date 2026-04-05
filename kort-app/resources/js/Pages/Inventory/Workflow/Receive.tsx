import { ArrowRightLeft, Plus, Save, Trash2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { ReceiveSummaryCard } from '@/Components/domain/inventory/InventoryCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryOptionRecord, InventoryWorkflowItemOption, InventoryWorkflowPageProps, StockReceiveFormData, StockReceiveLineData } from '@/types/inventory';

function renderOptions(records: InventoryOptionRecord[] = []) {
    return records.map((record) => {
        const value = record.id ?? record.value ?? '';
        const label = record.name ?? record.label ?? '';

        return (
            <option key={`${value}-${label}`} value={value}>
                {label}
            </option>
        );
    });
}

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-sm text-rose-600">{message}</p> : null;
}

function makeLine(selectedItemId: number | null): StockReceiveLineData {
    return {
        inventory_item_id: selectedItemId ? String(selectedItemId) : '',
        batch_number: '',
        lot_number: '',
        manufacture_date: '',
        expiry_date: '',
        quantity: '1',
        unit_cost: '',
        storage_zone: '',
        remarks: '',
    };
}

function getLineError(errors: Record<string, string>, index: number, field: keyof StockReceiveLineData) {
    return errors[`items.${index}.${field}`];
}

export default function InventoryReceivePage() {
    const { props } = useReactPage<InventoryWorkflowPageProps>();
    const workflowItems = props.options.items ?? [];
    const selectedItem = workflowItems.find((item) => item.id === props.selectedItemId) ?? null;
    const form = useInertiaForm<StockReceiveFormData>({
        supplier_id: '',
        department_id: '',
        store_location_id: selectedItem?.store_location_id ? String(selectedItem.store_location_id) : '',
        receipt_date: new Date().toISOString().slice(0, 10),
        invoice_reference: '',
        delivery_note_number: '',
        remarks: '',
        items: [makeLine(props.selectedItemId)],
    });

    const updateLine = (index: number, patch: Partial<StockReceiveLineData>) => {
        const next = [...form.data.items];
        next[index] = {
            ...next[index],
            ...patch,
        } as StockReceiveLineData;
        form.setData('items', next);
    };

    const addLine = () => form.setData('items', [...form.data.items, makeLine(props.selectedItemId)]);

    const removeLine = (index: number) => {
        if (form.data.items.length <= 1) {
            return;
        }

        form.setData(
            'items',
            form.data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const itemFor = (itemId: string) => workflowItems.find((item) => item.id === Number(itemId)) ?? null;

    const lineHasDateConflict = (line: StockReceiveLineData) =>
        Boolean(line.manufacture_date && line.expiry_date && line.expiry_date < line.manufacture_date);

    const backHref = selectedItem ? route('inventory.items.show', selectedItem.id) : route('inventory.items.index');

    const submit = () => {
        form.post(route('inventory.receipts.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Inventory', href: route('inventory.items.index') },
                { label: 'Receive Stock' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Receive Stock"
                    description="Post incoming stock with clean batch details, clear receipt references, and low-error receiving for hospital store teams."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={backHref}>Back</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <Save className="h-4 w-4" />
                                Post receipt
                            </AppButton>
                        </>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="space-y-6">
                        <ReceiveSummaryCard item={selectedItem} />

                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Receipt guidance</AppCardTitle>
                                <AppCardDescription>Capture batch and expiry details carefully so FEFO allocation stays reliable later.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="space-y-4 p-6">
                                <AppAlert
                                    variant="info"
                                    title="Batch-first receiving"
                                    description="Each line below creates or updates a traceable batch record at the receiving location."
                                />
                                <p className="text-sm leading-6 text-slate-600">
                                    Use the supplier and document references to keep receipts auditable, and check manufacture and expiry dates before posting.
                                </p>
                            </AppCardContent>
                        </AppCard>
                    </div>

                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Receipt details</AppCardTitle>
                                <AppCardDescription>Record the receiving context, supplier, and document references for this stock receipt.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Supplier</label>
                                    <AppSelect value={form.data.supplier_id} onChange={(event) => form.setData('supplier_id', event.target.value)}>
                                        <option value="">Select supplier</option>
                                        {renderOptions(props.options.suppliers)}
                                    </AppSelect>
                                    <FieldError message={form.errors.supplier_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Department</label>
                                    <AppSelect value={form.data.department_id} onChange={(event) => form.setData('department_id', event.target.value)}>
                                        <option value="">Select department</option>
                                        {renderOptions(props.options.departments)}
                                    </AppSelect>
                                    <FieldError message={form.errors.department_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Store location</label>
                                    <AppSelect value={form.data.store_location_id} onChange={(event) => form.setData('store_location_id', event.target.value)}>
                                        <option value="">Select location</option>
                                        {renderOptions(props.options.locations)}
                                    </AppSelect>
                                    <FieldError message={form.errors.store_location_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Receipt date</label>
                                    <AppDateField value={form.data.receipt_date} onChange={(event) => form.setData('receipt_date', event.target.value)} />
                                    <FieldError message={form.errors.receipt_date} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Invoice reference</label>
                                    <AppInput value={form.data.invoice_reference} onChange={(event) => form.setData('invoice_reference', event.target.value)} />
                                    <FieldError message={form.errors.invoice_reference} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Delivery note</label>
                                    <AppInput value={form.data.delivery_note_number} onChange={(event) => form.setData('delivery_note_number', event.target.value)} />
                                    <FieldError message={form.errors.delivery_note_number} />
                                </div>

                                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                                    <label className="text-sm font-medium text-slate-700">Remarks</label>
                                    <AppTextarea rows={4} value={form.data.remarks} onChange={(event) => form.setData('remarks', event.target.value)} />
                                    <FieldError message={form.errors.remarks} />
                                </div>
                            </AppCardContent>
                        </AppCard>

                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <AppCardTitle>Receipt line items</AppCardTitle>
                                        <AppCardDescription>Add one or more batch entries to complete this stock receipt.</AppCardDescription>
                                    </div>
                                    <AppButton type="button" variant="outline" onClick={addLine}>
                                        <Plus className="h-4 w-4" />
                                        Add line
                                    </AppButton>
                                </div>
                            </AppCardHeader>
                            <AppCardContent className="space-y-5 p-6">
                                {form.data.items.map((line, index) => {
                                    const item = itemFor(line.inventory_item_id);
                                    const showConflict = lineHasDateConflict(line);

                                    return (
                                        <div key={`receive-line-${index}`} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Line {index + 1}</p>
                                                    <p className="text-xs text-slate-500">Batch details and quantity for one inventory item.</p>
                                                </div>
                                                <AppButton type="button" variant="ghost" size="sm" onClick={() => removeLine(index)} disabled={form.data.items.length === 1}>
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </AppButton>
                                            </div>

                                            {showConflict ? (
                                                <AppAlert
                                                    variant="danger"
                                                    title="Date conflict detected"
                                                    description="Expiry date cannot be earlier than the manufacture date."
                                                />
                                            ) : null}

                                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                                <div className="space-y-2 xl:col-span-2">
                                                    <label className="text-sm font-medium text-slate-700">Inventory item</label>
                                                    <AppSelect value={line.inventory_item_id} onChange={(event) => updateLine(index, { inventory_item_id: event.target.value })}>
                                                        <option value="">Select item</option>
                                                        {workflowItems.map((workflowItem) => (
                                                            <option key={workflowItem.id} value={workflowItem.id}>
                                                                {workflowItem.item_name} ({workflowItem.item_code})
                                                            </option>
                                                        ))}
                                                    </AppSelect>
                                                    <FieldError message={getLineError(form.errors, index, 'inventory_item_id')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Batch number</label>
                                                    <AppInput value={line.batch_number} onChange={(event) => updateLine(index, { batch_number: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'batch_number')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Lot number</label>
                                                    <AppInput value={line.lot_number} onChange={(event) => updateLine(index, { lot_number: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'lot_number')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Manufacture date</label>
                                                    <AppDateField value={line.manufacture_date} onChange={(event) => updateLine(index, { manufacture_date: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'manufacture_date')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Expiry date</label>
                                                    <AppDateField value={line.expiry_date} onChange={(event) => updateLine(index, { expiry_date: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'expiry_date')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Quantity</label>
                                                    <AppInput type="number" min="0.01" step="0.01" value={line.quantity} onChange={(event) => updateLine(index, { quantity: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'quantity')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Unit cost</label>
                                                    <AppInput type="number" min="0" step="0.01" value={line.unit_cost} onChange={(event) => updateLine(index, { unit_cost: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'unit_cost')} />
                                                </div>

                                                <div className="space-y-2 xl:col-span-2">
                                                    <label className="text-sm font-medium text-slate-700">Storage zone</label>
                                                    <AppInput
                                                        value={line.storage_zone}
                                                        placeholder={item?.store_location_name ? `${item.store_location_name} zone or shelf` : 'Rack, shelf, or zone'}
                                                        onChange={(event) => updateLine(index, { storage_zone: event.target.value })}
                                                    />
                                                    <FieldError message={getLineError(form.errors, index, 'storage_zone')} />
                                                </div>

                                                <div className="space-y-2 xl:col-span-4">
                                                    <label className="text-sm font-medium text-slate-700">Line remarks</label>
                                                    <AppInput value={line.remarks} onChange={(event) => updateLine(index, { remarks: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'remarks')} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </AppCardContent>
                        </AppCard>

                        <div className="flex justify-end">
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <ArrowRightLeft className="h-4 w-4" />
                                Post receipt
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
