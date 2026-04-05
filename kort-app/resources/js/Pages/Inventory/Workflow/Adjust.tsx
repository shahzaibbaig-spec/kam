import { ClipboardPenLine, Plus, Save, Trash2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AdjustmentSummaryCard, ReceiveSummaryCard } from '@/Components/domain/inventory/InventoryCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryOptionRecord, InventoryWorkflowPageProps, StockAdjustmentFormData, StockAdjustmentLineData } from '@/types/inventory';

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

function makeLine(selectedItemId: number | null): StockAdjustmentLineData {
    return {
        inventory_item_id: selectedItemId ? String(selectedItemId) : '',
        inventory_batch_id: '',
        system_quantity: '0',
        physical_quantity: '',
        adjustment_quantity: '0',
        unit_of_measure: '',
        remarks: '',
    };
}

function getLineError(errors: Record<string, string>, index: number, field: keyof StockAdjustmentLineData) {
    return errors[`items.${index}.${field}`];
}

function adjustmentWarning(adjustmentType: string) {
    switch (adjustmentType) {
        case 'damage':
            return 'Damage adjustments reduce usable stock. Confirm the affected quantity before posting.';
        case 'expiry':
            return 'Expiry adjustments permanently move stock out of issue availability.';
        case 'quarantine':
            return 'Quarantine adjustments hold stock from normal issue until it is released or resolved.';
        case 'decrease':
            return 'Decrease adjustments remove stock from balance immediately. Double-check the reason and quantity.';
        default:
            return undefined;
    }
}

