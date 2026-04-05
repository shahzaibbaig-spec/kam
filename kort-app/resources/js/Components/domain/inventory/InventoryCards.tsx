import { motion } from 'framer-motion';
import { AlertTriangle, Archive, ArrowRightLeft, Boxes, ClipboardPenLine, PackageCheck, Snowflake, Thermometer, TriangleAlert, Warehouse } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { BatchStatusBadge, InventoryStatusBadge } from '@/Components/domain/inventory/InventoryBadges';
import { ExpiryBadge } from '@/Components/domain/shared/ExpiryBadge';
import type { InventoryDetailModel, InventoryWorkflowItemOption } from '@/types/inventory';
import { formatDateTime, formatTitleCase, joinDisplayParts } from '@/Lib/utils';

interface InfoItem {
    label: string;
    value: ReactNode;
}

interface InventoryInfoCardProps {
    title: string;
    description: string;
    icon: typeof Archive;
    items: InfoItem[];
}

function InventoryInfoCard({ title, description, icon: Icon, items }: InventoryInfoCardProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            <AppCard>
                <AppCardHeader className="border-b border-slate-100">
                    <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-primary-soft p-3 text-blue-700">
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <AppCardTitle>{title}</AppCardTitle>
                            <AppCardDescription>{description}</AppCardDescription>
                        </div>
                    </div>
                </AppCardHeader>
                <AppCardContent className="p-6">
                    <dl className="grid gap-4 sm:grid-cols-2">
                        {items.map((item) => (
                            <div key={item.label}>
                                <dt className="text-sm text-slate-500">{item.label}</dt>
                                <dd className="mt-1 text-sm font-medium text-slate-900">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </AppCardContent>
            </AppCard>
        </motion.div>
    );
}

function toNumber(value: string | number | null | undefined) {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
}

function workflowAvailable(item: InventoryWorkflowItemOption) {
    return item.batches.reduce((total, batch) => total + toNumber(batch.available_quantity), 0);
}

interface InventorySummaryLike {
    item_name: string;
    item_code: string;
    category_name?: string | null;
    barcode_value?: string | null;
    unit_of_measure?: string | null;
    store_location_name?: string | null;
    storage_zone?: string | null;
    reorder_level?: string | number | null;
    current_quantity?: string | number | null;
    available_balance?: number | null;
    is_low_stock?: boolean;
    temperature_sensitive?: boolean;
    sterile_item?: boolean;
    high_risk_item?: boolean;
    controlled_use?: boolean;
}

export interface InventoryHeaderCardProps {
    item: InventoryDetailModel;
    nearExpiryDays: number;
}

export function InventoryHeaderCard({ item, nearExpiryDays }: InventoryHeaderCardProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
            <AppCard className="overflow-hidden border-blue-100">
                <AppCardContent className="p-0">
                    <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-5 p-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <AppBadge variant="outline">{item.item_uuid ?? 'Inventory item'}</AppBadge>
                                <InventoryStatusBadge value={item.is_active ? 'active' : 'inactive'} />
                                {item.is_low_stock ? <InventoryStatusBadge value="low_stock" /> : <InventoryStatusBadge value="in_stock" />}
                                {item.near_expiry_batch_count ? <ExpiryBadge value="near_expiry" /> : null}
                            </div>

                            <div>
                                <h1 className="text-3xl font-semibold text-slate-950">{item.item_name}</h1>
                                <p className="mt-2 text-sm text-slate-600">
                                    {item.item_code} {item.category_name ? `• ${item.category_name}` : ''}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Stock position</p>
                                    <p className="mt-2 text-lg font-semibold text-slate-900">
                                        {item.available_balance} {item.unit_of_measure}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        On hand {item.current_quantity} • reorder {item.reorder_level}
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Storage</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.store_location_name ?? 'Default store not assigned'}</p>
                                    <p className="mt-1 text-sm text-slate-600">{item.storage_zone ?? 'Storage zone not set'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50/70 p-6 lg:border-l lg:border-t-0">
                            <div className="space-y-4">
                                <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Handling flags</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {item.temperature_sensitive ? <AppBadge variant="info">Temperature-sensitive</AppBadge> : null}
                                        {item.sterile_item ? <AppBadge variant="primary">Sterile</AppBadge> : null}
                                        {item.high_risk_item ? <AppBadge variant="danger">High-risk</AppBadge> : null}
                                        {item.controlled_use ? <AppBadge variant="warning">Controlled-use</AppBadge> : null}
                                        {!item.temperature_sensitive && !item.sterile_item && !item.high_risk_item && !item.controlled_use ? (
                                            <AppBadge variant="neutral">Standard handling</AppBadge>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Batch watch</p>
                                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                                        <p>{item.batches.length} tracked batches</p>
                                        <p>{item.near_expiry_batch_count ?? 0} near expiry within {nearExpiryDays} days</p>
                                        <p>{item.quarantined_quantity} quarantined • {item.damaged_quantity} damaged • {item.expired_quantity} expired</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AppCardContent>
            </AppCard>
        </motion.div>
    );
}

export function InventoryIdentityCard({ item }: { item: InventoryDetailModel }) {
    return (
        <InventoryInfoCard
            title="Basic information"
            description="Core inventory identity, coding, and classification details."
            icon={Archive}
            items={[
                { label: 'Item code', value: item.item_code },
                { label: 'Barcode', value: item.barcode_value ?? 'Not assigned' },
                { label: 'Category', value: item.category_name ?? 'Not assigned' },
                { label: 'Subcategory', value: item.subcategory ?? 'Not assigned' },
                { label: 'SKU', value: item.sku ?? 'Not assigned' },
                { label: 'Unit of measure', value: item.unit_of_measure },
                { label: 'Pack size', value: item.pack_size ?? 'Not specified' },
            ]}
        />
    );
}

export function InventoryStockSummaryCard({ item }: { item: InventoryDetailModel }) {
    return (
        <InventoryInfoCard
            title="Stock summary"
            description="Live balances that store and ward teams need for safe issue and replenishment decisions."
            icon={Boxes}
            items={[
                { label: 'Available balance', value: `${item.available_balance} ${item.unit_of_measure}` },
                { label: 'Current quantity', value: item.current_quantity },
                { label: 'Reserved quantity', value: item.reserved_quantity },
                { label: 'Issued quantity', value: item.issued_quantity },
                { label: 'Damaged quantity', value: item.damaged_quantity },
                { label: 'Quarantined quantity', value: item.quarantined_quantity },
                { label: 'Expired quantity', value: item.expired_quantity },
            ]}
        />
    );
}

export function InventoryStorageCard({ item }: { item: InventoryDetailModel }) {
    return (
        <InventoryInfoCard
            title="Storage and handling"
            description="Where the item normally lives and what handling controls apply."
            icon={Warehouse}
            items={[
                { label: 'Default store', value: item.store_location_name ?? 'Not assigned' },
                { label: 'Storage zone', value: item.storage_zone ?? 'Not specified' },
                { label: 'Supplier', value: item.supplier_name ?? 'No preferred supplier' },
                { label: 'Temperature-sensitive', value: item.temperature_sensitive ? 'Yes' : 'No' },
                { label: 'Sterile item', value: item.sterile_item ? 'Yes' : 'No' },
                { label: 'Controlled-use', value: item.controlled_use ? 'Yes' : 'No' },
            ]}
        />
    );
}

export function InventoryFlagsCard({ item }: { item: InventoryDetailModel }) {
    return (
        <InventoryInfoCard
            title="Controls and flags"
            description="Thresholds and flags that influence how the item is stocked and handled operationally."
            icon={TriangleAlert}
            items={[
                { label: 'Reorder level', value: item.reorder_level },
                { label: 'Minimum level', value: item.minimum_level },
                { label: 'Maximum level', value: item.maximum_level ?? 'Not set' },
                { label: 'High-risk item', value: item.high_risk_item ? 'Yes' : 'No' },
                { label: 'Active', value: item.is_active ? 'Yes' : 'No' },
                { label: 'Near-expiry batches', value: item.near_expiry_batch_count ?? 0 },
            ]}
        />
    );
}

export function InventoryWorkflowSummaryCard({
    item,
    title,
    description,
    footer,
}: {
    item: InventorySummaryLike;
    title: string;
    description: string;
    footer?: ReactNode;
}) {
    return (
        <AppCard className="border-blue-100">
            <AppCardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary-soft p-3 text-blue-700">
                        <PackageCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <AppCardTitle>{title}</AppCardTitle>
                        <AppCardDescription>{description}</AppCardDescription>
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="space-y-5 p-6">
                <div>
                    <p className="text-lg font-semibold text-slate-950">{item.item_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.item_code}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {item.is_low_stock ? <InventoryStatusBadge value="low_stock" /> : <InventoryStatusBadge value="in_stock" />}
                    {item.temperature_sensitive ? <AppBadge variant="info">Temperature-sensitive</AppBadge> : null}
                    {item.sterile_item ? <AppBadge variant="primary">Sterile</AppBadge> : null}
                    {item.high_risk_item ? <AppBadge variant="danger">High-risk</AppBadge> : null}
                    {item.controlled_use ? <AppBadge variant="warning">Controlled-use</AppBadge> : null}
                </div>

                <div className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                        <p className="text-slate-500">Category</p>
                        <p className="mt-1 font-medium text-slate-900">{item.category_name ?? 'Not assigned'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Barcode</p>
                        <p className="mt-1 font-medium text-slate-900">{item.barcode_value ?? 'Not assigned'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Default store</p>
                        <p className="mt-1 font-medium text-slate-900">{item.store_location_name ?? 'Not assigned'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Available</p>
                        <p className="mt-1 font-medium text-slate-900">
                            {(item.available_balance ?? item.current_quantity ?? 0)} {item.unit_of_measure ?? ''}
                        </p>
                    </div>
                </div>

                {footer ? <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">{footer}</div> : null}
            </AppCardContent>
        </AppCard>
    );
}

export function ReceiveSummaryCard({ item }: { item: InventoryWorkflowItemOption | null }) {
    if (!item) {
        return null;
    }

    return (
        <InventoryWorkflowSummaryCard
            item={{
                item_name: item.item_name,
                item_code: item.item_code,
                unit_of_measure: item.unit_of_measure,
                store_location_name: item.store_location_name,
                current_quantity: item.current_quantity,
                available_balance: workflowAvailable(item),
                reorder_level: item.reorder_level,
                is_low_stock: workflowAvailable(item) <= toNumber(item.reorder_level),
            }}
            title="Selected item summary"
            description="Use this as a reference when receiving a batch directly against a chosen item."
            footer={
                <p className="text-sm text-slate-600">
                    Current FEFO-available balance: <span className="font-semibold text-slate-900">{workflowAvailable(item)} {item.unit_of_measure}</span>
                </p>
            }
        />
    );
}

export function IssueStockSummaryCard({ item }: { item: InventoryWorkflowItemOption | null }) {
    if (!item) {
        return null;
    }

    const warnings = item.batches.filter((batch) => ['quarantined', 'damaged', 'expired'].includes(batch.status)).length;

    return (
        <InventoryWorkflowSummaryCard
            item={{
                item_name: item.item_name,
                item_code: item.item_code,
                unit_of_measure: item.unit_of_measure,
                store_location_name: item.store_location_name,
                current_quantity: item.current_quantity,
                available_balance: workflowAvailable(item),
                reorder_level: item.reorder_level,
                is_low_stock: workflowAvailable(item) <= toNumber(item.reorder_level),
            }}
            title="Stock availability"
            description="Review usable balance and batch risk before issuing stock."
            footer={
                <div className="space-y-2 text-sm text-slate-600">
                    <p>Tracked batches: <span className="font-semibold text-slate-900">{item.batches.length}</span></p>
                    <p>Restricted batches: <span className="font-semibold text-slate-900">{warnings}</span></p>
                </div>
            }
        />
    );
}

export function ReturnStockSummaryCard({ item }: { item: InventoryWorkflowItemOption | null }) {
    if (!item) {
        return null;
    }

    return (
        <InventoryWorkflowSummaryCard
            item={{
                item_name: item.item_name,
                item_code: item.item_code,
                unit_of_measure: item.unit_of_measure,
                store_location_name: item.store_location_name,
                current_quantity: item.current_quantity,
                available_balance: workflowAvailable(item),
                reorder_level: item.reorder_level,
                is_low_stock: workflowAvailable(item) <= toNumber(item.reorder_level),
            }}
            title="Return stock summary"
            description="Confirm the item, batch context, and receiving store before posting the return."
        />
    );
}

export function TransferStockComparisonCard({
    fromLabel,
    toLabel,
}: {
    fromLabel: string;
    toLabel: string;
}) {
    return (
        <AppCard>
            <AppCardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary-soft p-3 text-blue-700">
                        <ArrowRightLeft className="h-5 w-5" />
                    </div>
                    <div>
                        <AppCardTitle>From / to layout</AppCardTitle>
                        <AppCardDescription>Check both source and destination before finalizing the stock movement.</AppCardDescription>
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="grid gap-4 p-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">From</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{fromLabel || 'Source not selected'}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">To</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{toLabel || 'Destination not selected'}</p>
                </div>
            </AppCardContent>
        </AppCard>
    );
}

export function AdjustmentSummaryCard({
    title,
    description,
    warning,
}: {
    title: string;
    description: string;
    warning?: string;
}) {
    return (
        <AppCard>
            <AppCardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-warning-soft p-3 text-amber-700">
                        <ClipboardPenLine className="h-5 w-5" />
                    </div>
                    <div>
                        <AppCardTitle>{title}</AppCardTitle>
                        <AppCardDescription>{description}</AppCardDescription>
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="p-6">
                {warning ? (
                    <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{warning}</p>
                    </div>
                ) : (
                    <p className="text-sm text-slate-600">Review system quantities and physical counts carefully before posting the adjustment.</p>
                )}
            </AppCardContent>
        </AppCard>
    );
}
