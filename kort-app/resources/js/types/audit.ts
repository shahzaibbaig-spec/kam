import type { PaginatedResponse } from '@/types';
import type { ReactSharedPageProps } from '@/types/app-shell';

export interface AuditUserOption {
    id: number;
    name: string;
}

export interface AuditLogFilters {
    [key: string]: string | undefined;
    search?: string;
    causer_id?: string;
    event?: string;
    log_name?: string;
    date_from?: string;
    date_to?: string;
}

export interface AuditLogRow {
    id: number;
    module: string | null;
    log_name: string | null;
    summary: string;
    description: string;
    action: string | null;
    event: string | null;
    causer_id?: number | null;
    causer_name: string | null;
    entity_type: string;
    subject_type: string;
    subject_id: number | null;
    entity_identifier: string;
    properties: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    changes?: Record<string, unknown> | null;
    previous?: Record<string, unknown> | null;
    created_at: string | null;
}

export interface AuditLogDetailModel extends AuditLogRow {}

export interface AuditFilterOptions {
    users: AuditUserOption[];
    events: string[];
    modules: string[];
}

export interface AuditPermissions {
    viewDetails: boolean;
}

export interface AuditLogIndexPageProps extends ReactSharedPageProps {
    filters: AuditLogFilters;
    logs: PaginatedResponse<AuditLogRow>;
    filterOptions: AuditFilterOptions;
    permissions: AuditPermissions;
}
