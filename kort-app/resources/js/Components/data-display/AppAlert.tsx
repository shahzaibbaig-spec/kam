import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, ShieldAlert, type LucideIcon } from 'lucide-react';
import { type HTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

const appAlertVariants = cva('flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm', {
    variants: {
        variant: {
            info: 'border-sky-200 bg-sky-50 text-sky-800',
            success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
            warning: 'border-amber-200 bg-amber-50 text-amber-900',
            danger: 'border-rose-200 bg-rose-50 text-rose-800',
        },
    },
    defaultVariants: {
        variant: 'info',
    },
});

const defaultIcons: Record<NonNullable<AppAlertProps['variant']>, LucideIcon> = {
    info: Info,
    success: CheckCircle2,
    warning: ShieldAlert,
    danger: AlertCircle,
};

export interface AppAlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof appAlertVariants> {
    title?: string;
    description?: string;
    icon?: LucideIcon;
}

export function AppAlert({ className, variant = 'info', title, description, icon: Icon, children, ...props }: AppAlertProps) {
    const resolvedVariant = variant ?? 'info';
    const DisplayIcon = Icon ?? defaultIcons[resolvedVariant];

    return (
        <div className={cn(appAlertVariants({ variant: resolvedVariant }), className)} {...props}>
            <DisplayIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
                {title ? <p className="font-semibold">{title}</p> : null}
                {description ? <p className="text-sm leading-6 opacity-90">{description}</p> : null}
                {children}
            </div>
        </div>
    );
}
