import { type HTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

export function AppSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('animate-pulse rounded-2xl bg-slate-200/80', className)} {...props} />;
}
