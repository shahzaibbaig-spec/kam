import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { formatTitleCase } from '@/Lib/utils';

const requisitionStatusVariantMap: Record<string, AppBadgeProps['variant']> = {
    draft: 'neutral',
    submitted: 'info',
    under_review: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'danger',
    partially_ordered: 'warning',
    fully_ordered: 'success',
};

const purchaseOrderStatusVariantMap: Record<string, AppBadgeProps['variant']> = {
    draft: 'neutral',
    issued: 'primary',
    partially_received: 'warning',
    fully_received: 'success',
    cancelled: 'danger',
    closed: 'neutral',
};

const goodsReceiptStatusVariantMap: Record<string, AppBadgeProps['variant']> = {
    draft: 'neutral',
    received: 'primary',
    partially_processed: 'warning',
    completed: 'success',
    flagged: 'danger',
};

function StatusBadge({
    value,
    variantMap,
}: {
    value: string | null | undefined;
    variantMap: Record<string, AppBadgeProps['variant']>;
}) {
    const normalizedValue = String(value ?? '').toLowerCase();
    const variant = variantMap[normalizedValue] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}

export interface RequisitionStatusBadgeProps {
    value: string | null | undefined;
}

export function RequisitionStatusBadge({ value }: RequisitionStatusBadgeProps) {
    return <StatusBadge value={value} variantMap={requisitionStatusVariantMap} />;
}

export interface PurchaseOrderStatusBadgeProps {
    value: string | null | undefined;
}

export function PurchaseOrderStatusBadge({ value }: PurchaseOrderStatusBadgeProps) {
    return <StatusBadge value={value} variantMap={purchaseOrderStatusVariantMap} />;
}

export interface GoodsReceiptStatusBadgeProps {
    value: string | null | undefined;
}

export function GoodsReceiptStatusBadge({ value }: GoodsReceiptStatusBadgeProps) {
    return <StatusBadge value={value} variantMap={goodsReceiptStatusVariantMap} />;
}

export interface SupplierActiveBadgeProps {
    active: boolean;
}

export function SupplierActiveBadge({ active }: SupplierActiveBadgeProps) {
    return <AppBadge variant={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</AppBadge>;
}

export interface DiscrepancyBadgeProps {
    flagged: boolean;
}

export function DiscrepancyBadge({ flagged }: DiscrepancyBadgeProps) {
    return <AppBadge variant={flagged ? 'danger' : 'success'}>{flagged ? 'Flagged' : 'Clear'}</AppBadge>;
}
