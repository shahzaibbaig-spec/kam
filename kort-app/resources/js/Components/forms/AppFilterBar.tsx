import { type HTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

export function AppFilterBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'grid gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 md:grid-cols-2 xl:grid-cols-4',
                className,
            )}
            {...props}
        />
    );
}
