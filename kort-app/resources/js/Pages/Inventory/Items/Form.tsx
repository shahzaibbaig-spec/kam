import { Save } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppCheckbox } from '@/Components/ui/AppCheckbox';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryFormData, InventoryFormPageProps, InventoryOptionRecord } from '@/types/inventory';

function normalizeValue(value: string | number | null | undefined) {
    return value === null || value === undefined ? '' : String(value);
}

function buildFormData(item: InventoryFormPageProps['item']): InventoryFormData {
    return {
        item_name: item?.item_name ?? '',
        item_code: item?.item_code ?? '',
        inventory_category_id: normalizeValue(item?.inventory_category_id),
        subcategory: item?.subcategory ?? '',
        barcode_value: item?.barcode_value ?? '',
        sku: item?.sku ?? '',
        unit_of_measure: item?.unit_of_measure ?? 'unit',
        pack_size: item?.pack_size ?? '',
        reorder_level: normalizeValue(item?.reorder_level ?? '0'),
        minimum_level: normalizeValue(item?.minimum_level ?? '0'),
        maximum_level: normalizeValue(item?.maximum_level),
        supplier_id: normalizeValue(item?.supplier_id),
        store_location_id: normalizeValue(item?.store_location_id),
        storage_zone: item?.storage_zone ?? '',
        temperature_sensitive: item?.temperature_sensitive ?? false,
        sterile_item: item?.sterile_item ?? false,
        high_risk_item: item?.high_risk_item ?? false,
        controlled_use: item?.controlled_use ?? false,
        is_active: item?.is_active ?? true,
        notes: item?.notes ?? '',
    };
}

