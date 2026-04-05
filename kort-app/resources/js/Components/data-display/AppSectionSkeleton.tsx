import { AppCard, AppCardContent, AppCardHeader } from '@/Components/data-display/AppCard';
import { AppSkeleton } from '@/Components/data-display/AppSkeleton';

export interface AppSectionSkeletonProps {
    lines?: number;
}

export function AppSectionSkeleton({ lines = 4 }: AppSectionSkeletonProps) {
    return (
        <AppCard>
            <AppCardHeader className="space-y-3">
                <AppSkeleton className="h-6 w-48" />
                <AppSkeleton className="h-4 w-72" />
            </AppCardHeader>
            <AppCardContent className="space-y-3">
                {Array.from({ length: lines }).map((_, index) => (
                    <AppSkeleton key={index} className="h-10 w-full" />
                ))}
            </AppCardContent>
        </AppCard>
    );
}
