import {
    Archive,
    Boxes,
    ClipboardPlus,
    PackagePlus,
    Receipt,
    ScanLine,
    ShieldCheck,
    ToolCase,
    Wrench,
    type LucideIcon,
} from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { DashboardActivityList } from '@/Components/dashboard/DashboardActivityList';
import { DashboardAlertCard } from '@/Components/dashboard/DashboardAlertCard';
import { DashboardChartCard } from '@/Components/dashboard/DashboardChartCard';
import { DashboardHeader } from '@/Components/dashboard/DashboardHeader';
import { DashboardQuickActionCard } from '@/Components/dashboard/DashboardQuickActionCard';
import { DashboardSection } from '@/Components/dashboard/DashboardSection';
import { DashboardStatCard } from '@/Components/dashboard/DashboardStatCard';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import type { DashboardPageProps } from '@/types/dashboard';

const metricIconMap: Record<string, LucideIcon> = {
    totalAssets: Archive,
    activeInventoryItems: Boxes,
    assetsUnderMaintenance: Wrench,
    lowStockItems: PackagePlus,
    pendingRequisitions: ClipboardPlus,
};

const quickActionIconMap: Record<string, LucideIcon> = {
    addAsset: Archive,
    manageInventory: Boxes,
    receiveStock: PackagePlus,
    createRequisition: ClipboardPlus,
    receiveGoods: Receipt,
    scanAsset: ScanLine,
    viewAuditLogs: ShieldCheck,
};

const alertIconMap: Record<string, LucideIcon> = {
    lowStockItems: PackagePlus,
    nearExpiryBatches: ToolCase,
    pendingRequisitions: ClipboardPlus,
    assetsUnderMaintenance: Wrench,
};

export default function DashboardIndexPage() {
    const { props } = useReactPage<DashboardPageProps>();
    const dashboard = props.dashboard ?? {
        metrics: [],
        quickActions: [],
        alerts: [],
        recentActivity: [],
        departments: [],
        roleCoverage: [],
        chartCards: [],
        permissions: {
            addAsset: false,
            manageInventory: false,
            receiveStock: false,
            createRequisition: false,
            receiveGoods: false,
            scanAsset: false,
            viewAuditLogs: false,
        },
    };

    const primaryActions = dashboard.quickActions.slice(0, 2);

    return (
        <AppLayout breadcrumbs={[{ label: 'Dashboard' }]}>
            <div className="space-y-6">
                <DashboardHeader
                    title="Operations Dashboard"
                    description="A focused overview of assets, inventory readiness, procurement attention points, and recent operational activity for hospital teams."
                    actions={
                        primaryActions.length > 0 ? (
                            <>
                                {primaryActions.map((action, index) => (
                                    <AppButton key={action.key} asChild variant={index === 0 ? 'primary' : 'outline'}>
                                        <AppLink href={action.href}>{action.label}</AppLink>
                                    </AppButton>
                                ))}
                            </>
                        ) : undefined
                    }
                />

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {dashboard.metrics.map((metric) => (
                        <DashboardStatCard
                            key={metric.key}
                            label={metric.label}
                            value={metric.value}
                            description={metric.description}
                            href={metric.href}
                            tone={metric.tone}
                            icon={metricIconMap[metric.key]}
                        />
                    ))}
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <DashboardSection
                        title="Quick actions"
                        description="Open the most common operational workflows available to your current role."
                    >
                        {dashboard.quickActions.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {dashboard.quickActions.map((action) => (
                                    <DashboardQuickActionCard
                                        key={action.key}
                                        title={action.label}
                                        description={action.description}
                                        href={action.href}
                                        icon={quickActionIconMap[action.key] ?? Archive}
                                    />
                                ))}
                            </div>
                        ) : (
                            <AppEmptyState
                                title="No quick actions available"
                                description="As role permissions expand, relevant operational shortcuts will appear here automatically."
                            />
                        )}
                    </DashboardSection>

                    <DashboardSection title="Recent activity" description="Latest audit-facing updates recorded across the system.">
                        <DashboardActivityList items={dashboard.recentActivity} />
                    </DashboardSection>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <DashboardSection
                        title="Operational attention"
                        description="Priority areas that may require follow-up from stores, procurement, or asset control staff."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            {dashboard.alerts.map((alert) => (
                                <DashboardAlertCard
                                    key={alert.key}
                                    title={alert.label}
                                    count={alert.count}
                                    description={alert.description}
                                    href={alert.href}
                                    tone={alert.tone}
                                    statusLabel={alert.statusLabel}
                                    icon={alertIconMap[alert.key]}
                                />
                            ))}
                        </div>
                    </DashboardSection>

                    <DashboardSection title="Visual summary shells" description="Reserved card containers for chart-ready dashboard metrics in later phases.">
                        <div className="grid gap-4 md:grid-cols-2">
                            {dashboard.chartCards.map((card) => (
                                <DashboardChartCard key={card.key} card={card} />
                            ))}
                        </div>
                    </DashboardSection>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <AppTableShell
                        title="Department readiness"
                        description="Coverage across seeded departments, users, and locations available for hospital operations."
                        empty={dashboard.departments.length === 0}
                        emptyTitle="No departments available"
                        emptyDescription="Once organizational records are available, this readiness table will summarize them here."
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3.5">Department</th>
                                        <th className="px-6 py-3.5">Users</th>
                                        <th className="px-6 py-3.5">Locations</th>
                                        <th className="px-6 py-3.5">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {dashboard.departments.map((department) => (
                                        <tr key={department.code} className="transition hover:bg-slate-50/80">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{department.name}</p>
                                                <p className="mt-1 text-xs text-slate-500">{department.code}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{department.usersCount}</td>
                                            <td className="px-6 py-4 text-slate-700">{department.locationsCount}</td>
                                            <td className="px-6 py-4">
                                                <AppBadge variant={department.isClinical ? 'primary' : 'neutral'}>
                                                    {department.isClinical ? 'Clinical' : 'Support'}
                                                </AppBadge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </AppTableShell>

                    <DashboardSection title="Role coverage" description="At-a-glance visibility into role distribution and permission breadth.">
                        {dashboard.roleCoverage.length > 0 ? (
                            <div className="space-y-4">
                                {dashboard.roleCoverage.map((role) => (
                                    <div key={role.name} className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold text-slate-900">{role.name}</p>
                                            <AppBadge variant="outline">{role.permissionsCount} permissions</AppBadge>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-blue-600"
                                                style={{ width: `${Math.max(8, Math.min(100, role.permissionsCount * 4))}%` }}
                                            />
                                        </div>
                                        <p className="mt-3 text-sm text-slate-600">{role.usersCount} users assigned</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <AppEmptyState
                                title="No role coverage data"
                                description="Role summaries will appear here once staff roles and permissions are available."
                            />
                        )}
                    </DashboardSection>
                </div>
            </div>
        </AppLayout>
    );
}
