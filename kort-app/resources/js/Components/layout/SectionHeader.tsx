import { type ReactNode } from 'react';

export interface SectionHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
            </div>
            {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
    );
}
