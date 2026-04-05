import { BarChart3, type LucideIcon } from 'lucide-react';

import { AppEmptyState } from '@/Components/data-display/AppEmptyState';

export interface DashboardEmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
}

export function DashboardEmptyState({ title, description, icon = BarChart3 }: DashboardEmptyStateProps) {
    return <AppEmptyState title={title} description={description} icon={icon} className="border-slate-200 bg-slate-50/60 py-8" />;
}
