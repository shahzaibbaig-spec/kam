import { AppBadge } from '@/Components/data-display/AppBadge';
import { formatTitleCase } from '@/Lib/utils';

export interface ExpiryBadgeProps {
    value: string | null | undefined;
}

export function ExpiryBadge({ value }: ExpiryBadgeProps) {
    const normalized = String(value ?? '').toLowerCase();
    const variant =
        normalized === 'expired'
            ? 'danger'
            : normalized === 'expiring' || normalized === 'near_expiry' || normalized.includes('near') || normalized.includes('30')
              ? 'warning'
                : normalized === 'active'
                  ? 'success'
                  : 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}
