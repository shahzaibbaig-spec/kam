import type { PaginatedResponse } from '@/types';
import type { ReactSharedPageProps } from '@/types/app-shell';

export interface ProcurementOptionRecord {
    id?: number;
    name?: string;
    code?: string | null;
    value?: string;
    label?: string;
    supplier_name?: string | null;
    supplier_type?: string | null;
    payment_terms?: string | null;
    designation?: string | null;
    department_id?: number | null;
    item_name?: string;
    item_code?: string | null;
    item_description?: string | null;
    unit_of_measure?: string | null;
    requisition_number?: string | null;
    po_number?: string | null;
}

export interface SupplierListFilters {
    [key: string]: string | undefined;
    search?: string;
    supplier_type?: string;
    active?: string;
    city?: string;
}

export interface RequisitionListFilters {
    [key: string]: string | undefined;
    search?: string;
    status?: string;
    requisition_type?: string;
    department_id?: string;
    priority?: string;
}

export interface PurchaseOrderListFilters {
    [key: string]: string | undefined;
    search?: string;
    status?: string;
    supplier_id?: string;
    purchase_requisition_id?: string;
}

export interface GoodsReceiptListFilters {
    [key: string]: string | undefined;
    search?: string;
    status?: string;
    supplier_id?: string;
    purchase_order_id?: string;
}

export interface SupplierRecentRequisitionRecord {
    id: number;
    requisition_number: string;
    status: string | null;
    request_date: string | null;
    department_name: string | null;
}

export interface SupplierRecentPurchaseOrderRecord {
    id: number;
    po_number: string;
    status: string | null;
    po_date: string | null;
    total_amount: string | number | null;
}

export interface SupplierRecentGoodsReceiptRecord {
    id: number;
    grn_number: string;
    status: string | null;
    receipt_date: string | null;
}

export interface SupplierListRow {
    id: number;
    supplier_code: string | null;
    supplier_name: string;
    supplier_type: string;
    contact_person: string | null;
    phone: string | null;
    alternate_phone?: string | null;
    email: string | null;
    address?: string | null;
    city: string | null;
    country?: string | null;
    tax_number?: string | null;
    registration_number?: string | null;
    payment_terms?: string | null;
    lead_time_days?: number | null;
    is_active: boolean;
    notes?: string | null;
    purchase_orders_count?: number | null;
    goods_receipts_count?: number | null;
    requisition_items_count?: number | null;
    recent_purchase_orders?: SupplierRecentPurchaseOrderRecord[];
    recent_goods_receipts?: SupplierRecentGoodsReceiptRecord[];
    recent_requisitions?: SupplierRecentRequisitionRecord[];
    created_at?: string | null;
    updated_at?: string | null;
}

export interface SupplierDetailModel extends SupplierListRow {}

export interface SupplierFormData {
    [key: string]: string | boolean;
    supplier_code: string;
    supplier_name: string;
    supplier_type: string;
    contact_person: string;
    phone: string;
    alternate_phone: string;
    email: string;
    address: string;
    city: string;
    country: string;
    tax_number: string;
    registration_number: string;
    payment_terms: string;
    lead_time_days: string;
    is_active: boolean;
    notes: string;
}

export interface RequisitionLineItemModel {
    id?: number;
    purchase_requisition_item_id?: number | null;
    item_type: string;
    asset_category_id?: number | null;
    asset_category_name?: string | null;
    inventory_item_id?: number | null;
    inventory_item_name?: string | null;
    inventory_item_code?: string | null;
    item_description: string | null;
    quantity: string | number;
    unit_of_measure: string | null;
    estimated_unit_cost: string | number | null;
    estimated_total: string | number | null;
    preferred_supplier_id?: number | null;
    preferred_supplier_name?: string | null;
    needed_by_date: string | null;
    remarks: string | null;
    ordered_quantity: string | number;
    received_quantity: string | number;
    status: string | null;
}

