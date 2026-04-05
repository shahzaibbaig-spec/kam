import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { getNavigationIcon } from '@/Lib/navigation';
import { cn, getInitials, routeStartsWith } from '@/Lib/utils';
import type { AppNavigationSection, AppShellUser } from '@/types/app-shell';

interface SidebarPanelProps {
    productName: string;
    sections: AppNavigationSection[];
    currentRouteName?: string;
    user: AppShellUser | null;
    collapsed: boolean;
    onToggleCollapse?: () => void;
    onCloseMobile?: () => void;
    mobile?: boolean;
}

function SidebarPanel({
    productName,
    sections,
    currentRouteName,
    user,
    collapsed,
    onToggleCollapse,
    onCloseMobile,
    mobile = false,
}: SidebarPanelProps) {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-none border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:rounded-r-[2rem]">
            <div className="border-b border-sidebar-border px-4 py-5">
                <div className="flex items-center justify-between gap-3">
                    <AppLink href={route('dashboard')} className="flex min-w-0 items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-sm font-bold text-white ring-1 ring-blue-300/20">
                            {getInitials(productName)}
                        </div>
                        {!collapsed ? (
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold uppercase tracking-[0.32em] text-blue-200">Hospital Ops</p>
                                <p className="truncate text-sm font-semibold text-white">{productName}</p>
                            </div>
                        ) : null}
                    </AppLink>

                    <div className="flex items-center gap-2">
                        {onToggleCollapse && !mobile ? (
                            <AppButton variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-white/10 hover:text-white" onClick={onToggleCollapse}>
                                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </AppButton>
                        ) : null}
                        {onCloseMobile && mobile ? (
                            <AppButton variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-white/10 hover:text-white" onClick={onCloseMobile}>
                                <X className="h-4 w-4" />
                            </AppButton>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
                {sections.map((section) => (
                    <div key={section.label} className="space-y-3">
                        {!collapsed ? (
                            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-sidebar-muted">{section.label}</p>
                        ) : null}
                        <div className="space-y-1.5">
                            {section.items.map((item) => {
                                const Icon = getNavigationIcon(item.route, item.label);
                                const active = routeStartsWith(currentRouteName, item.route);

                                return (
                                    <AppLink
                                        key={item.route}
                                        href={item.href ?? route(item.route)}
                                        className={cn(
                                            'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition',
                                            active
                                                ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                                                : 'text-sidebar-foreground/85 hover:bg-white/10 hover:text-white',
                                            collapsed ? 'justify-center px-2' : '',
                                        )}
                                    >
                                        <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-blue-200' : 'text-blue-100/80')} />
                                        {!collapsed ? (
                                            <>
                                                <span className="truncate">{item.label}</span>
                                                {item.badge ? <AppBadge className="ml-auto bg-white/10 text-white ring-white/10">{item.badge}</AppBadge> : null}
                                            </>
                                        ) : null}
                                    </AppLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-sidebar-border px-4 py-5">
                <div className={cn('rounded-3xl bg-white/10 p-4 ring-1 ring-white/10', collapsed ? 'text-center' : '')}>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                        {getInitials(user?.name)}
                    </div>
                    {!collapsed ? (
                        <>
                            <p className="mt-4 truncate text-sm font-semibold text-white">{user?.name ?? 'Guest User'}</p>
                            <p className="truncate text-sm text-blue-100/80">{user?.designation ?? 'Hospital Operations'}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {user?.roles?.slice(0, 2).map((role) => (
                                    <AppBadge key={role} className="bg-blue-500/10 text-blue-100 ring-blue-300/15">
                                        {role}
                                    </AppBadge>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export interface AppSidebarProps {
    productName: string;
    sections: AppNavigationSection[];
    currentRouteName?: string;
    user: AppShellUser | null;
    collapsed: boolean;
    mobileOpen: boolean;
    onToggleCollapse: () => void;
    onMobileOpenChange: (open: boolean) => void;
}

export function AppSidebar(props: AppSidebarProps) {
    return (
        <>
            <motion.aside
                animate={{ width: props.collapsed ? 96 : 288 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="hidden shrink-0 lg:flex"
            >
                <SidebarPanel {...props} mobile={false} />
            </motion.aside>

            <AnimatePresence>
                {props.mobileOpen ? (
                    <>
                        <motion.div
                            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => props.onMobileOpenChange(false)}
                        />
                        <motion.aside
                            initial={{ x: -24, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -24, opacity: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-sm lg:hidden"
                        >
                            <SidebarPanel
                                {...props}
                                collapsed={false}
                                mobile
                                onCloseMobile={() => props.onMobileOpenChange(false)}
                            />
                        </motion.aside>
                    </>
                ) : null}
            </AnimatePresence>
        </>
    );
}
