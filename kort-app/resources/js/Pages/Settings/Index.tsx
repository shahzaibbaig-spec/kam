import { PackageSearch } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { SettingsNavGrid, SettingsPlaceholderCard, SettingsSectionCard, SettingsSummaryBadge } from '@/Components/domain/settings/SettingsComponents';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppLayout } from '@/Layouts/AppLayout';
import type { SettingsIndexPageProps } from '@/types/settings';

export default function SettingsIndexPage() {
    const { props } = useReactPage<SettingsIndexPageProps>();
    const currentRouteName =
        typeof route === 'function' ? ((route().current() as string | undefined) ?? undefined) : undefined;

    return (
        <AppLayout breadcrumbs={[{ label: 'Settings' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="System Settings"
                    description="A role-aware hub for hospital identity, barcode defaults, notification controls, and other core operational configuration."
                />

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <SettingsSectionCard
                        title="Configuration Areas"
                        description="Open the settings areas available to your role and keep the most-used administration controls close at hand."
                    >
                        {props.settingsNavigation.length > 0 ? (
                            <SettingsNavGrid items={props.settingsNavigation} currentRouteName={currentRouteName} />
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-600">
                                No settings areas are available for this role yet.
                            </div>
                        )}
                    </SettingsSectionCard>

                    <SettingsSectionCard
                        title="Configuration Snapshot"
                        description="A quick operational summary of how much of the visible settings surface is currently configured."
                    >
                        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                            <SettingsSummaryBadge label="General" value={props.summary.generalConfigured} />
                            <SettingsSummaryBadge label="Labels" value={props.summary.labelsConfigured} />
                            <SettingsSummaryBadge label="Notifications" value={props.summary.notificationsConfigured} />
                        </div>
                    </SettingsSectionCard>
                </div>

                <SettingsSectionCard
                    title="Operational Guidance"
                    description="A simple reminder to keep settings changes deliberate and traceable."
                >
                    <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50 px-5 py-5">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-white p-3 text-blue-700 ring-1 ring-blue-100">
                                <PackageSearch className="h-5 w-5" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-slate-950">Keep configuration changes intentional</p>
                                <p className="text-sm leading-6 text-slate-700">
                                    Thresholds, label defaults, and notification behaviors shape how the wider system behaves for clinical and operations teams. Review each save carefully.
                                </p>
                            </div>
                        </div>
                    </div>
                </SettingsSectionCard>

                <SettingsPlaceholderCard />
            </div>
        </AppLayout>
    );
}
