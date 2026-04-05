import { Bell, CheckCircle2, ShieldAlert, TriangleAlert, type LucideIcon } from 'lucide-react';
import { type HTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

const toneMap: Record<NonNullable<AppToastProps['tone']>, { className: string; icon: LucideIcon }> = {
    info: {
        className: 'border-sky-200 bg-white text-sky-900',
        icon: Bell,
    },
    success: {
        className: 'border-emerald-200 bg-white text-emerald-900',
        icon: CheckCircle2,
    },
    warning: {
        className: 'border-amber-200 bg-white text-amber-900',
        icon: ShieldAlert,
    },
    danger: {
        className: 'border-rose-200 bg-white text-rose-900',
        icon: TriangleAlert,
    },
};

export interface AppToastProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    tone?: 'info' | 'success' | 'warning' | 'danger';
}

export function AppToast({ className, title, description, tone = 'info', ...props }: AppToastProps) {
    const { className: toneClassName, icon: Icon } = toneMap[tone];

    return (
        <div className={cn('flex w-full items-start gap-3 rounded-2xl border p-4 shadow-surface', toneClassName, className)} {...props}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
                <p className="text-sm font-semibold">{title}</p>
                {description ? <p className="text-sm opacity-80">{description}</p> : null}
            </div>
        </div>
    );
}
