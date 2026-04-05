import { Search, ShieldAlert } from 'lucide-react';

import { AppFilterBar } from '@/Components/forms/AppFilterBar';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppSelect } from '@/Components/ui/AppSelect';
import { toAppSelectOptions } from '@/Lib/forms';
import type { MaintenanceFilterOptions, MaintenanceListFilters } from '@/types/maintenance';

export interface MaintenanceFiltersBarProps {
    filters: MaintenanceListFilters;
    options: MaintenanceFilterOptions;
    onChange: <TField extends keyof MaintenanceListFilters>(field: TField, value: MaintenanceListFilters[TField]) => void;
    onSubmit: () => void;
    onReset: () => void;
}

export function MaintenanceFiltersBar({ filters, options, onChange, onSubmit, onReset }: MaintenanceFiltersBarProps) {
    return (
        <AppFilterBar className="xl:grid-cols-5">
            <div className="xl:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search</label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <AppInput
                        value={filters.search ?? ''}
                        onChange={(event) => onChange('search', event.target.value)}
                        className="pl-10"
                        placeholder="Ticket number, asset name, code, serial, or notes"
                    />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</label>
                <AppSelect
                    value={filters.status ?? ''}
                    onChange={(event) => onChange('status', event.target.value)}
                    options={toAppSelectOptions(options.statuses, { label: 'Any status', value: '' })}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Type</label>
                <AppSelect
                    value={filters.maintenance_type ?? ''}
                    onChange={(event) => onChange('maintenance_type', event.target.value)}
                    options={toAppSelectOptions(options.types, { label: 'Any type', value: '' })}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Engineer</label>
                <AppSelect
                    value={filters.engineer_id ?? ''}
                    onChange={(event) => onChange('engineer_id', event.target.value)}
                    options={toAppSelectOptions(options.users, { label: 'Any engineer', value: '' })}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Department</label>
                <AppSelect
                    value={filters.department_id ?? ''}
                    onChange={(event) => onChange('department_id', event.target.value)}
                    options={toAppSelectOptions(options.departments, { label: 'Any department', value: '' })}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Location</label>
                <AppSelect
                    value={filters.location_id ?? ''}
                    onChange={(event) => onChange('location_id', event.target.value)}
                    options={toAppSelectOptions(options.locations, { label: 'Any location', value: '' })}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Warranty Claim</label>
                <AppSelect value={filters.warranty_claim ?? ''} onChange={(event) => onChange('warranty_claim', event.target.value)}>
                    <option value="">All records</option>
                    <option value="yes">Warranty only</option>
                </AppSelect>
            </div>

            <div className="flex items-end gap-3 xl:col-span-2">
                <AppButton type="button" className="flex-1" onClick={onSubmit}>
                    Apply Filters
                </AppButton>
                <AppButton type="button" variant="outline" className="flex-1" onClick={onReset}>
                    Reset
                </AppButton>
            </div>
        </AppFilterBar>
    );
}

export interface MaintenanceScheduleFiltersBarProps {
    filters: {
        search?: string;
        status?: string;
        performed_by_id?: string;
        due_state?: string;
    };
    options: {
        statuses: Array<{ value: string; label: string }>;
        users: Array<{ id?: number; name?: string; designation?: string | null }>;
        dueStates: Array<{ value: string; label: string }>;
    };
    onChange: (field: 'search' | 'status' | 'performed_by_id' | 'due_state', value: string) => void;
    onSubmit: () => void;
    onReset: () => void;
}

export function MaintenanceScheduleFiltersBar({
    filters,
    options,
    onChange,
    onSubmit,
    onReset,
}: MaintenanceScheduleFiltersBarProps) {
    return (
        <AppFilterBar className="xl:grid-cols-5">
            <div className="xl:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search</label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <AppInput
                        value={filters.search ?? ''}
                        onChange={(event) => onChange('search', event.target.value)}
                        className="pl-10"
                        placeholder="Certificate, asset name, code, serial, or notes"
                    />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</label>
                <AppSelect
                    value={filters.status ?? ''}
                    onChange={(event) => onChange('status', event.target.value)}
                    options={toAppSelectOptions(options.statuses, { label: 'Any status', value: '' })}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assigned</label>
                <AppSelect
                    value={filters.performed_by_id ?? ''}
                    onChange={(event) => onChange('performed_by_id', event.target.value)}
                    options={toAppSelectOptions(options.users, { label: 'Any engineer', value: '' })}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Due State</label>
                <AppSelect
                    value={filters.due_state ?? ''}
                    onChange={(event) => onChange('due_state', event.target.value)}
                    options={toAppSelectOptions(options.dueStates, { label: 'All items', value: '' })}
                />
            </div>

            <div className="flex items-end gap-3 xl:col-span-5 xl:justify-end">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Keep overdue calibrations visible so biomedical teams can act quickly.</span>
                    </div>
                </div>
                <AppButton type="button" onClick={onSubmit}>
                    Apply Filters
                </AppButton>
                <AppButton type="button" variant="outline" onClick={onReset}>
                    Reset
                </AppButton>
            </div>
        </AppFilterBar>
    );
}
