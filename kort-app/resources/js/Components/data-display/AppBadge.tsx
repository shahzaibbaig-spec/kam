import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

const appBadgeVariants = cva(
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-colors',
    {
        variants: {
            variant: {
                primary: 'bg-primary-soft text-blue-700 ring-blue-200',
                success: 'bg-success-soft text-emerald-700 ring-emerald-200',
                warning: 'bg-warning-soft text-amber-800 ring-amber-200',
                danger: 'bg-danger-soft text-rose-700 ring-rose-200',
                info: 'bg-info-soft text-sky-700 ring-sky-200',
                neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
                outline: 'bg-white text-slate-700 ring-slate-300',
            },
        },
        defaultVariants: {
            variant: 'neutral',
        },
    },
);

export interface AppBadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof appBadgeVariants> {}

export function AppBadge({ className, variant, ...props }: AppBadgeProps) {
    return <span className={cn(appBadgeVariants({ variant }), className)} {...props} />;
}

export { appBadgeVariants };
