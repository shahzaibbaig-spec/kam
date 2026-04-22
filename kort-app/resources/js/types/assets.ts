import type { PaginatedResponse } from '@/types';
import type { ReactSharedPageProps } from '@/types/app-shell';

export interface AssetOptionRecord {
    id?: number;
    name?: string;
    code?: string | null;
    value?: string;
    label?: string;
    department_id?: number | null;
    designation?: string | null;
    default_location_id?: number | null;
}

export interface AssetFilterOptions {
    categories: AssetOptionRecord[];
    departments: AssetOptionRecord[];
    locations: AssetOptionRecord[];
    users: AssetOptionRecord[];
    suppliers?: AssetOptionRecord[];
    assetStatuses: AssetOptionRecord[];
    conditionStatuses: AssetOptionRecord[];
    assignmentTypes?: AssetOptionRecord[];
}

export interface AssetListFilters {
    [key: string]: string | undefined;
    search?: string;
    category_id?: string;
    department_id?: string;
    location_id?: string;
    asset_status?: string;
    condition_status?: string;
    assigned_user_id?: string;
    warranty?: string;
    tag_generated?: string;
}

export interface AssetTagRecord {
    id: number;
    tag_number: string | null;
    tag_format: string | null;
    barcode_value: string | null;
    qr_value: string | null;
    printed_count: number;
    last_printed_at: string | null;
    is_active: boolean;
    created_at: string | null;
}

export interface AssetAssignmentRecord {
    id: number;
    assignment_type: string;
    department_id?: number | null;
    department_name: string | null;
    location_id?: number | null;
    location_name: string | null;
    assigned_user_id?: number | null;
    assigned_user_name: string | null;
    room_or_area: string | null;
    custodian_name: string | null;
    issued_by_name: string | null;
    received_by_name: string | null;
    assigned_at: string | null;
    expected_return_at: string | null;
    returned_at: string | null;
    status: string;
    remarks: string | null;
}

export interface AssetMovementRecord {
    id: number;
    movement_type: string;
    from_department: string | null;
    to_department: string | null;
    from_location: string | null;
    to_location: string | null;
    from_user: string | null;
    to_user: string | null;
    from_room_or_area: string | null;
    to_room_or_area: string | null;
    movement_datetime: string | null;
    performed_by: string | null;
    reference_type?: string | null;
    reference_id?: number | null;
    notes: string | null;
}

export interface AssetStatusHistoryRecord {
    id: number;
    old_status: string | null;
    new_status: string;
    old_condition: string | null;
    new_condition: string | null;
    changed_by: string | null;
    changed_at: string | null;
    reason: string | null;
}

export interface AssetLabelPreview {
    asset_id?: number;
    asset_tag_id?: number | null;
    asset_name: string;
    asset_name_full?: string | null;
    tag_number: string | null;
    barcode_value?: string | null;
    qr_value?: string | null;
    department_name: string | null;
    location_name: string | null;
    barcode_svg: string | null;
    qr_svg: string | null;
    tspl?: string;
}

export interface PrinterSettingsRecord {
    model: string;
    dpi: number;
    language: string;
    label_width_mm: number;
    label_height_mm: number;
    gap_mm: number;
    direction: number;
    asset_name_max_chars: number;
    qr_cell_size: number;
    barcode_height: number;
    text_x: number;
    asset_name_y: number;
    tag_number_y: number;
    qr_x: number;
    qr_y: number;
    barcode_x: number;
    barcode_y: number;
    label_width_dots: number;
    label_height_dots: number;
}

export interface AssetLabelPrintLogRecord {
    id: number;
    asset_id: number;
    asset_tag_id: number | null;
    asset_name_printed: string;
    tag_number_printed: string;
    barcode_value_printed: string | null;
    qr_value_printed: string | null;
    print_source: string;
    output_format: string;
    copies: number;
    printer_model: string;
    printer_language: string;
    printer_dpi: number;
    label_width_mm: number;
    label_height_mm: number;
    gap_mm: number;
    direction: number;
    printed_at: string | null;
    printed_by_name: string | null;
    reprinted_from_log_id: number | null;
    created_at: string | null;
}

