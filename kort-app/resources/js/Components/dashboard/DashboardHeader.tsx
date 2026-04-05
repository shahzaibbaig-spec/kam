import { type ReactNode } from 'react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { PageHeader } from '@/Components/layout/PageHeader';

export interface DashboardHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function DashboardHeader({ title, description, actions }: DashboardHeaderProps) {
    return (
        <PageHeader
            eyebrow="Operational Dashboard"
            title={title}
            description={description}
            actions={actions}
            meta={
                <div className="flex flex-wrap items-center gap-2">
                    <AppBadge variant="primary">Permission aware</AppBadge>
                    <AppBadge variant="outline">Blue and white hospital admin UI</AppBadge>
                </div>
            }
        />
    );
}
