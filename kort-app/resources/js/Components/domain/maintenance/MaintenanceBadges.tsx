import { AppBadge, type AppBadgeProps } from '@/Components/data-display/AppBadge';
import { formatTitleCase } from '@/Lib/utils';

const maintenanceStatusVariantMap: Record<string, AppBadgeProps['variant']> = {
    open: 'info',
    assigned: 'primary',
    in_progress: 'warning',
    awaiting_parts: 'warning',
    completed: 'success',
    closed: 'neutral',
    due_soon: 'warning',
    overdue: 'danger',
    upcoming: 'neutral',
    scheduled: 'info',
};

const maintenancePriorityVariantMap: Record<string, AppBadgeProps['variant']> = {
    low: 'neutral',
    normal: 'info',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
    critical: 'danger',
};

const maintenanceFitVariantMap: Record<string, AppBadgeProps['variant']> = {
    fit_for_use: 'success',
    conditional: 'warning',
    unfit_for_use: 'danger',
};

export interface MaintenanceStatusBadgeProps {
    value: string | null | undefined;
}

export function MaintenanceStatusBadge({ value }: MaintenanceStatusBadgeProps) {
    const variant = maintenanceStatusVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Unknown')}</AppBadge>;
}

export interface MaintenancePriorityBadgeProps {
    value: string | null | undefined;
}

export function MaintenancePriorityBadge({ value }: MaintenancePriorityBadgeProps) {
    const variant = maintenancePriorityVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Normal')}</AppBadge>;
}

export interface MaintenanceFitBadgeProps {
    value: string | null | undefined;
}

export function MaintenanceFitBadge({ value }: MaintenanceFitBadgeProps) {
    const variant = maintenanceFitVariantMap[String(value ?? '').toLowerCase()] ?? 'neutral';

    return <AppBadge variant={variant}>{formatTitleCase(value ?? 'Not Recorded')}</AppBadge>;
}
