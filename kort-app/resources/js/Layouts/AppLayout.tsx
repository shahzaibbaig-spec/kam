import { type ReactNode } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppBreadcrumbs } from '@/Components/layout/AppBreadcrumbs';
import { AppSidebar } from '@/Components/layout/AppSidebar';
import { AppTopbar } from '@/Components/layout/AppTopbar';
import { PageContainer } from '@/Components/layout/PageContainer';
import { useAppShell } from '@/Hooks/useAppShell';
import type { AppBreadcrumbItem, ReactSharedPageProps } from '@/types/app-shell';

export interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: AppBreadcrumbItem[];
}

export function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    const page = useReactPage<ReactSharedPageProps>();
    const shell = useAppShell();
    const appName = page.props.app?.name ?? 'KORT Assest Managment System';
    const navigation = Array.isArray(page.props.navigation) ? page.props.navigation : [];
    const user = page.props.auth?.user ?? null;
    const flash = page.props.flash ?? {};
    const currentRouteName =
        typeof route === 'function' ? ((route().current() as string | undefined) ?? undefined) : undefined;

    return (
        <div className="min-h-screen bg-app-glow">
            <div className="mx-auto flex min-h-screen max-w-[1680px]">
                <AppSidebar
                    productName={appName}
                    sections={navigation}
                    currentRouteName={currentRouteName}
                    user={user}
                    collapsed={shell.sidebarCollapsed}
                    mobileOpen={shell.mobileNavOpen}
                    onToggleCollapse={shell.toggleSidebarCollapsed}
                    onMobileOpenChange={shell.setMobileNavOpen}
                />

                <div className="flex min-h-screen flex-1 flex-col">
                    <AppTopbar
                        user={user}
                        onOpenSidebar={shell.toggleMobileNav}
                        onToggleSidebarCollapsed={shell.toggleSidebarCollapsed}
                        sidebarCollapsed={shell.sidebarCollapsed}
                    />

                    <div className="flex-1 px-4 pb-6 lg:px-6">
                        <div className="space-y-4">
                            <AppBreadcrumbs items={breadcrumbs} />

                            {flash.success ? (
                                <AppAlert variant="success" title="Success" description={flash.success} />
                            ) : null}

                            {flash.error ? (
                                <AppAlert variant="danger" title="Attention Needed" description={flash.error} />
                            ) : null}

                            <PageContainer>{children}</PageContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