export interface RequisitionApprovalHistoryEntry {
    id: number;
    approval_level: number | null;
    action: string | null;
    acted_by_name: string | null;
    acted_at: string | null;
    comments: string | null;
}

export interface RequisitionPurchaseOrderRecord {
    id: number;
    po_number: string;
    status: string | null;
    supplier_name: string | null;
    po_date: string | null;
    total_amount: string | number | null;
}

export interface RequisitionListRow {
    id: number;
    requisition_number: string;
    requisition_type: string | null;
    department_id?: number | null;
    department_name: string | null;
    requested_by?: number | null;
    requested_by_name: string | null;
    request_date: string | null;
    priority: string | null;
    purpose: string | null;
    remarks: string | null;
    total_estimated_amount: string | number | null;
    status: string | null;
    current_approval_level: number | null;
    final_approved_at: string | null;
    rejected_at: string | null;
    rejected_by_name: string | null;
    rejection_reason: string | null;
    items?: RequisitionLineItemModel[];
    approval_history?: RequisitionApprovalHistoryEntry[];
    purchase_orders?: RequisitionPurchaseOrderRecord[];
}

export interface RequisitionDetailModel extends RequisitionListRow {
    items: RequisitionLineItemModel[];
    approval_history: RequisitionApprovalHistoryEntry[];
    purchase_orders: RequisitionPurchaseOrderRecord[];
}

export interface RequisitionFormLineData {
    [key: string]: string;
    item_type: string;
    asset_category_id: string;
    inventory_item_id: string;
    item_description: string;
    quantity: string;
    unit_of_measure: string;
    estimated_unit_cost: string;
    estimated_total: string;
    preferred_supplier_id: string;
    needed_by_date: string;
    remarks: string;
}

export interface RequisitionFormData {
    [key: string]: string | RequisitionFormLineData[];
    requisition_type: string;
    department_id: string;
    requested_by: string;
    request_date: string;
    priority: string;
    purpose: string;
    remarks: string;
    items: RequisitionFormLineData[];
}

export interface PurchaseOrderLineItemModel {
    id?: number;
    purchase_requisition_item_id?: number | null;
    requisition_item_description?: string | null;
    item_type: string;
    asset_category_id?: number | null;
    asset_category_name?: string | null;
    inventory_item_id?: number | null;
    inventory_item_name?: string | null;
    inventory_item_code?: string | null;
    item_description: string | null;
    quantity_ordered: string | number;
    quantity_received: string | number;
    unit_of_measure: string | null;
    unit_price: string | number | null;
    line_total: string | number | null;
    remarks: string | null;
    status: string | null;
    remaining_quantity: string | number;
}

export interface PurchaseOrderGoodsReceiptRecord {
    id: number;
    grn_number: string;
    status: string | null;
    receipt_date: string | null;
}

export interface PurchaseOrderListRow {
    id: number;
    po_number: string;
    purchase_requisition_id?: number | null;
    requisition_number: string | null;
    supplier_id?: number | null;
    supplier_name: string | null;
    po_date: string | null;
    expected_delivery_date: string | null;
    currency: string | null;
    subtotal: string | number | null;
    tax_amount: string | number | null;
    discount_amount: string | number | null;
    total_amount: string | number | null;
    payment_terms: string | null;
    remarks: string | null;
    status: string | null;
    approved_by_name: string | null;
    approved_at: string | null;
    issued_by_name: string | null;
    issued_at: string | null;
    items?: PurchaseOrderLineItemModel[];
    goods_receipts?: PurchaseOrderGoodsReceiptRecord[];
}

export interface PurchaseOrderDetailModel extends PurchaseOrderListRow {
    items: PurchaseOrderLineItemModel[];
    goods_receipts: PurchaseOrderGoodsReceiptRecord[];
}

export interface PurchaseOrderFormLineData {
    [key: string]: string;
    purchase_requisition_item_id: string;
    item_type: string;
    asset_category_id: string;
    inventory_item_id: string;
    item_description: string;
    quantity_ordered: string;
    unit_of_measure: string;
    unit_price: string;
    line_total: string;
    remarks: string;
}

