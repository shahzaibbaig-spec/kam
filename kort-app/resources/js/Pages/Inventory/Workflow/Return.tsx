import { Plus, RotateCcw, Save, Trash2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { BatchStatusBadge } from '@/Components/domain/inventory/InventoryBadges';
import { ReturnStockSummaryCard } from '@/Components/domain/inventory/InventoryCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryOptionRecord, InventorySourceIssueOption, InventoryWorkflowPageProps, StockReturnFormData, StockReturnLineData } from '@/types/inventory';

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

function makeLine(selectedItemId: number | null): StockReturnLineData {
    return {
        inventory_item_id: selectedItemId ? String(selectedItemId) : '',
        inventory_batch_id: '',
        quantity: '1',
        return_condition: 'usable',
        remarks: '',
    };
}

function getLineError(errors: Record<string, string>, index: number, field: keyof StockReturnLineData) {
    return errors[`items.${index}.${field}`];
}

function returnConditionMessage(condition: string) {
    switch (condition) {
        case 'usable':
            return 'Usable stock can normally return to available balance after validation.';
        case 'damaged':
            return 'Damaged stock should stay segregated and will not return to normal issue availability.';
        case 'contaminated':
            return 'Contaminated stock must remain isolated and handled through controlled disposal or quarantine workflow.';
        case 'expired':
            return 'Expired stock should remain blocked from issue and handled through expiry controls.';
        default:
            return 'Review the selected condition before posting the return.';
    }
}

function SourceIssueSummary({ issue }: { issue: InventorySourceIssueOption | null }) {
    return (
        <AppCard>
            <AppCardHeader className="border-b border-slate-100">
                <AppCardTitle>Source issue summary</AppCardTitle>
                <AppCardDescription>Use the original issue reference when returning stock from departments, rooms, or staff.</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="p-6">
                {issue ? (
                    <div className="space-y-3 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">{issue.issue_number}</p>
                        <p>Issue date: {issue.issue_date ?? 'Not recorded'}</p>
                        <p>Department: {issue.department_name ?? 'Not recorded'}</p>
                        <p>Location: {issue.location_name ?? 'Not recorded'}</p>
                        <p>Issued to: {issue.issued_to_user_name ?? 'Not recorded'}</p>
                    </div>
                ) : (
                    <p className="text-sm leading-6 text-slate-600">Select a source issue if the return relates to a previous stock issue and you want stronger traceability.</p>
                )}
            </AppCardContent>
        </AppCard>
    );
}

export default function InventoryReturnPage() {
    const { props } = useReactPage<InventoryWorkflowPageProps>();
    const workflowItems = props.options.items ?? [];
    const selectedItem = workflowItems.find((item) => item.id === props.selectedItemId) ?? null;
    const sourceIssues = props.options.sourceIssues ?? [];
    const form = useInertiaForm<StockReturnFormData>({
        return_date: new Date().toISOString().slice(0, 10),
        source_issue_id: '',
        returned_by: '',
        received_by: '',
        department_id: '',
        location_id: '',
        room_or_area: '',
        remarks: '',
        items: [makeLine(props.selectedItemId)],
    });

    const updateLine = (index: number, patch: Partial<StockReturnLineData>) => {
        const next = [...form.data.items];
        next[index] = {
            ...next[index],
            ...patch,
        } as StockReturnLineData;
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
    const selectedSourceIssue = sourceIssues.find((issue) => issue.id === Number(form.data.source_issue_id)) ?? null;
    const backHref = selectedItem ? route('inventory.items.show', selectedItem.id) : route('inventory.items.index');

    const submit = () => {
        form.post(route('inventory.returns.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Inventory', href: route('inventory.items.index') },
                { label: 'Return Stock' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Return Stock"
                    description="Receive unused or restricted stock back into control with clear condition handling and batch-level traceability."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={backHref}>Back</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <Save className="h-4 w-4" />
                                Post return
                            </AppButton>
                        </>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="space-y-6">
                        <ReturnStockSummaryCard item={selectedItem} />
                        <SourceIssueSummary issue={selectedSourceIssue} />
                    </div>

                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Return details</AppCardTitle>
                                <AppCardDescription>Capture when the stock came back, who returned it, and where it is being received.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Return date</label>
                                    <AppDateField value={form.data.return_date} onChange={(event) => form.setData('return_date', event.target.value)} />
                                    <FieldError message={form.errors.return_date} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Source issue</label>
                                    <AppSelect value={form.data.source_issue_id} onChange={(event) => form.setData('source_issue_id', event.target.value)}>
                                        <option value="">Select source issue</option>
                                        {sourceIssues.map((issue) => (
                                            <option key={issue.id} value={issue.id}>
                                                {issue.issue_number} {issue.issue_date ? `| ${issue.issue_date}` : ''}
                                            </option>
                                        ))}
                                    </AppSelect>
                                    <FieldError message={form.errors.source_issue_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Receiving store</label>
                                    <AppSelect value={form.data.location_id} onChange={(event) => form.setData('location_id', event.target.value)}>
                                        <option value="">Select location</option>
                                        {renderOptions(props.options.locations)}
                                    </AppSelect>
                                    <FieldError message={form.errors.location_id} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Returned by</label>
                                    <AppSelect value={form.data.returned_by} onChange={(event) => form.setData('returned_by', event.target.value)}>
                                        <option value="">Select user</option>
                                        {renderOptions(props.options.users)}
                                    </AppSelect>
                                    <FieldError message={form.errors.returned_by} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Received by</label>
                                    <AppSelect value={form.data.received_by} onChange={(event) => form.setData('received_by', event.target.value)}>
                                        <option value="">Select user</option>
                                        {renderOptions(props.options.users)}
                                    </AppSelect>
                                    <FieldError message={form.errors.received_by} />
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
                                    <label className="text-sm font-medium text-slate-700">Room or area</label>
                                    <AppInput value={form.data.room_or_area} onChange={(event) => form.setData('room_or_area', event.target.value)} />
                                    <FieldError message={form.errors.room_or_area} />
                                </div>

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
                                        <AppCardTitle>Return line items</AppCardTitle>
                                        <AppCardDescription>Choose the batch and return condition so the stock lands in the right state after posting.</AppCardDescription>
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
                                        <div key={`return-line-${index}`} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Line {index + 1}</p>
                                                    <p className="text-xs text-slate-500">Select the returning item, batch, and condition clearly before posting.</p>
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
                                                    <AppSelect value={line.inventory_batch_id} onChange={(event) => updateLine(index, { inventory_batch_id: event.target.value })}>
                                                        <option value="">Select batch</option>
                                                        {(item?.batches ?? []).map((itemBatch) => (
                                                            <option key={itemBatch.id} value={itemBatch.id}>
                                                                {itemBatch.batch_number} | {itemBatch.available_quantity} | {itemBatch.expiry_date ?? 'No expiry'}
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
                                                    <label className="text-sm font-medium text-slate-700">Return condition</label>
                                                    <AppSelect value={line.return_condition} onChange={(event) => updateLine(index, { return_condition: event.target.value })}>
                                                        {renderOptions(props.options.returnConditions)}
                                                    </AppSelect>
                                                    <FieldError message={getLineError(form.errors, index, 'return_condition')} />
                                                </div>

                                                <div className="space-y-2 xl:col-span-3">
                                                    <label className="text-sm font-medium text-slate-700">Line remarks</label>
                                                    <AppInput value={line.remarks} onChange={(event) => updateLine(index, { remarks: event.target.value })} />
                                                    <FieldError message={getLineError(form.errors, index, 'remarks')} />
                                                </div>

                                                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 xl:col-span-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <AppBadge variant="outline">Return handling</AppBadge>
                                                        {batch ? <BatchStatusBadge value={batch.status} /> : null}
                                                    </div>
                                                    <p className="mt-3 text-sm text-slate-700">{returnConditionMessage(line.return_condition)}</p>
                                                    {batch ? (
                                                        <p className="mt-2 text-xs text-slate-500">
                                                            Selected batch {batch.batch_number} currently has {batch.available_quantity} available at {batch.store_location_name ?? 'the recorded store'}.
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </AppCardContent>
                        </AppCard>

                        <div className="flex justify-end">
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <RotateCcw className="h-4 w-4" />
                                Post return
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
