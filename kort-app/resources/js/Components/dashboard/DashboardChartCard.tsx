import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { DashboardEmptyState } from '@/Components/dashboard/DashboardEmptyState';
import type { DashboardChartCardData } from '@/types/dashboard';

export interface DashboardChartCardProps {
    card: DashboardChartCardData;
}

export function DashboardChartCard({ card }: DashboardChartCardProps) {
    return (
        <AppCard className="h-full border-slate-200/80">
            <AppCardHeader className="pb-4">
                <AppCardTitle>{card.title}</AppCardTitle>
                <AppCardDescription>{card.description}</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
                <DashboardEmptyState title={card.emptyTitle} description={card.emptyDescription} />
            </AppCardContent>
        </AppCard>
    );
}
