export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    employee_id?: string | null;
    designation?: string | null;
    roles: string[];
    permissions: string[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
}

export interface NavigationItem {
    label: string;
    route: string;
    permission: string;
}

export interface NavigationSection {
    label: string;
    items: NavigationItem[];
}

export interface FlashBag {
    success?: string | null;
    error?: string | null;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    app: {
        name: string;
        asset_tag_pattern: string;
    };
    auth: {
        user: User | null;
    };
    navigation: NavigationSection[];
    flash: FlashBag;
};
