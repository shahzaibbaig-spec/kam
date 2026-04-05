import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { formatTitleCase } from '@/Lib/utils';

const stockVariantMap: Record<string, AppBadgeProps['variant']> = {
    normal: 'success',
    healthy: 'success',
    in_stock: 'success',
    low: 'warning',
    low_stock: 'warning',
    reserved: 'info',
    issued: 'primary',
    out: 'danger',
    out_of_stock: 'danger',
    quarantined: 'danger',
    damaged: 'danger',
    expired: 'danger',
    exhausted: 'danger',
    active: 'success',
    inactive: 'neutral',
    near_expiry: 'warning',
};

export interface InventoryStockBadgeProps {
    value: string | null | undefined;
}

export function InventoryStockBadge({ value }: InventoryStockBadgeProps) {
    const variant = stockVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}
