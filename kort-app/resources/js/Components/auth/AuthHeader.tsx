import { type ReactNode } from 'react';

import { cn } from '@/Lib/utils';

export interface AuthHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    meta?: ReactNode;
    className?: string;
}

export function AuthHeader({
    eyebrow = 'Secure Access',
    title,
    description,
    meta,
    className,
}: AuthHeaderProps) {
    return (
        <div className={cn('space-y-3', className)}>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">{eyebrow}</p>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
                {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
            </div>
            {meta ? <div className="pt-1">{meta}</div> : null}
        </div>
    );
}
