import { type ReactNode } from 'react';

import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppTableSkeleton } from '@/Components/data-display/AppTableSkeleton';

export interface AppTableShellProps {
    title?: string;
    description?: string;
    toolbar?: ReactNode;
    footer?: ReactNode;
    loading?: boolean;
    empty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    children: ReactNode;
}

export function AppTableShell({
    title,
    description,
    toolbar,
    footer,
    loading = false,
    empty = false,
    emptyTitle = 'No records found',
    emptyDescription = 'Adjust the filters or create a new record to populate this view.',
    children,
}: AppTableShellProps) {
    return (
        <AppCard>
            {title || description || toolbar ? (
                <AppCardHeader className="gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        {title ? <AppCardTitle>{title}</AppCardTitle> : null}
                        {description ? <AppCardDescription>{description}</AppCardDescription> : null}
                    </div>
                    {toolbar ? <div className="w-full max-w-3xl lg:w-auto">{toolbar}</div> : null}
                </AppCardHeader>
            ) : null}

            <AppCardContent className="p-0">
                {loading ? (
                    <AppTableSkeleton />
                ) : empty ? (
                    <div className="p-6">
                        <AppEmptyState title={emptyTitle} description={emptyDescription} />
                    </div>
                ) : (
                    children
                )}
            </AppCardContent>

            {footer ? <div className="border-t border-slate-100 px-6 py-4">{footer}</div> : null}
        </AppCard>
    );
}