export interface PurchaseOrderFormData {
    [key: string]: string | PurchaseOrderFormLineData[];
    purchase_requisition_id: string;
    supplier_id: string;
    po_date: string;
    expected_delivery_date: string;
    currency: string;
    payment_terms: string;
    remarks: string;
    tax_amount: string;
    discount_amount: string;
    items: PurchaseOrderFormLineData[];
}

export interface GoodsReceiptLineItemModel {
    id?: number;
    purchase_order_item_id: number;
    item_type: string;
    asset_category_name?: string | null;
    inventory_item_name?: string | null;
    item_description: string | null;
    quantity_received: string | number;
    quantity_accepted: string | number;
    quantity_rejected: string | number;
    rejection_reason: string | null;
    batch_number: string | null;
    manufacture_date: string | null;
    expiry_date: string | null;
    serial_number: string | null;
    unit_cost: string | number | null;
    storage_location_name?: string | null;
    storage_location_id?: number | null;
    room_or_area: string | null;
    remarks: string | null;
    has_discrepancy: boolean;
}

export interface GoodsReceiptListRow {
    id: number;
    grn_number: string;
    purchase_order_id?: number | null;
    purchase_order_number: string | null;
    supplier_id?: number | null;
    supplier_name: string | null;
    receipt_date: string | null;
    invoice_reference: string | null;
    delivery_note_number: string | null;
    received_by_name: string | null;
    inspected_by_name: string | null;
    remarks: string | null;
    status: string | null;
    items?: GoodsReceiptLineItemModel[];
}

export interface GoodsReceiptDetailModel extends GoodsReceiptListRow {
    items: GoodsReceiptLineItemModel[];
}

export interface GoodsReceiptFormLineData {
    [key: string]: string;
    purchase_order_item_id: string;
    item_type: string;
    asset_category_id: string;
    inventory_item_id: string;
    item_description: string;
    quantity_received: string;
    quantity_accepted: string;
    quantity_rejected: string;
    rejection_reason: string;
    batch_number: string;
    manufacture_date: string;
    expiry_date: string;
    serial_number: string;
    unit_cost: string;
    storage_location_id: string;
    room_or_area: string;
    remarks: string;
}

export interface GoodsReceiptFormData {
    [key: string]: string | GoodsReceiptFormLineData[];
    purchase_order_id: string;
    supplier_id: string;
    receipt_date: string;
    invoice_reference: string;
    delivery_note_number: string;
    received_by: string;
    inspected_by: string;
    remarks: string;
    items: GoodsReceiptFormLineData[];
}

export interface ProcurementSupplierFilterOptions {
    types: Array<{ value: string; label: string }>;
    cities: string[];
}

export interface ProcurementRequisitionFilterOptions {
    types: Array<{ value: string; label: string }>;
    priorities: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    departments: ProcurementOptionRecord[];
}

export interface ProcurementPurchaseOrderFilterOptions {
    statuses: Array<{ value: string; label: string }>;
    suppliers: ProcurementOptionRecord[];
    requisitions: ProcurementOptionRecord[];
}

export interface ProcurementGoodsReceiptFilterOptions {
    statuses: Array<{ value: string; label: string }>;
    suppliers: ProcurementOptionRecord[];
    purchaseOrders: ProcurementOptionRecord[];
}

export interface SupplierListPermissions {
    create: boolean;
}

export interface SupplierDetailPermissions {
    edit: boolean;
    delete: boolean;
    createPo: boolean;
    createRequisition: boolean;
}

export interface RequisitionListPermissions {
    create: boolean;
}

export interface RequisitionDetailPermissions {
    edit: boolean;
    submit: boolean;
    approve: boolean;
    reject: boolean;
    cancel: boolean;
    createPo: boolean;
}

export interface PurchaseOrderListPermissions {
    create: boolean;
}

export interface PurchaseOrderDetailPermissions {
    edit: boolean;
    issue: boolean;
    cancel: boolean;
    close: boolean;
    receive: boolean;
}

