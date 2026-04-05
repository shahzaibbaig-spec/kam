import { Bell, LayoutDashboard, Menu, Search, Settings, User } from 'lucide-react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDropdown } from '@/Components/ui/AppDropdown';
import { getInitials } from '@/Lib/utils';
import type { AppShellUser } from '@/types/app-shell';

export interface AppTopbarProps {
    user: AppShellUser | null;
    onOpenSidebar: () => void;
    onToggleSidebarCollapsed: () => void;
    sidebarCollapsed: boolean;
}

export function AppTopbar({ user, onOpenSidebar, onToggleSidebarCollapsed, sidebarCollapsed }: AppTopbarProps) {
    const canViewSettings = Array.isArray(user?.permissions) && user.permissions.includes('settings.view');

    return (
        <div className="app-surface sticky top-4 z-30 mx-4 mb-5 mt-4 border border-white/90 px-4 py-3 lg:mx-6 lg:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <AppButton variant="outline" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
                        <Menu className="h-4 w-4" />
                    </AppButton>
                    <AppButton variant="outline" size="icon" className="hidden lg:inline-flex" onClick={onToggleSidebarCollapsed}>
                        {sidebarCollapsed ? <LayoutDashboard className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </AppButton>
                    <div className="relative hidden min-w-[280px] max-w-md flex-1 lg:block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            readOnly
                            value=""
                            placeholder="Search assets, stock, suppliers, or records"
                            className="app-focus-ring h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-2">
                        <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 lg:flex lg:items-center lg:gap-2">
                            <Bell className="h-4 w-4 text-blue-600" />
                            <span>Notifications</span>
                            <AppBadge variant="primary">Soon</AppBadge>
                        </div>
                        <AppButton variant="outline" size="icon" className="lg:hidden">
                            <Bell className="h-4 w-4" />
                        </AppButton>
                    </div>

                    <AppDropdown
                        items={[
                            {
                                label: 'Profile',
                                href: route('profile.edit'),
                                icon: User,
                            },
                            {
                                label: 'Settings',
                                href: canViewSettings ? route('settings.index') : undefined,
                                icon: Settings,
                                disabled: !canViewSettings,
                            },
                            {
                                label: 'separator',
                            },
                            {
                                label: 'Log out',
                                href: route('logout'),
                                method: 'post',
                                destructive: true,
                            },
                        ]}
                        trigger={
                            <button
                                type="button"
                                className="app-focus-ring flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:bg-slate-50"
                            >
                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-sm font-semibold text-blue-700">
                                    {getInitials(user?.name)}
                                </div>
                                <div className="hidden min-w-0 sm:block">
                                    <p className="truncate text-sm font-semibold text-slate-900">{user?.name ?? 'Guest User'}</p>
                                    <p className="truncate text-xs text-slate-500">{user?.designation ?? 'Hospital Operations'}</p>
                                </div>
                            </button>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
