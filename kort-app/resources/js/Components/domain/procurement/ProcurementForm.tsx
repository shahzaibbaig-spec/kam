import { type ReactNode } from 'react';

import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { cn } from '@/Lib/utils';

export interface ProcurementFormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function ProcurementFormSection({
    title,
    description,
    children,
    className,
}: ProcurementFormSectionProps) {
    return (
        <AppCard className={className}>
            <AppCardHeader>
                <AppCardTitle>{title}</AppCardTitle>
                {description ? <AppCardDescription>{description}</AppCardDescription> : null}
            </AppCardHeader>
            <AppCardContent>{children}</AppCardContent>
        </AppCard>
    );
}

export interface ProcurementFormFieldProps {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}

export function ProcurementFormField({
    label,
    error,
    hint,
    required = false,
    children,
    className,
}: ProcurementFormFieldProps) {
    return (
        <label className={cn('space-y-2 text-sm text-slate-700', className)}>
            <span className="font-medium text-slate-800">
                {label}
                {required ? <span className="ml-1 text-rose-600">*</span> : null}
            </span>
            {children}
            {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </label>
    );
}

export function ProcurementFormError({ message }: { message?: string }) {
    return message ? <p className="text-sm text-rose-600">{message}</p> : null;
}
