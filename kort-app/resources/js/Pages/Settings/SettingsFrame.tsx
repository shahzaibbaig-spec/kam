import { type ReactNode } from 'react';

import { SettingsSidebarNav } from '@/Components/domain/settings/SettingsComponents';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppLayout } from '@/Layouts/AppLayout';
import type { SettingsNavigationItem } from '@/types/settings';

export interface SettingsFrameProps {
    title: string;
    description: string;
    navigation: SettingsNavigationItem[];
    actions?: ReactNode;
    children: ReactNode;
}

export function SettingsFrame({ title, description, navigation, actions, children }: SettingsFrameProps) {
    const currentRouteName =
        typeof route === 'function' ? ((route().current() as string | undefined) ?? undefined) : undefined;

    return (
        <AppLayout breadcrumbs={[{ label: 'Settings', href: route('settings.index') }, { label: title }]}>
            <div className="space-y-6">
                <PageHeader title={title} description={description} actions={actions} />

                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <SettingsSidebarNav items={navigation} currentRouteName={currentRouteName} />
                    </div>
                    <div className="space-y-6">{children}</div>
                </div>
            </div>
        </AppLayout>
    );
}