export interface GoodsReceiptListPermissions {
    create: boolean;
}

export interface GoodsReceiptDetailPermissions {
    viewPurchaseOrder: boolean;
}

export interface SupplierIndexPageProps extends ReactSharedPageProps {
    filters: SupplierListFilters;
    suppliers: PaginatedResponse<SupplierListRow>;
    filterOptions: ProcurementSupplierFilterOptions;
    permissions?: SupplierListPermissions;
}

export interface SupplierShowPageProps extends ReactSharedPageProps {
    supplier: SupplierDetailModel;
    permissions: SupplierDetailPermissions;
}

export interface SupplierFormPageProps extends ReactSharedPageProps {
    supplier: SupplierDetailModel | null;
    options: {
        types: Array<{ value: string; label: string }>;
    };
}

export interface RequisitionIndexPageProps extends ReactSharedPageProps {
    filters: RequisitionListFilters;
    requisitions: PaginatedResponse<RequisitionListRow>;
    filterOptions: ProcurementRequisitionFilterOptions;
    permissions?: RequisitionListPermissions;
}

export interface RequisitionShowPageProps extends ReactSharedPageProps {
    requisition: RequisitionDetailModel;
    permissions: RequisitionDetailPermissions;
    currentStageLabel: string | null;
}

export interface RequisitionFormPageProps extends ReactSharedPageProps {
    requisition: RequisitionDetailModel | null;
    options: {
        departments: ProcurementOptionRecord[];
        users: ProcurementOptionRecord[];
        suppliers: ProcurementOptionRecord[];
        assetCategories: ProcurementOptionRecord[];
        inventoryItems: ProcurementOptionRecord[];
        types: Array<{ value: string; label: string }>;
        priorities: Array<{ value: string; label: string }>;
        statuses: Array<{ value: string; label: string }>;
    };
    currentUserId: number;
}

export interface PurchaseOrderIndexPageProps extends ReactSharedPageProps {
    filters: PurchaseOrderListFilters;
    purchaseOrders: PaginatedResponse<PurchaseOrderListRow>;
    filterOptions: ProcurementPurchaseOrderFilterOptions;
    permissions?: PurchaseOrderListPermissions;
}

export interface PurchaseOrderShowPageProps extends ReactSharedPageProps {
    purchaseOrder: PurchaseOrderDetailModel;
    permissions: PurchaseOrderDetailPermissions;
}

export interface PurchaseOrderFormPageProps extends ReactSharedPageProps {
    purchaseOrder: PurchaseOrderDetailModel | null;
    options: {
        suppliers: ProcurementOptionRecord[];
        assetCategories: ProcurementOptionRecord[];
        inventoryItems: ProcurementOptionRecord[];
        approvedRequisitions: RequisitionDetailModel[];
        statuses: Array<{ value: string; label: string }>;
        currency: string;
    };
    selectedRequisition: RequisitionDetailModel | null;
}

export interface GoodsReceiptIndexPageProps extends ReactSharedPageProps {
    filters: GoodsReceiptListFilters;
    goodsReceipts: PaginatedResponse<GoodsReceiptListRow>;
    filterOptions: ProcurementGoodsReceiptFilterOptions;
    permissions?: GoodsReceiptListPermissions;
}

export interface GoodsReceiptShowPageProps extends ReactSharedPageProps {
    goodsReceipt: GoodsReceiptDetailModel;
    permissions?: GoodsReceiptDetailPermissions;
}

export interface GoodsReceiptFormPageProps extends ReactSharedPageProps {
    goodsReceipt: GoodsReceiptDetailModel | null;
    options: {
        purchaseOrders: PurchaseOrderDetailModel[];
        suppliers: ProcurementOptionRecord[];
        locations: ProcurementOptionRecord[];
        users: ProcurementOptionRecord[];
        statuses: Array<{ value: string; label: string }>;
    };
    selectedPurchaseOrder: PurchaseOrderDetailModel | null;
}
