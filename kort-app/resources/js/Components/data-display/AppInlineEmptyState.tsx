import { type LucideIcon, MinusCircle } from 'lucide-react';

import { cn } from '@/Lib/utils';

export interface AppInlineEmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AppInlineEmptyState({
    title,
    description,
    icon: Icon = MinusCircle,
    className,
}: AppInlineEmptyStateProps) {
    return (
        <div className={cn('flex items-start gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4', className)}>
            <div className="rounded-2xl bg-white p-2 text-slate-500 ring-1 ring-slate-200">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
            </div>
        </div>
    );
}
