import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

export interface AppSelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options?: AppSelectOption[];
}

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
    ({ className, children, options, ...props }, ref) => (
        <div className="relative">
            <select
                ref={ref}
                className={cn(
                    'app-focus-ring flex h-11 w-full appearance-none rounded-2xl border border-input bg-white px-4 py-2 pr-10 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100',
                    className,
                )}
                {...props}
            >
                {options?.map((option) => (
                    <option key={`${option.value}`} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
    ),
);

AppSelect.displayName = 'AppSelect';
