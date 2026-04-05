import { type FormEvent } from 'react';

import { AppFilterBar } from '@/Components/forms/AppFilterBar';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { AppButton } from '@/Components/ui/AppButton';
import { AppSelect } from '@/Components/ui/AppSelect';
import type { InventoryFilterOptions, InventoryListFilters } from '@/types/inventory';

export interface InventoryFiltersBarProps {
    filters: InventoryListFilters;
    options: InventoryFilterOptions;
    onChange: <TField extends keyof InventoryListFilters>(field: TField, value: InventoryListFilters[TField]) => void;
    onSubmit: () => void;
    onReset: () => void;
}

function renderOptions(records: Array<{ id?: number; value?: string; name?: string; label?: string }>) {
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

function Toggle({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <AppButton type="button" variant={active ? 'primary' : 'outline'} size="sm" onClick={onClick}>
            {label}
        </AppButton>
    );
}

export function InventoryFiltersBar({ filters, options, onChange, onSubmit, onReset }: InventoryFiltersBarProps) {
    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={submit}>
            <AppFilterBar className="xl:grid-cols-5">
                <div className="xl:col-span-2">
                    <AppSearchInput
                        value={filters.search ?? ''}
                        onChange={(event) => onChange('search', event.target.value)}
                        placeholder="Search item, code, barcode, SKU, or batch"
                    />
                </div>

                <AppSelect value={filters.category_id ?? ''} onChange={(event) => onChange('category_id', event.target.value)}>
                    <option value="">All categories</option>
                    {renderOptions(options.categories)}
                </AppSelect>

                <AppSelect value={filters.location_id ?? ''} onChange={(event) => onChange('location_id', event.target.value)}>
                    <option value="">All store locations</option>
                    {renderOptions(options.locations)}
                </AppSelect>

                <AppSelect value={filters.supplier_id ?? ''} onChange={(event) => onChange('supplier_id', event.target.value)}>
                    <option value="">All suppliers</option>
                    {renderOptions(options.suppliers)}
                </AppSelect>

                <AppSelect value={filters.batch_status ?? ''} onChange={(event) => onChange('batch_status', event.target.value)}>
                    <option value="">Any batch state</option>
                    {renderOptions(options.batchStatuses)}
                </AppSelect>

                <AppSelect value={filters.active ?? ''} onChange={(event) => onChange('active', event.target.value)}>
                    <option value="">Active and inactive</option>
                    <option value="true">Active only</option>
                    <option value="false">Inactive only</option>
                </AppSelect>

                <AppSelect
                    value={filters.temperature_sensitive ?? ''}
                    onChange={(event) => onChange('temperature_sensitive', event.target.value)}
                >
                    <option value="">Any temperature rule</option>
                    <option value="yes">Temperature-sensitive</option>
                </AppSelect>

                <AppSelect value={filters.sterile_item ?? ''} onChange={(event) => onChange('sterile_item', event.target.value)}>
                    <option value="">Any sterility</option>
                    <option value="yes">Sterile only</option>
                </AppSelect>

                <AppSelect value={filters.high_risk_item ?? ''} onChange={(event) => onChange('high_risk_item', event.target.value)}>
                    <option value="">Any risk level</option>
                    <option value="yes">High-risk only</option>
                </AppSelect>

                <AppSelect value={filters.controlled_use ?? ''} onChange={(event) => onChange('controlled_use', event.target.value)}>
                    <option value="">Any control level</option>
                    <option value="yes">Controlled-use only</option>
                </AppSelect>

                <div className="flex flex-wrap items-center gap-2 xl:col-span-5">
                    <Toggle
                        label="Low stock"
                        active={(filters.low_stock ?? '') === 'yes'}
                        onClick={() => onChange('low_stock', (filters.low_stock ?? '') === 'yes' ? '' : 'yes')}
                    />
                    <Toggle
                        label="Near expiry"
                        active={(filters.near_expiry ?? '') === 'yes'}
                        onClick={() => onChange('near_expiry', (filters.near_expiry ?? '') === 'yes' ? '' : 'yes')}
                    />
                    <Toggle
                        label="Quarantined"
                        active={(filters.batch_status ?? '') === 'quarantined'}
                        onClick={() => onChange('batch_status', (filters.batch_status ?? '') === 'quarantined' ? '' : 'quarantined')}
                    />
                    <Toggle
                        label="Damaged"
                        active={(filters.batch_status ?? '') === 'damaged'}
                        onClick={() => onChange('batch_status', (filters.batch_status ?? '') === 'damaged' ? '' : 'damaged')}
                    />
                    <AppButton type="submit">Apply filters</AppButton>
                    <AppButton type="button" variant="outline" onClick={onReset}>
                        Reset
                    </AppButton>
                </div>
            </AppFilterBar>
        </form>
    );
}
