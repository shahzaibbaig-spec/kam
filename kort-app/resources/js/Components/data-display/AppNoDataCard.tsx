import { FileSearch, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppCard, AppCardContent } from '@/Components/data-display/AppCard';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';

export interface AppNoDataCardProps {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: LucideIcon;
}

export function AppNoDataCard({
    title,
    description,
    action,
    icon = FileSearch,
}: AppNoDataCardProps) {
    return (
        <AppCard>
            <AppCardContent className="p-6">
                <AppEmptyState title={title} description={description} action={action} icon={icon} />
            </AppCardContent>
        </AppCard>
    );
}
