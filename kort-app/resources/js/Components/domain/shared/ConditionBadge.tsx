import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { formatTitleCase } from '@/Lib/utils';

const conditionVariantMap: Record<string, AppBadgeProps['variant']> = {
    excellent: 'success',
    good: 'success',
    fair: 'warning',
    damaged: 'danger',
    critical: 'danger',
    expired: 'danger',
};

export interface ConditionBadgeProps {
    value: string | null | undefined;
}

export function ConditionBadge({ value }: ConditionBadgeProps) {
    const variant = conditionVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}
