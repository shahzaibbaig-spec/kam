import { motion } from 'framer-motion';
import { Building2, CalendarClock, CreditCard, Fingerprint, MapPinned, Package, QrCode, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AssetStatusBadge } from '@/Components/domain/shared/AssetStatusBadge';
import { ConditionBadge } from '@/Components/domain/shared/ConditionBadge';
import type { AssetDetailModel, AssetLabelPreview, AssetTransferPreview } from '@/types/assets';
import { formatCurrency, formatDateTime, formatShortDate, formatTitleCase, joinDisplayParts } from '@/Lib/utils';

interface InfoItem {
    label: string;
    value: ReactNode;
}

interface AssetInfoCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    items: InfoItem[];
}

function AssetInfoCard({ title, description, icon: Icon, items }: AssetInfoCardProps) {
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

interface AssetSummaryLike {
    asset_name: string;
    asset_code: string;
    category_name?: string | null;
    tag_number?: string | null;
    department_name?: string | null;
    location_name?: string | null;
    assigned_user_name?: string | null;
    asset_status: string;
    condition_status: string;
}

export interface AssetHeaderCardProps {
    asset: AssetDetailModel;
}

export function AssetHeaderCard({ asset }: AssetHeaderCardProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
            <AppCard className="overflow-hidden border-blue-100">
                <AppCardContent className="p-0">
                    <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-5 p-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <AppBadge variant="outline">{asset.asset_uuid ?? 'Asset record'}</AppBadge>
                                <AssetStatusBadge value={asset.asset_status} />
                                <ConditionBadge value={asset.condition_status} />
                            </div>

                            <div>
                                <h1 className="text-3xl font-semibold text-slate-950">{asset.asset_name}</h1>
                                <p className="mt-2 text-sm text-slate-600">
                                    {asset.asset_code} {asset.category_name ? `• ${asset.category_name}` : ''}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Placement</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">
                                        {joinDisplayParts([asset.department_name, asset.location_name], ' / ', 'Location not assigned')}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">{asset.room_or_area ?? 'Room or area not set'}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Custody</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{asset.assigned_user_name ?? 'No active assignee'}</p>
                                    <p className="mt-1 text-sm text-slate-600">{asset.custodian_name ?? 'Custodian not recorded'}</p>
                                </div>
                            </div>

                            {asset.notes ? (
                                <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-700">
                                    {asset.notes}
                                </div>
                            ) : null}
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50/70 p-6 lg:border-l lg:border-t-0">
                            {asset.image_url ? (
                                <img
                                    src={asset.image_url}
                                    alt={asset.asset_name}
                                    className="h-full max-h-[260px] w-full rounded-[1.75rem] border border-slate-200 object-cover shadow-sm"
                                />
                            ) : (
                                <div className="grid h-full min-h-[240px] place-items-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white text-center">
                                    <div className="space-y-3 px-8">
                                        <div className="mx-auto w-fit rounded-2xl bg-primary-soft p-3 text-blue-700">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <p className="text-base font-semibold text-slate-900">No asset image uploaded</p>
                                        <p className="text-sm text-slate-500">Upload a photo in the asset form to help staff identify equipment visually.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </AppCardContent>
            </AppCard>
        </motion.div>
    );
}

export interface AssetIdentityCardProps {
    asset: AssetDetailModel;
}

export function AssetIdentityCard({ asset }: AssetIdentityCardProps) {
    return (
        <AssetInfoCard
            title="Basic information"
            description="Core identity and traceability details used during lookup, audit, and tagging."
            icon={Fingerprint}
            items={[
                { label: 'Asset code', value: asset.asset_code },
                { label: 'Tag number', value: asset.tag_number ?? 'Not generated' },
                { label: 'Category', value: asset.category_name ?? 'Not assigned' },
                { label: 'Category code', value: asset.category_code ?? 'Not available' },
                { label: 'Serial number', value: asset.serial_number ?? 'Not captured' },
                { label: 'Barcode / QR value', value: asset.barcode_value ?? asset.qr_value ?? 'Not generated' },
            ]}
        />
    );
}

export interface AssetAssignmentCardProps {
    asset: AssetDetailModel;
}

export function AssetAssignmentCard({ asset }: AssetAssignmentCardProps) {
    return (
        <AssetInfoCard
            title="Assignment information"
            description="Where the asset sits now and who is responsible for it operationally."
            icon={MapPinned}
            items={[
                { label: 'Department', value: asset.department_name ?? 'Not assigned' },
                { label: 'Location', value: asset.location_name ?? 'Not assigned' },
                { label: 'Room or area', value: asset.room_or_area ?? 'Not assigned' },
                { label: 'Assigned user', value: asset.assigned_user_name ?? 'No active assignee' },
                { label: 'Assigned department', value: asset.assigned_department_name ?? 'Not assigned' },
                { label: 'Assigned location', value: asset.assigned_location_name ?? 'Not assigned' },
                { label: 'Custodian', value: asset.custodian_name ?? 'Not specified' },
                { label: 'Last issued', value: formatDateTime(asset.last_issued_at) },
                { label: 'Last returned', value: formatDateTime(asset.last_returned_at) },
            ]}
        />
    );
}

export interface AssetTechnicalInfoCardProps {
    asset: AssetDetailModel;
}

export function AssetTechnicalInfoCard({ asset }: AssetTechnicalInfoCardProps) {
    return (
        <AssetInfoCard
            title="Technical information"
            description="Manufacturer, model, and encoded values used during maintenance and support handling."
            icon={ShieldCheck}
            items={[
                { label: 'Brand', value: asset.brand ?? 'Not captured' },
                { label: 'Model', value: asset.model ?? 'Not captured' },
                { label: 'Manufacturer', value: asset.manufacturer ?? 'Not captured' },
                { label: 'Supplier', value: asset.supplier_name ?? 'Not linked' },
                { label: 'Barcode value', value: asset.barcode_value ?? 'Not generated' },
                { label: 'QR value', value: asset.qr_value ?? 'Not generated' },
            ]}
        />
    );
}

export interface AssetPurchaseInfoCardProps {
    asset: AssetDetailModel;
}

export function AssetPurchaseInfoCard({ asset }: AssetPurchaseInfoCardProps) {
    return (
        <AssetInfoCard
            title="Purchase and warranty"
            description="Procurement and lifecycle fields that support audit, warranty, and depreciation reviews."
            icon={CreditCard}
            items={[
                { label: 'Purchase date', value: formatShortDate(asset.purchase_date) },
                { label: 'Purchase cost', value: formatCurrency(asset.purchase_cost) },
                { label: 'Warranty start', value: formatShortDate(asset.warranty_start) },
                { label: 'Warranty end', value: formatShortDate(asset.warranty_end) },
                { label: 'Depreciation method', value: asset.depreciation_method ?? 'Not captured' },
                { label: 'Useful life', value: asset.useful_life_years ? `${asset.useful_life_years} years` : 'Not captured' },
                { label: 'Residual value', value: formatCurrency(asset.residual_value) },
            ]}
        />
    );
}

export interface AssetTagCardProps {
    asset: AssetDetailModel;
    labelPreview: AssetLabelPreview | null;
}

export function AssetTagCard({ asset, labelPreview }: AssetTagCardProps) {
    return (
        <AssetInfoCard
            title="Tag and scan information"
            description="Print history and encoded identification values currently linked to this record."
            icon={QrCode}
            items={[
                { label: 'Current tag', value: asset.tag_number ?? 'No active tag' },
                { label: 'Printed count', value: asset.active_tag?.printed_count ?? 0 },
                { label: 'Last printed', value: formatDateTime(asset.active_tag?.last_printed_at) },
                { label: 'Label preview', value: labelPreview ? 'Available' : 'Not available' },
            ]}
        />
    );
}

export interface AssetSummaryCardProps {
    asset: AssetSummaryLike;
    title?: string;
    description?: string;
    footer?: ReactNode;
}

export function AssetSummaryCard({
    asset,
    title = 'Asset summary',
    description = 'A concise snapshot of the selected asset before proceeding.',
    footer,
}: AssetSummaryCardProps) {
    return (
        <AppCard className="border-blue-100">
            <AppCardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary-soft p-3 text-blue-700">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <AppCardTitle>{title}</AppCardTitle>
                        <AppCardDescription>{description}</AppCardDescription>
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="space-y-5 p-6">
                <div>
                    <p className="text-lg font-semibold text-slate-950">{asset.asset_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{asset.asset_code}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <AssetStatusBadge value={asset.asset_status} />
                    <ConditionBadge value={asset.condition_status} />
                    <AppBadge variant="outline">{asset.tag_number ?? 'Tag pending'}</AppBadge>
                </div>

                <div className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                        <p className="text-slate-500">Category</p>
                        <p className="mt-1 font-medium text-slate-900">{asset.category_name ?? 'Not assigned'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Assigned user</p>
                        <p className="mt-1 font-medium text-slate-900">{asset.assigned_user_name ?? 'No active assignee'}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-slate-500">Current location</p>
                        <p className="mt-1 font-medium text-slate-900">
                            {joinDisplayParts([asset.department_name, asset.location_name], ' / ', 'Not assigned')}
                        </p>
                    </div>
                </div>

                {footer ? <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">{footer}</div> : null}
            </AppCardContent>
        </AppCard>
    );
}

export interface IssueSummaryCardProps {
    asset: AssetDetailModel;
}

export function IssueSummaryCard({ asset }: IssueSummaryCardProps) {
    return (
        <AssetSummaryCard
            asset={asset}
            title="Current asset snapshot"
            description="Confirm the current operating state before issuing the asset to a department, room, or staff member."
            footer={
                <div className="grid gap-3 text-sm text-slate-600">
                    <p>
                        Current assignment: <span className="font-medium text-slate-900">{asset.assigned_user_name ?? asset.custodian_name ?? 'No active assignee'}</span>
                    </p>
                    <p>
                        Current room: <span className="font-medium text-slate-900">{asset.room_or_area ?? 'Not specified'}</span>
                    </p>
                </div>
            }
        />
    );
}

export interface ReturnSummaryCardProps {
    asset: AssetDetailModel;
}

export function ReturnSummaryCard({ asset }: ReturnSummaryCardProps) {
    return (
        <AssetSummaryCard
            asset={asset}
            title="Assignment summary"
            description="Review the active assignment details before completing the return."
            footer={
                <div className="grid gap-3 text-sm text-slate-600">
                    <p>
                        Assignment type:{' '}
                        <span className="font-medium text-slate-900">{formatTitleCase(asset.active_assignment?.assignment_type ?? 'Not recorded')}</span>
                    </p>
                    <p>
                        Assigned at: <span className="font-medium text-slate-900">{formatDateTime(asset.active_assignment?.assigned_at)}</span>
                    </p>
                    <p>
                        Current custodian: <span className="font-medium text-slate-900">{asset.active_assignment?.custodian_name ?? 'Not specified'}</span>
                    </p>
                </div>
            }
        />
    );
}

export interface TransferComparisonCardProps {
    asset: AssetDetailModel;
    destination: AssetTransferPreview;
}

function TransferBlock({
    title,
    icon: Icon,
    department,
    location,
    user,
    room,
    custodian,
}: {
    title: string;
    icon: LucideIcon;
    department?: string | null;
    location?: string | null;
    user?: string | null;
    room?: string | null;
    custodian?: string | null;
}) {
    return (
        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-white p-2 text-blue-700 shadow-sm">
                    <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-950">{title}</p>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Department: <span className="font-medium text-slate-900">{department ?? 'Not selected'}</span></p>
                <p>Location: <span className="font-medium text-slate-900">{location ?? 'Not selected'}</span></p>
                <p>User: <span className="font-medium text-slate-900">{user ?? 'Not selected'}</span></p>
                <p>Room / area: <span className="font-medium text-slate-900">{room ?? 'Not specified'}</span></p>
                <p>Custodian: <span className="font-medium text-slate-900">{custodian ?? 'Not specified'}</span></p>
            </div>
        </div>
    );
}

export function TransferComparisonCard({ asset, destination }: TransferComparisonCardProps) {
    return (
        <AppCard>
            <AppCardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary-soft p-3 text-blue-700">
                        <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                        <AppCardTitle>From / to comparison</AppCardTitle>
                        <AppCardDescription>Review the current placement against the new destination before submitting the transfer.</AppCardDescription>
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="grid gap-4 p-6 lg:grid-cols-2">
                <TransferBlock
                    title="Current placement"
                    icon={Building2}
                    department={asset.assigned_department_name ?? asset.department_name}
                    location={asset.assigned_location_name ?? asset.location_name}
                    user={asset.assigned_user_name}
                    room={asset.room_or_area}
                    custodian={asset.custodian_name}
                />
                <TransferBlock
                    title="Destination"
                    icon={UserRound}
                    department={destination.departmentName}
                    location={destination.locationName}
                    user={destination.assignedUserName}
                    room={destination.roomOrArea}
                    custodian={destination.custodianName}
                />
            </AppCardContent>
        </AppCard>
    );
}