function renderOptions(records: InventoryOptionRecord[]) {
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

function FieldLabel({ children, hint }: { children: string; hint?: string }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">{children}</label>
            {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
        </div>
    );
}

function ToggleField({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4">
            <AppCheckbox checked={checked} onCheckedChange={(next) => onChange(next === true)} />
            <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
        </label>
    );
}

export default function InventoryItemFormPage() {
    const { props } = useReactPage<InventoryFormPageProps>();
    const item = props.item;
    const form = useInertiaForm<InventoryFormData>(buildFormData(item));

    const submit = () => {
        if (item) {
            form.put(route('inventory.items.update', item.id));
            return;
        }

        form.post(route('inventory.items.store'));
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Inventory', href: route('inventory.items.index') }, { label: item ? item.item_name : 'Create Inventory Item' }]}>
            <div className="space-y-6">
                <PageHeader
                    title={item ? 'Edit Inventory Item' : 'Create Inventory Item'}
                    description="Capture item identity, storage rules, supplier preference, and reorder controls in one structured inventory record."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={item ? route('inventory.items.show', item.id) : route('inventory.items.index')}>Cancel</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <Save className="h-4 w-4" />
                                {item ? 'Update item' : 'Create item'}
                            </AppButton>
                        </>
                    }
                />

                {Object.keys(props.errors ?? {}).length > 0 ? (
                    <AppAlert
                        variant="danger"
                        title="Please review the highlighted fields"
                        description="Laravel validation blocked the save request. Correct the errors below and try again."
                    />
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Item identity</AppCardTitle>
                                <AppCardDescription>Core fields used during search, scanning, batch posting, and ward requests.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2 md:col-span-2">
                                    <FieldLabel>Item name</FieldLabel>
                                    <AppInput value={form.data.item_name} onChange={(event) => form.setData('item_name', event.target.value)} />
                                    <FieldError message={props.errors?.item_name} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel hint="Leave blank to auto-generate.">Item code</FieldLabel>
                                    <AppInput value={form.data.item_code} onChange={(event) => form.setData('item_code', event.target.value)} />
                                    <FieldError message={props.errors?.item_code} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Category</FieldLabel>
                                    <AppSelect
                                        value={form.data.inventory_category_id}
                                        onChange={(event) => form.setData('inventory_category_id', event.target.value)}
                                    >
                                        <option value="">Select category</option>
                                        {renderOptions(props.options.categories)}
                                    </AppSelect>
                                    <FieldError message={props.errors?.inventory_category_id} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Subcategory</FieldLabel>
                                    <AppInput value={form.data.subcategory} onChange={(event) => form.setData('subcategory', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Barcode</FieldLabel>
                                    <AppInput value={form.data.barcode_value} onChange={(event) => form.setData('barcode_value', event.target.value)} />
                                    <FieldError message={props.errors?.barcode_value} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>SKU</FieldLabel>
                                    <AppInput value={form.data.sku} onChange={(event) => form.setData('sku', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Unit of measure</FieldLabel>
                                    <AppInput value={form.data.unit_of_measure} onChange={(event) => form.setData('unit_of_measure', event.target.value)} />
                                    <FieldError message={props.errors?.unit_of_measure} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Pack size</FieldLabel>
                                    <AppInput value={form.data.pack_size} onChange={(event) => form.setData('pack_size', event.target.value)} />
                                </div>
                            </AppCardContent>
                        </AppCard>

                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Stock controls</AppCardTitle>
                                <AppCardDescription>Thresholds used for replenishment, low-stock visibility, and safe stock planning.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-2">
                                    <FieldLabel>Reorder level</FieldLabel>
                                    <AppInput type="number" min="0" step="0.01" value={form.data.reorder_level} onChange={(event) => form.setData('reorder_level', event.target.value)} />
                                    <FieldError message={props.errors?.reorder_level} />
                                </div>
                                <div className="space-y-2">
                                    <FieldLabel>Minimum level</FieldLabel>
                                    <AppInput type="number" min="0" step="0.01" value={form.data.minimum_level} onChange={(event) => form.setData('minimum_level', event.target.value)} />
                                    <FieldError message={props.errors?.minimum_level} />
                                </div>
                                <div className="space-y-2">
                                    <FieldLabel>Maximum level</FieldLabel>
                                    <AppInput type="number" min="0" step="0.01" value={form.data.maximum_level} onChange={(event) => form.setData('maximum_level', event.target.value)} />
                                    <FieldError message={props.errors?.maximum_level} />
                                </div>
                                <div className="space-y-2">
                                    <FieldLabel>Preferred supplier</FieldLabel>
                                    <AppSelect value={form.data.supplier_id} onChange={(event) => form.setData('supplier_id', event.target.value)}>
                                        <option value="">Select supplier</option>
                                        {renderOptions(props.options.suppliers)}
                                    </AppSelect>
                                </div>
                            </AppCardContent>
                        </AppCard>
                    </div>

                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Storage and handling</AppCardTitle>
                                <AppCardDescription>Default store context and handling requirements that staff should see clearly.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="space-y-5 p-6">
                                <div className="space-y-2">
                                    <FieldLabel>Default store location</FieldLabel>
                                    <AppSelect value={form.data.store_location_id} onChange={(event) => form.setData('store_location_id', event.target.value)}>
                                        <option value="">Select location</option>
                                        {renderOptions(props.options.locations)}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Storage zone</FieldLabel>
                                    <AppInput value={form.data.storage_zone} onChange={(event) => form.setData('storage_zone', event.target.value)} />
                                </div>

                                <div className="grid gap-4">
                                    <ToggleField
                                        label="Temperature-sensitive"
                                        description="Use when the item requires controlled temperature handling or storage."
                                        checked={form.data.temperature_sensitive}
                                        onChange={(checked) => form.setData('temperature_sensitive', checked)}
                                    />
                                    <ToggleField
                                        label="Sterile item"
                                        description="Use when sterility must be preserved throughout storage and issue."
                                        checked={form.data.sterile_item}
                                        onChange={(checked) => form.setData('sterile_item', checked)}
                                    />
                                    <ToggleField
                                        label="High-risk item"
                                        description="Use when the item has elevated clinical or operational handling risk."
                                        checked={form.data.high_risk_item}
                                        onChange={(checked) => form.setData('high_risk_item', checked)}
                                    />
                                    <ToggleField
                                        label="Controlled-use"
                                        description="Use for items that need extra access control or tighter issue oversight."
                                        checked={form.data.controlled_use}
                                        onChange={(checked) => form.setData('controlled_use', checked)}
                                    />
                                    <ToggleField
                                        label="Active item"
                                        description="Inactive items remain in history but should not be used in fresh workflows."
                                        checked={form.data.is_active}
                                        onChange={(checked) => form.setData('is_active', checked)}
                                    />
                                </div>
                            </AppCardContent>
                        </AppCard>

                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Notes</AppCardTitle>
                                <AppCardDescription>Optional supplier, handling, or ward-specific guidance for store staff and admins.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="p-6">
                                <AppTextarea rows={7} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                            </AppCardContent>
                        </AppCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
