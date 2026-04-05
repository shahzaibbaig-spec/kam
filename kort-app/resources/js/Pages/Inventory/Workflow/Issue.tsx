import { ArrowRightLeft, Plus, Save, Trash2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { BatchStatusBadge } from '@/Components/domain/inventory/InventoryBadges';
import { IssueStockSummaryCard } from '@/Components/domain/inventory/InventoryCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryOptionRecord, InventoryWorkflowItemBatchOption, InventoryWorkflowItemOption, InventoryWorkflowPageProps, StockIssueFormData, StockIssueLineData } from '@/types/inventory';
import { formatShortDate } from '@/Lib/utils';

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

function makeLine(selectedItemId: number | null): StockIssueLineData {
    return {
        inventory_item_id: selectedItemId ? String(selectedItemId) : '',
        inventory_batch_id: '',
        quantity: '1',
        unit_of_measure: '',
        remarks: '',
    };
}

function getLineError(errors: Record<string, string>, index: number, field: keyof StockIssueLineData) {
    return errors[`items.${index}.${field}`];
}

function toNumber(value: string | number | null | undefined) {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
}

function itemAvailable(item: InventoryWorkflowItemOption | null) {
    if (!item) {
        return 0;
    }

    return item.batches
        .filter((batch) => !['quarantined', 'damaged', 'expired', 'exhausted'].includes(batch.status))
        .reduce((total, batch) => total + toNumber(batch.available_quantity), 0);
}

function allocationPreview(item: InventoryWorkflowItemOption | null, line: StockIssueLineData) {
    if (!item) {
        return [];
    }

    let remaining = toNumber(line.quantity);
    const preferredBatchId = Number(line.inventory_batch_id || 0);
    const orderedBatches = [...item.batches]
        .filter((batch) => !['quarantined', 'damaged', 'expired', 'exhausted'].includes(batch.status))
        .sort((left, right) => (left.expiry_date ?? '9999-12-31').localeCompare(right.expiry_date ?? '9999-12-31'));

    const arranged = preferredBatchId
        ? [
              ...orderedBatches.filter((batch) => batch.id === preferredBatchId),
              ...orderedBatches.filter((batch) => batch.id !== preferredBatchId),
          ]
        : orderedBatches;

    return arranged.flatMap((batch) => {
        if (remaining <= 0) {
            return [];
        }

        const allocated = Math.min(remaining, toNumber(batch.available_quantity));
        remaining -= allocated;

        return allocated > 0 ? [{ ...batch, allocated }] : [];
    });
}

export default function InventoryIssuePage() {
    const { props } = useReactPage<InventoryWorkflowPageProps>();
    const workflowItems = props.options.items ?? [];
    const selectedItem = workflowItems.find((item) => item.id === props.selectedItemId) ?? null;
    const form = useInertiaForm<StockIssueFormData>({
        issue_date: new Date().toISOString().slice(0, 10),
        issue_type: 'department',
        department_id: '',
        location_id: '',
        room_or_area: '',
        issued_to_user_id: '',
        remarks: '',
        items: [makeLine(props.selectedItemId)],
    });

    const updateLine = (index: number, patch: Partial<StockIssueLineData>) => {
        const next = [...form.data.items];
        next[index] = {
            ...next[index],
            ...patch,
        } as StockIssueLineData;
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

    const showDepartment = ['department', 'location', 'room', 'staff'].includes(form.data.issue_type);
    const showLocation = form.data.issue_type === 'location';
    const showRoom = form.data.issue_type === 'room';
    const showUser = form.data.issue_type === 'staff';
    const restrictedBatchCount = selectedItem?.batches.filter((batch) => ['quarantined', 'damaged', 'expired'].includes(batch.status)).length ?? 0;
    const backHref = selectedItem ? route('inventory.items.show', selectedItem.id) : route('inventory.items.index');

    const submit = () => {
        form.post(route('inventory.issues.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Inventory', href: route('inventory.items.index') },
                { label: 'Issue Stock' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Issue Stock"
                    description="Issue consumables with clear destination handling, FEFO-aware allocation visibility, and low-error quantity entry."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={backHref}>Back</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <Save className="h-4 w-4" />
                                Post issue
                            </AppButton>
                        </>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="space-y-6">
                        <IssueStockSummaryCard item={selectedItem} />

                        {selectedItem && itemAvailable(selectedItem) <= toNumber(selectedItem.reorder_level) ? (
                            <AppAlert
                                variant="warning"
                                title="Low stock warning"
                                description="This item is already at or below reorder level. Review the requested issue quantity carefully."
                            />
                        ) : null}

                        {selectedItem && restrictedBatchCount > 0 ? (
                            <AppAlert
                                variant="info"
                                title="Restricted batches detected"
                                description={`${restrictedBatchCount} batch records are quarantined, damaged, or expired and will be skipped by FEFO preview.`}
                            />
                        ) : null}
                    </div>

                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Issue details</AppCardTitle>
                                <AppCardDescription>Choose the issue type and destination carefully to keep stock issue history consistent.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Issue date</label>
                                    <AppDateField value={form.data.issue_date} onChange={(event) => form.setData('issue_date', event.target.value)} />
                                    <FieldError message={form.errors.issue_date} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Issue type</label>
                                    <AppSelect value={form.data.issue_type} onChange={(event) => form.setData('issue_type', event.target.value)}>
                                        {renderOptions(props.options.issueTypes)}
                                    </AppSelect>
                                    <FieldError message={form.errors.issue_type} />
                                </div>

                                {showDepartment ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Department</label>
                                        <AppSelect value={form.data.department_id} onChange={(event) => form.setData('department_id', event.target.value)}>
                                            <option value="">Select department</option>
                                            {renderOptions(props.options.departments)}
                                        </AppSelect>
                                        <FieldError message={form.errors.department_id} />
                                    </div>
                                ) : null}

                                {showLocation ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Location</label>
                                        <AppSelect value={form.data.location_id} onChange={(event) => form.setData('location_id', event.target.value)}>
                                            <option value="">Select location</option>
                                            {renderOptions(props.options.locations)}
                                        </AppSelect>
                                        <FieldError message={form.errors.location_id} />
                                    </div>
                                ) : null}

                                {showRoom ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Room or area</label>
                                        <AppInput value={form.data.room_or_area} onChange={(event) => form.setData('room_or_area', event.target.value)} />
                                        <FieldError message={form.errors.room_or_area} />
                                    </div>
                                ) : null}

                                {showUser ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Issued to user</label>
                                        <AppSelect value={form.data.issued_to_user_id} onChange={(event) => form.setData('issued_to_user_id', event.target.value)}>
                                            <option value="">Select user</option>
                                            {renderOptions(props.options.users)}
                                        </AppSelect>
                                        <FieldError message={form.errors.issued_to_user_id} />
                                    </div>
                                ) : null}

                                <div className="space-y-2 md:col-span-2 xl:col-span-4">
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
                                        <AppCardTitle>Issue line items</AppCardTitle>
                                        <AppCardDescription>Review FEFO allocation before posting so the issued quantity matches usable batch stock.</AppCardDescription>
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
                                    const allocations = allocationPreview(item, line);
                                    const allocatedTotal = allocations.reduce((total, allocation) => total + toNumber(allocation.allocated), 0);
                                    const shortfall = Math.max(0, toNumber(line.quantity) - allocatedTotal);

                                    return (
                                        <div key={`issue-line-${index}`} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Line {index + 1}</p>
                                                    <p className="text-xs text-slate-500">Select the item, preferred batch if needed, and requested quantity.</p>
                                                </div>
                                                <AppButton type="button" variant="ghost" size="sm" onClick={() => removeLine(index)} disabled={form.data.items.length === 1}>
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </AppButton>
                                            </div>

                                            {shortfall > 0 ? (
                                                <AppAlert
                                                    variant="warning"
                                                    title="Requested quantity exceeds FEFO-available stock"
                                                    description={`The current preview can allocate ${allocatedTotal}, leaving a shortfall of ${shortfall}.`}
                                                />
                                            ) : null}

                                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                                <div className="space-y-2 xl:col-span-2">
                                                    <label className="text-sm font-medium text-slate-700">Inventory item</label>
                                                    <AppSelect
                                                        value={line.inventory_item_id}
                                                        onChange={(event) => {
                                                            const nextItem = itemFor(event.target.value);
                                                            updateLine(index, {
                                                                inventory_item_id: event.target.value,
                                                                inventory_batch_id: '',
                                                                unit_of_measure: nextItem?.unit_of_measure ?? '',
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
                                                    <label className="text-sm font-medium text-slate-700">Preferred batch</label>
                                                    <AppSelect value={line.inventory_batch_id} onChange={(event) => updateLine(index, { inventory_batch_id: event.target.value })}>
                                                        <option value="">Auto FEFO</option>
                                                        {(item?.batches ?? []).map((batch) => (
                                                            <option key={batch.id} value={batch.id}>
                                                                {batch.batch_number} | {batch.available_quantity} | {batch.expiry_date ?? 'No expiry'}
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
                                                    <label className="text-sm font-medium text-slate-700">Unit of measure</label>
                                                    <AppInput value={line.unit_of_measure} placeholder={item?.unit_of_measure ?? 'Unit'} onChange={(event) => updateLine(index, { unit_of_measure: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'unit_of_measure')} />
                                                </div>

                                                <div className="space-y-2 xl:col-span-3">
                                                    <label className="text-sm font-medium text-slate-700">Line remarks</label>
                                                    <AppInput value={line.remarks} onChange={(event) => updateLine(index, { remarks: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'remarks')} />
                                                </div>

                                                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 xl:col-span-4">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">FEFO preview</p>
                                                    {!item ? (
                                                        <p className="mt-3 text-sm text-slate-500">Select an inventory item to preview usable batch allocation.</p>
                                                    ) : allocations.length === 0 ? (
                                                        <p className="mt-3 text-sm text-slate-500">No issuable batches are available for the requested item right now.</p>
                                                    ) : (
                                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                            {allocations.map((allocation) => (
                                                                <div key={`${index}-${allocation.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="font-semibold text-slate-900">{allocation.batch_number}</span>
                                                                        <BatchStatusBadge value={allocation.status} />
                                                                        <AppBadge variant="outline">Allocate {allocation.allocated}</AppBadge>
                                                                    </div>
                                                                    <p className="mt-2 text-sm text-slate-600">{allocation.store_location_name ?? 'No store location recorded'}</p>
                                                                    <p className="mt-1 text-xs text-slate-500">Expiry {formatShortDate(allocation.expiry_date)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
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
                                Post issue
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
