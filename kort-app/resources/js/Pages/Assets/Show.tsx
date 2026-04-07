import { ArrowRightLeft, ClipboardCheck, Pencil, Printer, Tags } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AssetAssignmentCard, AssetHeaderCard, AssetIdentityCard, AssetPurchaseInfoCard, AssetTagCard, AssetTechnicalInfoCard } from '@/Components/domain/assets/AssetCards';
import { AssetHistoryTimeline, AssetMovementTable } from '@/Components/domain/assets/AssetHistory';
import { LabelPreviewCard } from '@/Components/domain/assets/LabelPreviewCard';
import { AssetStatusBadge } from '@/Components/domain/shared/AssetStatusBadge';
import { ConditionBadge } from '@/Components/domain/shared/ConditionBadge';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppTabs } from '@/Components/ui/AppTabs';
import { AppLayout } from '@/Layouts/AppLayout';
import { resolveAssetIdentifier, unwrapResourceRecord } from '@/Lib/assetIdentity';
import type { AssetHistoryTimelineItem, AssetShowPageProps } from '@/types/assets';
import { formatDateTime, formatTitleCase, joinDisplayParts } from '@/Lib/utils';

function buildAssignmentHistoryItems(props: AssetShowPageProps['asset']['assignment_history']): AssetHistoryTimelineItem[] {
    return props.map((assignment) => ({
        id: assignment.id,
        title: joinDisplayParts(
            [assignment.department_name, assignment.location_name, assignment.assigned_user_name, assignment.room_or_area],
            ' / ',
            'General assignment',
        ),
        description: `${formatTitleCase(assignment.assignment_type)} assignment for ${assignment.custodian_name ?? 'an unspecified custodian'}.`,
        meta: formatDateTime(assignment.assigned_at),
        body:
            assignment.remarks ??
            (assignment.expected_return_at ? `Expected return ${formatDateTime(assignment.expected_return_at)}.` : undefined),
        badgeLabel: formatTitleCase(assignment.status),
        badgeVariant: assignment.returned_at ? 'success' : 'primary',
    }));
}

function buildStatusHistoryItems(props: AssetShowPageProps['asset']['status_history']): AssetHistoryTimelineItem[] {
    return props.map((status) => ({
        id: status.id,
        title: `${formatTitleCase(status.old_status ?? 'Initial')} to ${formatTitleCase(status.new_status)}`,
        description: `Condition changed from ${formatTitleCase(status.old_condition ?? 'Not set')} to ${formatTitleCase(status.new_condition ?? 'Not set')}.`,
        meta: `${status.changed_by ?? 'System'} • ${formatDateTime(status.changed_at)}`,
        body: status.reason ?? undefined,
        badgeLabel: formatTitleCase(status.new_status),
        badgeVariant: 'outline',
    }));
}

