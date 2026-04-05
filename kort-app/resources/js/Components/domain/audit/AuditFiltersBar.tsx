import { Search } from 'lucide-react';

import { AppFilterBar } from '@/Components/forms/AppFilterBar';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppSelect } from '@/Components/ui/AppSelect';
import { toAppSelectOptions } from '@/Lib/forms';
import type { AuditFilterOptions, AuditLogFilters } from '@/types/audit';

export interface AuditFiltersBarProps {
    filters: AuditLogFilters;
    options: AuditFilterOptions;
    onChange: <TField extends keyof AuditLogFilters>(field: TField, value: AuditLogFilters[TField]) => void;
    onSubmit: () => void;
    onReset: () => void;
}

export function AuditFiltersBar({ filters, options, onChange, onSubmit, onReset }: AuditFiltersBarProps) {
    return (
        <AppFilterBar className="xl:grid-cols-6">
            <div className="xl:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search</label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <AppInput
                        value={filters.search ?? ''}
                        onChange={(event) => onChange('search', event.target.value)}
                        className="pl-10"
                        placeholder="Action, module, user, entity, or summary"
                    />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">User</label>
                <AppSelect
                    value={filters.causer_id ?? ''}
                    onChange={(event) => onChange('causer_id', event.target.value)}
                    options={toAppSelectOptions(options.users, { label: 'Any user', value: '' })}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Action</label>
                <AppSelect value={filters.event ?? ''} onChange={(event) => onChange('event', event.target.value)}>
                    <option value="">Any action</option>
                    {options.events.map((event) => (
                        <option key={event} value={event}>
                            {event}
                        </option>
                    ))}
                </AppSelect>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Module</label>
                <AppSelect value={filters.log_name ?? ''} onChange={(event) => onChange('log_name', event.target.value)}>
                    <option value="">Any module</option>
                    {options.modules.map((module) => (
                        <option key={module} value={module}>
                            {module}
                        </option>
                    ))}
                </AppSelect>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">From</label>
                <AppDateField value={filters.date_from ?? ''} onChange={(event) => onChange('date_from', event.target.value)} />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">To</label>
                <AppDateField value={filters.date_to ?? ''} onChange={(event) => onChange('date_to', event.target.value)} />
            </div>

            <div className="flex items-end gap-3 xl:col-span-6 xl:justify-end">
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
