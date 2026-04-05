import { type FormEvent } from 'react';

import { AppFilterBar } from '@/Components/forms/AppFilterBar';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { AppButton } from '@/Components/ui/AppButton';
import { AppSelect } from '@/Components/ui/AppSelect';
import type { AssetFilterOptions, AssetListFilters } from '@/types/assets';

export interface AssetFiltersBarProps {
    filters: AssetListFilters;
    options: AssetFilterOptions;
    onChange: <TField extends keyof AssetListFilters>(field: TField, value: AssetListFilters[TField]) => void;
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

export function AssetFiltersBar({ filters, options, onChange, onSubmit, onReset }: AssetFiltersBarProps) {
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
                        placeholder="Search asset name, code, serial, barcode, or tag"
                    />
                </div>

                <AppSelect value={filters.category_id ?? ''} onChange={(event) => onChange('category_id', event.target.value)}>
                    <option value="">All categories</option>
                    {renderOptions(options.categories)}
                </AppSelect>

                <AppSelect value={filters.department_id ?? ''} onChange={(event) => onChange('department_id', event.target.value)}>
                    <option value="">All departments</option>
                    {renderOptions(options.departments)}
                </AppSelect>

                <AppSelect value={filters.location_id ?? ''} onChange={(event) => onChange('location_id', event.target.value)}>
                    <option value="">All locations</option>
                    {renderOptions(options.locations)}
                </AppSelect>

                <AppSelect value={filters.asset_status ?? ''} onChange={(event) => onChange('asset_status', event.target.value)}>
                    <option value="">All asset statuses</option>
                    {renderOptions(options.assetStatuses)}
                </AppSelect>

                <AppSelect
                    value={filters.condition_status ?? ''}
                    onChange={(event) => onChange('condition_status', event.target.value)}
                >
                    <option value="">All conditions</option>
                    {renderOptions(options.conditionStatuses)}
                </AppSelect>

                <AppSelect
                    value={filters.assigned_user_id ?? ''}
                    onChange={(event) => onChange('assigned_user_id', event.target.value)}
                >
                    <option value="">All assignees</option>
                    {renderOptions(options.users)}
                </AppSelect>

                <AppSelect value={filters.tag_generated ?? ''} onChange={(event) => onChange('tag_generated', event.target.value)}>
                    <option value="">Any tag state</option>
                    <option value="yes">Tagged</option>
                    <option value="no">No tag</option>
                </AppSelect>

                <AppSelect value={filters.warranty ?? ''} onChange={(event) => onChange('warranty', event.target.value)}>
                    <option value="">Any warranty state</option>
                    <option value="expired">Expired</option>
                    <option value="30_days">Expiring in 30 days</option>
                    <option value="90_days">Expiring in 90 days</option>
                    <option value="active">Active</option>
                </AppSelect>

                <div className="flex flex-wrap items-center gap-3 xl:col-span-5">
                    <AppButton type="submit">Apply filters</AppButton>
                    <AppButton type="button" variant="outline" onClick={onReset}>
                        Reset
                    </AppButton>
                </div>
            </AppFilterBar>
        </form>
    );
}
