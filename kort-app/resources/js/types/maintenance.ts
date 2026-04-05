import type { PaginatedResponse } from '@/types';
import type { ReactSharedPageProps } from '@/types/app-shell';

export interface MaintenanceOptionRecord {
    id?: number;
    name?: string;
    code?: string | null;
    label?: string;
    value?: string;
    designation?: string | null;
    serial_number?: string | null;
    department_name?: string | null;
    location_name?: string | null;
}

export interface MaintenanceAssetSummary {
    id: number;
    asset_name: string | null;
    asset_code: string | null;
    serial_number: string | null;
    tag_number?: string | null;
    brand?: string | null;
    model?: string | null;
    department_name?: string | null;
    location_name?: string | null;
    room_or_area?: string | null;
    assigned_user_name?: string | null;
    supplier_name?: string | null;
    status?: string | null;
    condition_status?: string | null;
    last_issued_at?: string | null;
    last_returned_at?: string | null;
}

export interface MaintenanceHistoryEntry {
    id: number;
    ticket_number: string | null;
    status: string | null;
    maintenance_type: string | null;
    completed_at: string | null;
    created_at: string | null;
    engineer_name: string | null;
}

export interface CalibrationSummary {
    id: number;
    status: string | null;
    due_at: string | null;
    performed_at: string | null;
    certificate_number: string | null;
}

export interface MaintenanceListFilters {
    [key: string]: string | undefined;
    search?: string;
    status?: string;
    maintenance_type?: string;
    engineer_id?: string;
    department_id?: string;
    location_id?: string;
    warranty_claim?: string;
}

export interface CalibrationScheduleFilters {
    [key: string]: string | undefined;
    search?: string;
    status?: string;
    performed_by_id?: string;
    due_state?: string;
}

export interface MaintenanceListRow {
    id: number;
    asset_id: number;
    ticket_number: string;
    maintenance_type: string | null;
    status: string | null;
    fault_report: string | null;
    started_at: string | null;
    completed_at: string | null;
    downtime_minutes: number | null;
    cost: string | number | null;
    spare_parts_used: string[];
    resolution_notes: string | null;
    fit_status: string | null;
    warranty_claim: boolean;
    reported_by_id?: number | null;
    reported_by_name: string | null;
    engineer_id?: number | null;
    engineer_name: string | null;
    supplier_id?: number | null;
    supplier_name: string | null;
    created_at: string | null;
    updated_at: string | null;
    asset_name: string | null;
    asset_code: string | null;
    asset_serial_number: string | null;
    department_name: string | null;
    location_name: string | null;
}

export interface MaintenanceDetailModel extends MaintenanceListRow {
    asset?: MaintenanceAssetSummary | null;
    recent_history?: MaintenanceHistoryEntry[];
    next_calibration?: CalibrationSummary | null;
}

export interface CalibrationScheduleRow {
    id: number;
    asset_id: number;
    asset_name: string | null;
    asset_code: string | null;
    serial_number: string | null;
    department_name: string | null;
    location_name: string | null;
    performed_by_id?: number | null;
    performed_by_name: string | null;
    supplier_id?: number | null;
    supplier_name: string | null;
    certificate_number: string | null;
    performed_at: string | null;
    due_at: string | null;
    status: string | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface MaintenanceFormData {
    [key: string]: string | boolean | string[];
    asset_id: string;
    reported_by_id: string;
    engineer_id: string;
    supplier_id: string;
    ticket_number: string;
    maintenance_type: string;
    status: string;
    fault_report: string;
    started_at: string;
    completed_at: string;
    downtime_minutes: string;
    cost: string;
    spare_parts_used: string[];
    resolution_notes: string;
    fit_status: string;
    warranty_claim: boolean;
}

export interface MaintenanceStatusUpdateData {
    [key: string]: string;
    status: string;
    engineer_id: string;
    started_at: string;
    completed_at: string;
    resolution_notes: string;
    fit_status: string;
}

export interface MaintenanceFilterOptions {
    assets: MaintenanceOptionRecord[];
    users: MaintenanceOptionRecord[];
    suppliers: MaintenanceOptionRecord[];
    departments: MaintenanceOptionRecord[];
    locations: MaintenanceOptionRecord[];
    types: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    fitStatuses: Array<{ value: string; label: string }>;
}

export interface MaintenanceScheduleFilterOptions {
    statuses: Array<{ value: string; label: string }>;
    users: MaintenanceOptionRecord[];
    dueStates: Array<{ value: string; label: string }>;
}

export interface MaintenanceListPermissions {
    create: boolean;
    manage: boolean;
    viewSchedule: boolean;
}

export interface MaintenanceDetailPermissions {
    edit: boolean;
    changeStatus: boolean;
    close: boolean;
    viewAsset: boolean;
    fitCertify: boolean;
}

export interface MaintenanceSchedulePermissions {
    viewTickets: boolean;
    manageCalibrations: boolean;
}

export interface MaintenanceIndexPageProps extends ReactSharedPageProps {
    filters: MaintenanceListFilters;
    tickets: PaginatedResponse<MaintenanceListRow>;
    filterOptions: MaintenanceFilterOptions;
    permissions: MaintenanceListPermissions;
}

export interface MaintenanceFormPageProps extends ReactSharedPageProps {
    ticket: MaintenanceDetailModel | null;
    selectedAsset: MaintenanceAssetSummary | null;
    options: MaintenanceFilterOptions;
}

export interface MaintenanceShowPageProps extends ReactSharedPageProps {
    ticket: MaintenanceDetailModel;
    permissions: MaintenanceDetailPermissions;
    statusOptions: Array<{ value: string; label: string }>;
    fitStatusOptions: Array<{ value: string; label: string }>;
    engineerOptions: MaintenanceOptionRecord[];
}

export interface MaintenanceSchedulePageProps extends ReactSharedPageProps {
    filters: CalibrationScheduleFilters;
    calibrations: PaginatedResponse<CalibrationScheduleRow>;
    filterOptions: MaintenanceScheduleFilterOptions;
    permissions: MaintenanceSchedulePermissions;
    dueSoonDays: number;
}
