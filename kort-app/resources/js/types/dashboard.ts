import type { ReactSharedPageProps } from '@/types/app-shell';

export interface DashboardMetric {
    key: string;
    label: string;
    value: number | string;
    description?: string;
    href?: string | null;
    tone?: 'primary' | 'success' | 'warning' | 'info';
}

export interface DashboardQuickActionItem {
    key: string;
    label: string;
    description?: string;
    href: string;
    permission: string;
    enabled: boolean;
}

export interface DashboardAlertItem {
    key: string;
    label: string;
    count: number;
    description: string;
    href?: string | null;
    tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    statusLabel?: string;
}

export interface DashboardActivityItem {
    description: string;
    event: string | null;
    causerName: string;
    createdAt: string | null;
}

export interface DashboardDepartmentSummary {
    name: string;
    code: string;
    usersCount: number;
    locationsCount: number;
    isClinical: boolean;
}

export interface DashboardRoleCoverage {
    name: string;
    usersCount: number;
    permissionsCount: number;
}

export interface DashboardChartCardData {
    key: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
}

export interface DashboardPermissionFlags {
    addAsset: boolean;
    manageInventory: boolean;
    receiveStock: boolean;
    createRequisition: boolean;
    receiveGoods: boolean;
    scanAsset: boolean;
    viewAuditLogs: boolean;
}

export interface DashboardPayload {
    metrics: DashboardMetric[];
    quickActions: DashboardQuickActionItem[];
    alerts: DashboardAlertItem[];
    recentActivity: DashboardActivityItem[];
    departments: DashboardDepartmentSummary[];
    roleCoverage: DashboardRoleCoverage[];
    chartCards: DashboardChartCardData[];
    permissions: DashboardPermissionFlags;
}

export interface DashboardPageProps extends ReactSharedPageProps {
    dashboard: DashboardPayload;
}
