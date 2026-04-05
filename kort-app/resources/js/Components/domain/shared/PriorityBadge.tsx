import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { formatTitleCase } from '@/Lib/utils';

const priorityVariantMap: Record<string, AppBadgeProps['variant']> = {
    routine: 'neutral',
    low: 'neutral',
    normal: 'info',
    high: 'warning',
    urgent: 'danger',
    critical: 'danger',
};

export interface PriorityBadgeProps {
    value: string | null | undefined;
}

export function PriorityBadge({ value }: PriorityBadgeProps) {
    const variant = priorityVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}
