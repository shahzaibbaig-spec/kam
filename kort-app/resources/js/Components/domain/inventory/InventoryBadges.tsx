import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { InventoryStockBadge } from '@/Components/domain/shared/InventoryStockBadge';
import { formatTitleCase } from '@/Lib/utils';

const batchVariantMap: Record<string, AppBadgeProps['variant']> = {
    active: 'success',
    low_stock: 'warning',
    quarantined: 'danger',
    damaged: 'danger',
    expired: 'danger',
    exhausted: 'neutral',
};

export interface InventoryStatusBadgeProps {
    value: string | null | undefined;
}

export function InventoryStatusBadge({ value }: InventoryStatusBadgeProps) {
    return <InventoryStockBadge value={value} />;
}

export interface BatchStatusBadgeProps {
    value: string | null | undefined;
}

export function BatchStatusBadge({ value }: BatchStatusBadgeProps) {
    const variant = batchVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}
