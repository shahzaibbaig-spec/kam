import type { PaginatedResponse } from '@/types';
import type { ReactSharedPageProps } from '@/types/app-shell';

export interface InventoryOptionRecord {
    id?: number;
    name?: string;
    code?: string | null;
    value?: string;
    label?: string;
    designation?: string | null;
    department_id?: number | null;
    default_location_id?: number | null;
}

export interface InventoryListFilters {
    [key: string]: string | undefined;
    search?: string;
    category_id?: string;
    location_id?: string;
    supplier_id?: string;
    active?: string;
    low_stock?: string;
    near_expiry?: string;
    batch_status?: string;
    temperature_sensitive?: string;
    sterile_item?: string;
    high_risk_item?: string;
    controlled_use?: string;
}

export interface InventoryBatchRecord {
    id: number;
    inventory_item_id?: number | null;
    batch_number: string;
    lot_number: string | null;
    manufacture_date: string | null;
    expiry_date: string | null;
    unit_cost: string | number | null;
    received_quantity: string | number;
    available_quantity: string | number;
    reserved_quantity: string | number;
    issued_quantity: string | number;
    returned_quantity: string | number;
    damaged_quantity: string | number;
    quarantined_quantity: string | number;
    expired_quantity: string | number;
    status: string;
    supplier_name: string | null;
    store_location_id?: number | null;
    store_location_name: string | null;
    storage_zone: string | null;
    notes: string | null;
    is_expired: boolean;
    is_issuable: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface InventoryTransactionRecord {
    id: number;
    inventory_item_id?: number | null;
    inventory_batch_id?: number | null;
    transaction_type: string;
    quantity: string | number;
    unit_of_measure: string;
    before_quantity: string | number;
    after_quantity: string | number;
    before_batch_quantity?: string | number | null;
    after_batch_quantity?: string | number | null;
    from_location_name: string | null;
    to_location_name: string | null;
    from_department_name: string | null;
    to_department_name: string | null;
    issued_to_user_name: string | null;
    received_from_user_name: string | null;
    reference_type: string | null;
    reference_id: number | null;
    reference_number: string | null;
    transaction_datetime: string | null;
    remarks: string | null;
    performed_by_name: string | null;
    batch_number: string | null;
}

export interface InventoryListRow {
    id: number;
    item_uuid?: string | null;
    item_name: string;
    item_code: string;
    inventory_category_id?: number | null;
    category_name: string | null;
    category_code?: string | null;
    subcategory: string | null;
    barcode_value: string | null;
    sku: string | null;
    unit_of_measure: string;
    pack_size: string | null;
    reorder_level: string | number;
    minimum_level: string | number;
    maximum_level: string | number | null;
    current_quantity: string | number;
    reserved_quantity: string | number;
    issued_quantity: string | number;
    damaged_quantity: string | number;
    quarantined_quantity: string | number;
    expired_quantity: string | number;
    available_balance: number;
    supplier_id?: number | null;
    supplier_name: string | null;
    store_location_id?: number | null;
    store_location_name: string | null;
    storage_zone: string | null;
    temperature_sensitive: boolean;
    sterile_item: boolean;
    high_risk_item: boolean;
    controlled_use: boolean;
    is_active: boolean;
    notes: string | null;
    is_low_stock: boolean;
    near_expiry_batch_count: number | null;
    batches?: InventoryBatchRecord[];
    transactions?: InventoryTransactionRecord[];
    created_at: string | null;
    updated_at: string | null;
}

export interface InventoryDetailModel extends InventoryListRow {
    batches: InventoryBatchRecord[];
    transactions: InventoryTransactionRecord[];
}

export interface InventoryWorkflowItemBatchOption {
    id: number;
    batch_number: string;
    available_quantity: string | number;
    status: string;
    expiry_date: string | null;
    store_location_id?: number | null;
    store_location_name: string | null;
}

export interface InventoryWorkflowItemOption {
    id: number;
    item_name: string;
    item_code: string;
    unit_of_measure: string;
    current_quantity: string | number;
    reorder_level: string | number;
    store_location_id?: number | null;
    store_location_name: string | null;
    batches: InventoryWorkflowItemBatchOption[];
}

export interface InventorySourceIssueOption {
    id: number;
    issue_number: string;
    issue_date: string | null;
    department_name?: string | null;
    location_name?: string | null;
    issued_to_user_name?: string | null;
}

export interface InventoryFilterOptions {
    categories: InventoryOptionRecord[];
    locations: InventoryOptionRecord[];
    suppliers: InventoryOptionRecord[];
    batchStatuses: InventoryOptionRecord[];
    departments?: InventoryOptionRecord[];
    users?: InventoryOptionRecord[];
    items?: InventoryWorkflowItemOption[];
    issueTypes?: InventoryOptionRecord[];
    returnConditions?: InventoryOptionRecord[];
    adjustmentTypes?: InventoryOptionRecord[];
    sourceIssues?: InventorySourceIssueOption[];
}

export interface InventoryListPermissions {
    create: boolean;
    receive: boolean;
    issue: boolean;
    return: boolean;
    transfer: boolean;
    adjust: boolean;
    scan: boolean;
    edit: boolean;
    ledger: boolean;
}

export interface InventoryDetailPermissions {
    edit: boolean;
    delete: boolean;
    receive: boolean;
    issue: boolean;
    return: boolean;
    transfer: boolean;
    adjust: boolean;
    scan: boolean;
    ledger: boolean;
}

export interface InventoryFormData {
    [key: string]: string | boolean;
    item_name: string;
    item_code: string;
    inventory_category_id: string;
    subcategory: string;
    barcode_value: string;
    sku: string;
    unit_of_measure: string;
    pack_size: string;
    reorder_level: string;
    minimum_level: string;
    maximum_level: string;
    supplier_id: string;
    store_location_id: string;
    storage_zone: string;
    temperature_sensitive: boolean;
    sterile_item: boolean;
    high_risk_item: boolean;
    controlled_use: boolean;
    is_active: boolean;
    notes: string;
}

export interface StockReceiveLineData {
    [key: string]: string;
    inventory_item_id: string;
    batch_number: string;
    lot_number: string;
    manufacture_date: string;
    expiry_date: string;
    quantity: string;
    unit_cost: string;
    storage_zone: string;
    remarks: string;
}

export interface StockReceiveFormData {
    [key: string]: string | StockReceiveLineData[];
    supplier_id: string;
    department_id: string;
    store_location_id: string;
    receipt_date: string;
    invoice_reference: string;
    delivery_note_number: string;
    remarks: string;
    items: StockReceiveLineData[];
}

export interface StockIssueLineData {
    [key: string]: string;
    inventory_item_id: string;
    inventory_batch_id: string;
    quantity: string;
    unit_of_measure: string;
    remarks: string;
}

export interface StockIssueFormData {
    [key: string]: string | StockIssueLineData[];
    issue_date: string;
    issue_type: string;
    department_id: string;
    location_id: string;
    room_or_area: string;
    issued_to_user_id: string;
    remarks: string;
    items: StockIssueLineData[];
}

export interface StockReturnLineData {
    [key: string]: string;
    inventory_item_id: string;
    inventory_batch_id: string;
    quantity: string;
    return_condition: string;
    remarks: string;
}

export interface StockReturnFormData {
    [key: string]: string | StockReturnLineData[];
    return_date: string;
    source_issue_id: string;
    returned_by: string;
    received_by: string;
    department_id: string;
    location_id: string;
    room_or_area: string;
    remarks: string;
    items: StockReturnLineData[];
}

export interface StockTransferLineData {
    [key: string]: string;
    inventory_item_id: string;
    inventory_batch_id: string;
    quantity: string;
    storage_zone: string;
    remarks: string;
}

export interface StockTransferFormData {
    [key: string]: string | StockTransferLineData[];
    transfer_date: string;
    from_location_id: string;
    to_location_id: string;
    from_department_id: string;
    to_department_id: string;
    remarks: string;
    items: StockTransferLineData[];
}

export interface StockAdjustmentLineData {
    [key: string]: string;
    inventory_item_id: string;
    inventory_batch_id: string;
    system_quantity: string;
    physical_quantity: string;
    adjustment_quantity: string;
    unit_of_measure: string;
    remarks: string;
}

export interface StockAdjustmentFormData {
    [key: string]: string | StockAdjustmentLineData[];
    adjustment_date: string;
    adjustment_type: string;
    reason: string;
    location_id: string;
    department_id: string;
    remarks: string;
    items: StockAdjustmentLineData[];
}

export interface InventoryIndexPageProps extends ReactSharedPageProps {
    filters: InventoryListFilters;
    items: PaginatedResponse<InventoryListRow>;
    filterOptions: InventoryFilterOptions;
    nearExpiryDays: number;
    permissions?: InventoryListPermissions;
}

export interface InventoryShowPageProps extends ReactSharedPageProps {
    item: InventoryDetailModel;
    permissions: InventoryDetailPermissions;
    nearExpiryDays: number;
}

export interface InventoryFormPageProps extends ReactSharedPageProps {
    item: InventoryDetailModel | null;
    options: InventoryFilterOptions;
}

export interface InventoryWorkflowPageProps extends ReactSharedPageProps {
    options: InventoryFilterOptions;
    selectedItemId: number | null;
}

export interface InventoryScanPageProps extends ReactSharedPageProps {
    query: string;
    results: InventoryListRow[] | { data?: InventoryListRow[] };
    searched: boolean;
}

export interface InventoryLedgerPageProps extends ReactSharedPageProps {
    filters: Record<string, string | undefined>;
    transactions: PaginatedResponse<InventoryTransactionRecord>;
    filterOptions: InventoryFilterOptions;
}
