import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { formatTitleCase } from '@/Lib/utils';

const statusVariantMap: Record<string, AppBadgeProps['variant']> = {
    available: 'success',
    'in use': 'primary',
    in_use: 'primary',
    transferred: 'info',
    issued: 'primary',
    returned: 'success',
    under_cleaning: 'info',
    under_maintenance: 'warning',
    under_calibration: 'warning',
    out_of_order: 'danger',
    quarantined: 'danger',
    condemned: 'danger',
    disposed: 'danger',
    lost: 'danger',
};

export interface AssetStatusBadgeProps {
    value: string | null | undefined;
}

export function AssetStatusBadge({ value }: AssetStatusBadgeProps) {
    const variant = statusVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}
