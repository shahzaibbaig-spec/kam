import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { formatTitleCase } from '@/Lib/utils';

const approvalVariantMap: Record<string, AppBadgeProps['variant']> = {
    pending: 'warning',
    draft: 'neutral',
    submitted: 'info',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'danger',
    partially_received: 'warning',
    fully_received: 'success',
};

export interface ApprovalStatusBadgeProps {
    value: string | null | undefined;
}

export function ApprovalStatusBadge({ value }: ApprovalStatusBadgeProps) {
    const variant = approvalVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}