export default function InventoryAdjustPage() {
    const { props } = useReactPage<InventoryWorkflowPageProps>();
    const workflowItems = props.options.items ?? [];
    const selectedItem = workflowItems.find((item) => item.id === props.selectedItemId) ?? null;
    const form = useInertiaForm<StockAdjustmentFormData>({
        adjustment_date: new Date().toISOString().slice(0, 10),
        adjustment_type: 'increase',
        reason: '',
        location_id: selectedItem?.store_location_id ? String(selectedItem.store_location_id) : '',
        department_id: '',
        remarks: '',
        items: [makeLine(props.selectedItemId)],
    });

    const updateLine = (index: number, patch: Partial<StockAdjustmentLineData>) => {
        const next = [...form.data.items];
        next[index] = {
            ...next[index],
            ...patch,
        } as StockAdjustmentLineData;
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
    const batchFor = (itemId: string, batchId: string) => itemFor(itemId)?.batches.find((batch) => batch.id === Number(batchId)) ?? null;
    const backHref = selectedItem ? route('inventory.items.show', selectedItem.id) : route('inventory.items.index');

    const submit = () => {
        form.post(route('inventory.adjustments.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Inventory', href: route('inventory.items.index') },
                { label: 'Adjust Stock' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Adjust Stock"
                    description="Handle recounts, damage, expiry, quarantine, release, and admin corrections with clear quantity comparisons."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={backHref}>Back</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <Save className="h-4 w-4" />
                                Post adjustment
                            </AppButton>
                        </>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="space-y-6">
                        <ReceiveSummaryCard item={selectedItem} />
                        <AdjustmentSummaryCard
                            title="Adjustment handling"
                            description="Keep the reason and quantity trail clear for audits, recounts, and exception management."
                            warning={adjustmentWarning(form.data.adjustment_type)}
                        />
                    </div>

                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Adjustment details</AppCardTitle>
                                <AppCardDescription>Pick the adjustment type, reason, and operational location before updating line quantities.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Adjustment date</label>
                                    <AppDateField value={form.data.adjustment_date} onChange={(event) => form.setData('adjustment_date', event.target.value)} />
                                    <FieldError message={form.errors.adjustment_date} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Adjustment type</label>
                                    <AppSelect value={form.data.adjustment_type} onChange={(event) => form.setData('adjustment_type', event.target.value)}>
                                        {renderOptions(props.options.adjustmentTypes)}
                                    </AppSelect>
                                    <FieldError message={form.errors.adjustment_type} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Location</label>
                                    <AppSelect value={form.data.location_id} onChange={(event) => form.setData('location_id', event.target.value)}>
                                        <option value="">Select location</option>
                                        {renderOptions(props.options.locations)}
                                    </AppSelect>
                                    <FieldError message={form.errors.location_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Department</label>
                                    <AppSelect value={form.data.department_id} onChange={(event) => form.setData('department_id', event.target.value)}>
                                        <option value="">Select department</option>
                                        {renderOptions(props.options.departments)}
                                    </AppSelect>
                                    <FieldError message={form.errors.department_id} />
                                </div>

                                <div className="space-y-2 md:col-span-2 xl:col-span-4">
                                    <label className="text-sm font-medium text-slate-700">Reason</label>
                                    <AppInput value={form.data.reason} onChange={(event) => form.setData('reason', event.target.value)} />
                                    <FieldError message={form.errors.reason} />
                                </div>

                                <div className="space-y-2 md:col-span-2 xl:col-span-4">
                                    <label className="text-sm font-medium text-slate-700">Remarks</label>
                                    <AppTextarea rows={4} value={form.data.remarks} onChange={(event) => form.setData('remarks', event.target.value)} />
                                    <FieldError message={form.errors.remarks} />
                                </div>
                            </AppCardContent>
                        </AppCard>

                        {form.data.adjustment_type === 'recount' ? (
                            <AppAlert
                                variant="info"
                                title="Recount mode"
                                description="Enter both the system quantity and the observed physical quantity so the difference is captured cleanly."
                            />
                        ) : null}

                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <AppCardTitle>Adjustment line items</AppCardTitle>
                                        <AppCardDescription>Review system quantity, physical count if applicable, and the correction amount for each batch.</AppCardDescription>
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
                                    const batch = batchFor(line.inventory_item_id, line.inventory_batch_id);

                                    return (
                                        <div key={`adjust-line-${index}`} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Line {index + 1}</p>
                                                    <p className="text-xs text-slate-500">Choose the item and batch, then compare system and physical quantities before posting.</p>
                                                </div>
                                                <AppButton type="button" variant="ghost" size="sm" onClick={() => removeLine(index)} disabled={form.data.items.length === 1}>
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </AppButton>
                                            </div>

                                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                                <div className="space-y-2 xl:col-span-2">
                                                    <label className="text-sm font-medium text-slate-700">Inventory item</label>
                                                    <AppSelect
                                                        value={line.inventory_item_id}
                                                        onChange={(event) =>
                                                            updateLine(index, {
                                                                inventory_item_id: event.target.value,
                                                                inventory_batch_id: '',
                                                                system_quantity: '0',
                                                                unit_of_measure: itemFor(event.target.value)?.unit_of_measure ?? '',
                                                            })
                                                        }
                                                    >
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
                                                    <label className="text-sm font-medium text-slate-700">Batch</label>
                                                    <AppSelect
                                                        value={line.inventory_batch_id}
                                                        onChange={(event) => {
                                                            const nextBatch = batchFor(line.inventory_item_id, event.target.value);
                                                            updateLine(index, {
                                                                inventory_batch_id: event.target.value,
                                                                system_quantity: String(nextBatch?.available_quantity ?? '0'),
                                                                unit_of_measure: item?.unit_of_measure ?? line.unit_of_measure,
                                                            });
                                                        }}
                                                    >
                                                        <option value="">Select batch</option>
                                                        {(item?.batches ?? []).map((itemBatch) => (
                                                            <option key={itemBatch.id} value={itemBatch.id}>
                                                                {itemBatch.batch_number} | {itemBatch.available_quantity}
                                                            </option>
                                                        ))}
                                                    </AppSelect>
                                                    <FieldError message={getLineError(form.errors, index, 'inventory_batch_id')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">System quantity</label>
                                                    <AppInput type="number" min="0" step="0.01" value={line.system_quantity} onChange={(event) => updateLine(index, { system_quantity: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'system_quantity')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Physical quantity</label>
                                                    <AppInput type="number" min="0" step="0.01" value={line.physical_quantity} onChange={(event) => updateLine(index, { physical_quantity: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'physical_quantity')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Adjustment quantity</label>
                                                    <AppInput type="number" min="0" step="0.01" value={line.adjustment_quantity} onChange={(event) => updateLine(index, { adjustment_quantity: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'adjustment_quantity')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Unit of measure</label>
                                                    <AppInput value={line.unit_of_measure} placeholder={item?.unit_of_measure ?? 'Unit'} onChange={(event) => updateLine(index, { unit_of_measure: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'unit_of_measure')} />
                                                </div>

                                                <div className="space-y-2 xl:col-span-2">
                                                    <label className="text-sm font-medium text-slate-700">Line remarks</label>
                                                    <AppInput value={line.remarks} onChange={(event) => updateLine(index, { remarks: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'remarks')} />
                                                </div>

                                                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 xl:col-span-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <AppBadge variant="outline">Quantity comparison</AppBadge>
                                                        {batch ? <AppBadge variant="neutral">{batch.batch_number}</AppBadge> : null}
                                                    </div>
                                                    <div className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                                                        <p>System quantity: <span className="font-medium text-slate-900">{line.system_quantity || '0'}</span></p>
                                                        <p>Physical quantity: <span className="font-medium text-slate-900">{line.physical_quantity || 'Not entered'}</span></p>
                                                        <p>Adjustment: <span className="font-medium text-slate-900">{line.adjustment_quantity || '0'}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </AppCardContent>
                        </AppCard>

                        <div className="flex justify-end">
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <ClipboardPenLine className="h-4 w-4" />
                                Post adjustment
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
