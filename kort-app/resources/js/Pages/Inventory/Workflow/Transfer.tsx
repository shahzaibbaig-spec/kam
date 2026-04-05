import { ArrowRightLeft, Plus, Save, Trash2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { BatchStatusBadge } from '@/Components/domain/inventory/InventoryBadges';
import { ReceiveSummaryCard, TransferStockComparisonCard } from '@/Components/domain/inventory/InventoryCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryOptionRecord, InventoryWorkflowPageProps, StockTransferFormData, StockTransferLineData } from '@/types/inventory';

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

function makeLine(selectedItemId: number | null): StockTransferLineData {
    return {
        inventory_item_id: selectedItemId ? String(selectedItemId) : '',
        inventory_batch_id: '',
        quantity: '1',
        storage_zone: '',
        remarks: '',
    };
}

function getLineError(errors: Record<string, string>, index: number, field: keyof StockTransferLineData) {
    return errors[`items.${index}.${field}`];
}

function joinSelection(first?: string | null, second?: string | null) {
    return [first, second].filter(Boolean).join(' - ');
}

export default function InventoryTransferPage() {
    const { props } = useReactPage<InventoryWorkflowPageProps>();
    const workflowItems = props.options.items ?? [];
    const selectedItem = workflowItems.find((item) => item.id === props.selectedItemId) ?? null;
    const form = useInertiaForm<StockTransferFormData>({
        transfer_date: new Date().toISOString().slice(0, 10),
        from_location_id: selectedItem?.store_location_id ? String(selectedItem.store_location_id) : '',
        to_location_id: '',
        from_department_id: '',
        to_department_id: '',
        remarks: '',
        items: [makeLine(props.selectedItemId)],
    });

    const updateLine = (index: number, patch: Partial<StockTransferLineData>) => {
        const next = [...form.data.items];
        next[index] = {
            ...next[index],
            ...patch,
        } as StockTransferLineData;
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
        form.post(route('inventory.transfers.store'));
    };

    const fromLocationName = props.options.locations?.find((location) => String(location.id ?? '') === form.data.from_location_id)?.name ?? '';
    const toLocationName = props.options.locations?.find((location) => String(location.id ?? '') === form.data.to_location_id)?.name ?? '';
    const fromDepartmentName = props.options.departments?.find((department) => String(department.id ?? '') === form.data.from_department_id)?.name ?? '';
    const toDepartmentName = props.options.departments?.find((department) => String(department.id ?? '') === form.data.to_department_id)?.name ?? '';

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Inventory', href: route('inventory.items.index') },
                { label: 'Transfer Stock' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Transfer Stock"
                    description="Move stock between stores or departments with clear source and destination context and preserved batch traceability."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={backHref}>Back</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <Save className="h-4 w-4" />
                                Post transfer
                            </AppButton>
                        </>
                    }
                />

                {form.data.from_location_id && form.data.from_location_id === form.data.to_location_id ? (
                    <AppAlert
                        variant="warning"
                        title="Source and destination are the same"
                        description="Choose a different destination location before posting the transfer."
                    />
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="space-y-6">
                        <ReceiveSummaryCard item={selectedItem} />
                        <TransferStockComparisonCard
                            fromLabel={joinSelection(fromLocationName, fromDepartmentName)}
                            toLabel={joinSelection(toLocationName, toDepartmentName)}
                        />
                    </div>

                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Transfer details</AppCardTitle>
                                <AppCardDescription>Set the source and destination carefully before choosing batches and quantities.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Transfer date</label>
                                    <AppDateField value={form.data.transfer_date} onChange={(event) => form.setData('transfer_date', event.target.value)} />
                                    <FieldError message={form.errors.transfer_date} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">From location</label>
                                    <AppSelect value={form.data.from_location_id} onChange={(event) => form.setData('from_location_id', event.target.value)}>
                                        <option value="">Select source location</option>
                                        {renderOptions(props.options.locations)}
                                    </AppSelect>
                                    <FieldError message={form.errors.from_location_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">To location</label>
                                    <AppSelect value={form.data.to_location_id} onChange={(event) => form.setData('to_location_id', event.target.value)}>
                                        <option value="">Select destination location</option>
                                        {renderOptions(props.options.locations)}
                                    </AppSelect>
                                    <FieldError message={form.errors.to_location_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">From department</label>
                                    <AppSelect value={form.data.from_department_id} onChange={(event) => form.setData('from_department_id', event.target.value)}>
                                        <option value="">Select department</option>
                                        {renderOptions(props.options.departments)}
                                    </AppSelect>
                                    <FieldError message={form.errors.from_department_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">To department</label>
                                    <AppSelect value={form.data.to_department_id} onChange={(event) => form.setData('to_department_id', event.target.value)}>
                                        <option value="">Select department</option>
                                        {renderOptions(props.options.departments)}
                                    </AppSelect>
                                    <FieldError message={form.errors.to_department_id} />
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
                                        <AppCardTitle>Transfer line items</AppCardTitle>
                                        <AppCardDescription>Pick the exact batch and quantity so the stock movement remains traceable between locations.</AppCardDescription>
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
                                        <div key={`transfer-line-${index}`} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Line {index + 1}</p>
                                                    <p className="text-xs text-slate-500">Choose the source batch and the amount moving to the destination.</p>
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
                                                        onChange={(event) => {
                                                            updateLine(index, {
                                                                inventory_item_id: event.target.value,
                                                                inventory_batch_id: '',
                                                                storage_zone: '',
                                                            });
                                                        }}
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
                                                                storage_zone: nextBatch?.store_location_name ?? line.storage_zone,
                                                            });

                                                            if (!form.data.from_location_id && nextBatch?.store_location_id) {
                                                                form.setData('from_location_id', String(nextBatch.store_location_id));
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select batch</option>
                                                        {(item?.batches ?? []).map((itemBatch) => (
                                                            <option key={itemBatch.id} value={itemBatch.id}>
                                                                {itemBatch.batch_number} | {itemBatch.available_quantity} | {itemBatch.store_location_name ?? 'No store'}
                                                            </option>
                                                        ))}
                                                    </AppSelect>
                                                    <FieldError message={getLineError(form.errors, index, 'inventory_batch_id')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Quantity</label>
                                                    <AppInput type="number" min="0.01" step="0.01" value={line.quantity} onChange={(event) => updateLine(index, { quantity: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'quantity')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Destination storage zone</label>
                                                    <AppInput value={line.storage_zone} onChange={(event) => updateLine(index, { storage_zone: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'storage_zone')} />
                                                </div>

                                                <div className="space-y-2 xl:col-span-3">
                                                    <label className="text-sm font-medium text-slate-700">Line remarks</label>
                                                    <AppInput value={line.remarks} onChange={(event) => updateLine(index, { remarks: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'remarks')} />
                                                </div>

                                                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 xl:col-span-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <AppBadge variant="outline">Transfer snapshot</AppBadge>
                                                        {batch ? <BatchStatusBadge value={batch.status} /> : null}
                                                    </div>
                                                    {batch ? (
                                                        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                                                            <p>Source store: <span className="font-medium text-slate-900">{batch.store_location_name ?? 'Not recorded'}</span></p>
                                                            <p>Available quantity: <span className="font-medium text-slate-900">{batch.available_quantity}</span></p>
                                                            <p className="md:col-span-2">Batch: <span className="font-medium text-slate-900">{batch.batch_number}</span></p>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-3 text-sm text-slate-500">Select a batch to review the current source location and available quantity.</p>
                                                    )}
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
                                Post transfer
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
