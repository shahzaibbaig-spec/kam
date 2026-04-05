import { Filter, RotateCcw } from 'lucide-react';
import { type FormEvent, type ReactNode } from 'react';

import { AppFilterBar } from '@/Components/forms/AppFilterBar';
import { AppButton } from '@/Components/ui/AppButton';
import { cn } from '@/Lib/utils';

export interface ProcurementFiltersBarProps {
    children: ReactNode;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onReset?: () => void;
    className?: string;
}

export function ProcurementFiltersBar({ children, onSubmit, onReset, className }: ProcurementFiltersBarProps) {
    return (
        <form onSubmit={onSubmit} className={cn('space-y-4 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/60', className)}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">Filters</p>
                    <p className="mt-1 text-sm text-slate-600">Refine server-side procurement records without leaving the page.</p>
                </div>
                <div className="flex items-center gap-2">
                    {onReset ? (
                        <AppButton type="button" variant="outline" size="sm" onClick={onReset}>
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </AppButton>
                    ) : null}
                    <AppButton type="submit" size="sm">
                        <Filter className="h-4 w-4" />
                        Apply Filters
                    </AppButton>
                </div>
            </div>

            <AppFilterBar className="xl:grid-cols-5">{children}</AppFilterBar>
        </form>
    );
}