export default function AssetShowPage() {
    const { props } = useReactPage<AssetShowPageProps>();
    const asset = unwrapResourceRecord<AssetShowPageProps['asset']>(props.asset) ?? ({} as AssetShowPageProps['asset']);
    const { permissions, labelPreview } = props;
    const movementHistory = Array.isArray(asset.movement_history) ? asset.movement_history : [];
    const assignmentHistory = Array.isArray(asset.assignment_history) ? asset.assignment_history : [];
    const statusHistory = Array.isArray(asset.status_history) ? asset.status_history : [];
    const assetId = resolveAssetIdentifier(props.asset);

    return (
        <AppLayout breadcrumbs={[{ label: 'Assets', href: route('assets.index') }, { label: asset.asset_name }]}>
            <div className="space-y-6">
                <PageHeader
                    title={asset.asset_name}
                    description={`Track identity, custody, status, and movement history for ${asset.asset_code}.`}
                    meta={
                        <div className="flex flex-wrap gap-2">
                            <AssetStatusBadge value={asset.asset_status} />
                            <ConditionBadge value={asset.condition_status} />
                        </div>
                    }
                    actions={
                        <>
                            {permissions.edit && assetId !== null ? (
                                <AppButton asChild>
                                    <AppLink href={route('assets.edit', assetId)}>
                                        <Pencil className="h-4 w-4" />
                                        Edit asset
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.generate_tag && !asset.tag_number && assetId !== null ? (
                                <AppButton asChild variant="soft">
                                    <AppLink href={route('assets.tags.create', assetId)}>
                                        <Tags className="h-4 w-4" />
                                        Generate tag
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.regenerate_tag && asset.tag_number && assetId !== null ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('assets.tags.create', assetId)}>
                                        <Tags className="h-4 w-4" />
                                        Re-generate tag
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.print_label && asset.tag_number && assetId !== null ? (
                                <AppButton asChild variant="outline">
                                    <a href={route('assets.labels.show', assetId)} target="_blank" rel="noreferrer">
                                        <Printer className="h-4 w-4" />
                                        Print label
                                    </a>
                                </AppButton>
                            ) : null}
                            {permissions.issue && assetId !== null ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('assets.issue.create', assetId)}>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Issue
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.return && asset.active_assignment && assetId !== null ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('assets.return.create', assetId)}>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Return
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.transfer && assetId !== null ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('assets.transfer.create', assetId)}>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Transfer
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.change_status && assetId !== null ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('assets.status.create', assetId)}>
                                        <ClipboardCheck className="h-4 w-4" />
                                        Change status
                                    </AppLink>
                                </AppButton>
                            ) : null}
                        </>
                    }
                />

                <AssetHeaderCard asset={asset} />

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <AssetIdentityCard asset={asset} />
                        <AssetAssignmentCard asset={asset} />
                        <AssetPurchaseInfoCard asset={asset} />
                    </div>
                    <div className="space-y-6">
                        <AssetTechnicalInfoCard asset={asset} />
                        <AssetTagCard asset={asset} labelPreview={labelPreview} />
                        {labelPreview ? (
                            <LabelPreviewCard
                                label={labelPreview}
                                printedCount={asset.active_tag?.printed_count ?? 0}
                                lastPrintedAt={asset.active_tag?.last_printed_at}
                            />
                        ) : (
                            <AppCard>
                                <AppCardHeader className="border-b border-slate-100">
                                    <AppCardTitle>Label preview</AppCardTitle>
                                    <AppCardDescription>Generate an active tag to unlock barcode and QR print previews for this asset.</AppCardDescription>
                                </AppCardHeader>
                                <AppCardContent className="p-6 text-sm text-slate-600">
                                    No active label preview is available yet.
                                </AppCardContent>
                            </AppCard>
                        )}
                    </div>
                </div>

                <AppCard>
                    <AppCardHeader className="border-b border-slate-100">
                        <AppCardTitle>Asset history</AppCardTitle>
                        <AppCardDescription>
                            Review movement, assignment, and status changes in one place for audit visibility and operational follow-up.
                        </AppCardDescription>
                    </AppCardHeader>
                    <AppCardContent className="p-6">
                        <AppTabs
                            items={[
                                {
                                    value: 'movements',
                                    label: `Movement history (${movementHistory.length})`,
                                    content: <AssetMovementTable items={movementHistory} />,
                                },
                                {
                                    value: 'assignments',
                                    label: `Assignment history (${assignmentHistory.length})`,
                                    content: (
                                        <AssetHistoryTimeline
                                            items={buildAssignmentHistoryItems(assignmentHistory)}
                                            emptyTitle="No assignment history"
                                            emptyDescription="Assignments will appear here once this asset is issued, transferred, or returned."
                                        />
                                    ),
                                },
                                {
                                    value: 'statuses',
                                    label: `Status history (${statusHistory.length})`,
                                    content: (
                                        <AssetHistoryTimeline
                                            items={buildStatusHistoryItems(statusHistory)}
                                            emptyTitle="No status changes recorded"
                                            emptyDescription="Status updates will appear here when the asset condition or operational state changes."
                                        />
                                    ),
                                },
                            ]}
                        />
                    </AppCardContent>
                </AppCard>

                <AppCard>
                    <AppCardHeader className="border-b border-slate-100">
                        <AppCardTitle>Quick identity snapshot</AppCardTitle>
                        <AppCardDescription>A compact operational summary for staff who need the essentials at a glance.</AppCardDescription>
                    </AppCardHeader>
                    <AppCardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <p className="text-sm text-slate-500">Tag</p>
                            <p className="mt-1 font-medium text-slate-900">{asset.tag_number ?? 'Not generated'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Barcode / QR</p>
                            <p className="mt-1 font-medium text-slate-900">{asset.barcode_value ?? asset.qr_value ?? 'Not generated'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Supplier</p>
                            <p className="mt-1 font-medium text-slate-900">{asset.supplier_name ?? 'Not linked'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Placement</p>
                            <p className="mt-1 font-medium text-slate-900">
                                {joinDisplayParts([asset.department_name, asset.location_name, asset.room_or_area], ' / ', 'Not assigned')}
                            </p>
                        </div>
                    </AppCardContent>
                </AppCard>
            </div>
        </AppLayout>
    );
}
