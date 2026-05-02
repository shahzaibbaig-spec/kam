import { Bell, LayoutDashboard, Menu, Search, Settings, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDropdown } from '@/Components/ui/AppDropdown';
import { AppLink } from '@/Components/ui/AppLink';
import { getInitials } from '@/Lib/utils';
import type { AppDropdownItem, AppNotificationItem, AppShellUser, ReactSharedPageProps } from '@/types/app-shell';

export interface AppTopbarProps {
    user: AppShellUser | null;
    onOpenSidebar: () => void;
    onToggleSidebarCollapsed: () => void;
    sidebarCollapsed: boolean;
}

export function AppTopbar({ user, onOpenSidebar, onToggleSidebarCollapsed, sidebarCollapsed }: AppTopbarProps) {
    const page = useReactPage<ReactSharedPageProps>();
    const canViewSettings = Array.isArray(user?.permissions) && user.permissions.includes('settings.view');
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [results, setResults] = useState<Record<string, Array<{ id: number | string; title: string; subtitle: string; url: string }>>>({
        patients: [],
        medicines: [],
        assets: [],
        people: [],
        vendors: [],
        users: [],
    });
    const searchContainerRef = useRef<HTMLDivElement | null>(null);
    const notificationFeed = page.props.notifications ?? { unread_count: 0, items: [] };
    const notificationItems = useMemo<AppDropdownItem[]>(() => {
        const items = (notificationFeed.items ?? []).slice(0, 6).map((notification: AppNotificationItem) => ({
            label: notification.title,
            href: notification.url
                ? `${notification.url}${notification.url.includes('?') ? '&' : '?'}notification=${notification.id}`
                : route('patients.queue', { notification: notification.id }),
        }));

        if (items.length === 0) {
            return [{ label: 'No new notifications', disabled: true }];
        }

        return items;
    }, [notificationFeed.items]);

    const groupedResults = useMemo(
        () => [
            { key: 'patients', label: 'Patients', items: results.patients ?? [] },
            { key: 'medicines', label: 'Medicines', items: results.medicines ?? [] },
            { key: 'assets', label: 'Assets', items: results.assets ?? [] },
            { key: 'people', label: 'People', items: results.people ?? [] },
            { key: 'vendors', label: 'Vendors', items: results.vendors ?? [] },
            { key: 'users', label: 'Users', items: results.users ?? [] },
        ],
        [results],
    );

    useEffect(() => {
        const normalized = query.trim();

        if (normalized.length < 2) {
            setResults({
                patients: [],
                medicines: [],
                assets: [],
                people: [],
                vendors: [],
                users: [],
            });
            setIsSearching(false);
            return;
        }

        const timeout = window.setTimeout(async () => {
            try {
                setIsSearching(true);
                const response = await window.axios.get(route('search.universal'), {
                    params: {
                        q: normalized,
                        limit: 6,
                    },
                });

                setResults(response.data?.results ?? {});
                setSearchOpen(true);
            } catch {
                setResults({
                    patients: [],
                    medicines: [],
                    assets: [],
                    people: [],
                    vendors: [],
                    users: [],
                });
            } finally {
                setIsSearching(false);
            }
        }, 220);

        return () => window.clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!searchContainerRef.current?.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        };

        window.addEventListener('mousedown', handleClickOutside);

        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasSearchResults = groupedResults.some((group) => group.items.length > 0);

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
                    <div ref={searchContainerRef} className="relative min-w-[220px] max-w-md flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setSearchOpen(true);
                            }}
                            onFocus={() => setSearchOpen(true)}
                            placeholder="Global search: patient number, CNIC, medicines, assets, records"
                            className="app-focus-ring h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400"
                        />
                        {searchOpen && query.trim().length >= 2 ? (
                            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-surface">
                                {isSearching ? <p className="px-3 py-2 text-sm text-slate-500">Searching...</p> : null}

                                {!isSearching && !hasSearchResults ? (
                                    <p className="px-3 py-2 text-sm text-slate-500">No matching records found.</p>
                                ) : null}

                                {!isSearching
                                    ? groupedResults.map((group) =>
                                          group.items.length > 0 ? (
                                              <div key={group.key} className="mb-2">
                                                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{group.label}</p>
                                                  <div className="space-y-1">
                                                      {group.items.map((item) => (
                                                          <AppLink
                                                              key={`${group.key}-${item.id}`}
                                                              href={item.url}
                                                              className="block rounded-xl px-3 py-2 transition hover:bg-slate-50"
                                                              onClick={() => setSearchOpen(false)}
                                                          >
                                                              <p className="text-sm font-medium text-slate-900">{item.title}</p>
                                                              <p className="text-xs text-slate-500">{item.subtitle}</p>
                                                          </AppLink>
                                                      ))}
                                                  </div>
                                              </div>
                                          ) : null,
                                      )
                                    : null}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-2">
                        <AppDropdown
                            align="end"
                            contentClassName="w-[22rem]"
                            items={notificationItems}
                            trigger={
                                <button
                                    type="button"
                                    className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 lg:flex lg:items-center lg:gap-2"
                                >
                                    <Bell className="h-4 w-4 text-blue-600" />
                                    <span>Notifications</span>
                                    <AppBadge variant="primary">{notificationFeed.unread_count ?? 0}</AppBadge>
                                </button>
                            }
                        />
                        <AppDropdown
                            align="end"
                            items={notificationItems}
                            trigger={
                                <AppButton variant="outline" size="icon" className="lg:hidden">
                                    <Bell className="h-4 w-4" />
                                </AppButton>
                            }
                        />
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