export interface AssetListRow {
    id: number;
    asset_uuid?: string | null;
    asset_name: string;
    asset_code: string;
    asset_category_id?: number | null;
    category_name: string | null;
    category_code?: string | null;
    tag_number: string | null;
    barcode_value?: string | null;
    qr_value?: string | null;
    brand?: string | null;
    model?: string | null;
    serial_number?: string | null;
    manufacturer?: string | null;
    supplier_id?: number | null;
    supplier_name?: string | null;
    purchase_date?: string | null;
    warranty_start?: string | null;
    warranty_end?: string | null;
    purchase_cost?: string | number | null;
    department_id?: number | null;
    department_name: string | null;
    location_id?: number | null;
    location_name: string | null;
    room_or_area?: string | null;
    assigned_user_id?: number | null;
    assigned_user_name: string | null;
    assigned_department_id?: number | null;
    assigned_department_name?: string | null;
    assigned_location_id?: number | null;
    assigned_location_name?: string | null;
    custodian_name?: string | null;
    condition_status: string;
    asset_status: string;
    notes?: string | null;
    image_path?: string | null;
    image_url?: string | null;
    last_issued_at?: string | null;
    last_returned_at?: string | null;
    tag_generated?: boolean;
    active_tag?: AssetTagRecord | null;
    active_assignment?: AssetAssignmentRecord | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface AssetDetailModel extends AssetListRow {
    depreciation_method?: string | null;
    useful_life_years?: number | null;
    residual_value?: string | number | null;
    assignment_history: AssetAssignmentRecord[];
    movement_history: AssetMovementRecord[];
    status_history: AssetStatusHistoryRecord[];
}

export interface AssetListPermissions {
    create: boolean;
    scan: boolean;
    bulkGenerateTags: boolean;
    printLabels: boolean;
    edit: boolean;
    generateTag: boolean;
    regenerateTag: boolean;
    printLabel: boolean;
    issue: boolean;
    transfer: boolean;
}

export interface AssetDetailPermissions {
    edit: boolean;
    delete: boolean;
    generate_tag: boolean;
    regenerate_tag: boolean;
    print_label: boolean;
    issue: boolean;
    return: boolean;
    transfer: boolean;
    change_status: boolean;
}

export interface AssetFormData {
    [key: string]: string | boolean | File | null;
    asset_name: string;
    asset_code: string;
    asset_category_id: string;
    supplier_id: string;
    department_id: string;
    location_id: string;
    room_or_area: string;
    assigned_user_id: string;
    assigned_department_id: string;
    assigned_location_id: string;
    custodian_name: string;
    brand: string;
    model: string;
    serial_number: string;
    manufacturer: string;
    purchase_date: string;
    warranty_start: string;
    warranty_end: string;
    purchase_cost: string;
    depreciation_method: string;
    useful_life_years: string;
    residual_value: string;
    condition_status: string;
    asset_status: string;
    notes: string;
    image: File | null;
}

export interface AssetIssueFormData {
    [key: string]: string;
    assignment_type: string;
    department_id: string;
    location_id: string;
    assigned_user_id: string;
    room_or_area: string;
    custodian_name: string;
    issued_at: string;
    expected_return_at: string;
    remarks: string;
}

export interface AssetReturnFormData {
    [key: string]: string;
    returned_at: string;
    return_condition: string;
    return_to_department_id: string;
    return_to_location_id: string;
    return_to_room_or_area: string;
    post_return_status: string;
    remarks: string;
}

export interface AssetTransferFormData {
    [key: string]: string;
    assignment_type: string;
    department_id: string;
    location_id: string;
    assigned_user_id: string;
    room_or_area: string;
    custodian_name: string;
    transfer_datetime: string;
    remarks: string;
}

export interface AssetHistoryTimelineItem {
    id: string | number;
    title: string;
    description?: string;
    meta?: string;
    body?: string;
    badgeLabel?: string;
    badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
}

export interface AssetTransferPreview {
    departmentName?: string | null;
    locationName?: string | null;
    assignedUserName?: string | null;
    roomOrArea?: string | null;
    custodianName?: string | null;
    assignmentType?: string | null;
}

export interface AssetIndexPageProps extends ReactSharedPageProps {
    filters: AssetListFilters;
    assets: PaginatedResponse<AssetListRow>;
    filterOptions: AssetFilterOptions;
    permissions?: AssetListPermissions;
}

export interface AssetShowPageProps extends ReactSharedPageProps {
    asset: AssetDetailModel;
    labelPreview: AssetLabelPreview | null;
    permissions: AssetDetailPermissions;
}

export interface AssetFormPageProps extends ReactSharedPageProps {
    asset: AssetDetailModel | null;
    options: AssetFilterOptions;
}

export interface AssetIssuePageProps extends ReactSharedPageProps {
    asset: AssetDetailModel;
    options: AssetFilterOptions;
}

export interface AssetReturnPageProps extends ReactSharedPageProps {
    asset: AssetDetailModel;
    options: AssetFilterOptions;
}

export interface AssetTransferPageProps extends ReactSharedPageProps {
    asset: AssetDetailModel;
    options: AssetFilterOptions;
}

export interface AssetScanPageProps extends ReactSharedPageProps {
    query: string | null;
    matches: AssetListRow[];
    error: string | null;
}

export interface AssetTagGeneratePageProps extends ReactSharedPageProps {
    asset: AssetDetailModel;
    previewTag: string;
    canRegenerate: boolean;
}

export interface AssetLabelPreviewPageProps extends ReactSharedPageProps {
    title: string;
    mode: 'single' | 'bulk';
    labels: AssetLabelPreview[];
    tsplOutput: string;
    printerSettings: PrinterSettingsRecord;
    directPrinterTarget?: string | null;
    selectedAssetIds: number[];
    printLogs: AssetLabelPrintLogRecord[];
}
