import { type ReactNode } from 'react';

import { cn } from '@/Lib/utils';

export interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
    meta?: ReactNode;
    className?: string;
}

export function PageHeader({
    eyebrow = 'KORT Assest Managment System',
    title,
    description,
    actions,
    meta,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('app-surface overflow-hidden p-6', className)}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">{eyebrow}</p>
                    <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
                    {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
                    {meta ? <div className="pt-1">{meta}</div> : null}
                </div>
                {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
            </div>
        </div>
    );
}
