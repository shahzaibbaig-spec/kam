import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AppShellUser {
    id: number;
    name: string;
    email: string;
    employee_id?: string | null;
    designation?: string | null;
    roles: string[];
    permissions: string[];
}

export interface AppNotificationItem {
    id: string;
    title: string;
    body: string;
    url?: string | null;
    created_at?: string | null;
}

export interface AppNotificationFeed {
    unread_count: number;
    items: AppNotificationItem[];
}

export interface AppNavigationItem {
    label: string;
    route: string;
    permission?: string;
    href?: string;
    icon?: LucideIcon;
    disabled?: boolean;
    badge?: string;
}

export interface AppNavigationSection {
    label: string;
    items: AppNavigationItem[];
}

export interface AppBreadcrumbItem {
    label: string;
    href?: string;
}

export interface AppQuickAction {
    label: string;
    href?: string;
    icon?: LucideIcon;
    onClick?: () => void;
}

export interface AppDropdownItem {
    label: string;
    icon?: LucideIcon;
    href?: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    onSelect?: () => void;
    disabled?: boolean;
    destructive?: boolean;
}

export interface AppPageFrameProps {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
    breadcrumbs?: AppBreadcrumbItem[];
    children: ReactNode;
}

export interface ReactSharedPageProps {
    [key: string]: unknown;
    app: {
        name: string;
        asset_tag_pattern: string;
    };
    auth: {
        user: AppShellUser | null;
    };
    navigation: AppNavigationSection[];
    flash: {
        success?: string | null;
        error?: string | null;
    };
    notifications: AppNotificationFeed;
    errors?: Record<string, string>;
}
