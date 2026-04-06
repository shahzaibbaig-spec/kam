import { Undo2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { ReturnSummaryCard } from '@/Components/domain/assets/AssetCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { AssetOptionRecord, AssetReturnFormData, AssetReturnPageProps } from '@/types/assets';

function renderOptions(records: AssetOptionRecord[]) {
    return records.map((record) => {
        const value = record.id ?? record.value ?? '';
        const label = record.name ?? record.label ?? '';

        return (
            <option key={`${value}-${label}`} value={value}>
                {label}
            </option>
        );
    });
}

export default function AssetReturnPage() {
    const { props } = useReactPage<AssetReturnPageProps>();
    const asset = props.asset;
    const assetWithLegacyId = asset as { asset_id?: number | null };
    const assetId =
        typeof asset.id === 'number'
            ? asset.id
            : typeof assetWithLegacyId.asset_id === 'number'
              ? assetWithLegacyId.asset_id
              : null;
    const form = useInertiaForm<AssetReturnFormData>({
        returned_at: new Date().toISOString().slice(0, 16),
        return_condition: asset.condition_status,
        return_to_department_id: '',
        return_to_location_id: '',
        return_to_room_or_area: '',
        post_return_status: 'available',
        remarks: '',
    });

    const submit = () => {
        if (assetId === null) {
            return;
        }

        form.post(route('assets.return.store', assetId));
    };

    const returnStatusOptions = props.options.assetStatuses.filter((status) =>
        ['available', 'under_cleaning', 'out_of_order'].includes(status.value ?? ''),
    );

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Assets', href: route('assets.index') },
                { label: asset.asset_name, href: assetId !== null ? route('assets.show', assetId) : route('assets.index') },
                { label: 'Return' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Return Asset"
                    description="Close the active assignment and place this asset back into controlled availability or post-return processing."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={assetId !== null ? route('assets.show', assetId) : route('assets.index')}>Back to asset</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing} disabled={assetId === null}>
                                <Undo2 className="h-4 w-4" />
                                Return asset
                            </AppButton>
                        </>
                    }
                />

                {assetId === null ? (
                    <AppAlert
                        variant="danger"
                        title="Asset identifier is missing"
                        description="This record is missing its internal identifier, so return processing cannot continue from this page."
                    />
                ) : null}

                <AppAlert
                    variant="info"
                    title="Confirm the return destination and condition"
                    description="A return updates custody and may also change the post-return operational status. Review both carefully."
                />

                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                    <ReturnSummaryCard asset={asset} />

                    <AppCard>
                        <AppCardHeader className="border-b border-slate-100">
                            <AppCardTitle>Return details</AppCardTitle>
                            <AppCardDescription>Capture the return condition and destination clearly so the asset is ready for its next workflow step.</AppCardDescription>
                        </AppCardHeader>
                        <AppCardContent className="grid gap-5 p-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Returned at</label>
                                <AppInput type="datetime-local" value={form.data.returned_at} onChange={(event) => form.setData('returned_at', event.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Return condition</label>
                                <AppSelect value={form.data.return_condition} onChange={(event) => form.setData('return_condition', event.target.value)}>
                                    {renderOptions(props.options.conditionStatuses)}
                                </AppSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Return to department</label>
                                <AppSelect
                                    value={form.data.return_to_department_id}
                                    onChange={(event) => form.setData('return_to_department_id', event.target.value)}
                                >
                                    <option value="">Keep current department</option>
                                    {renderOptions(props.options.departments)}
                                </AppSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Return to location</label>
                                <AppSelect value={form.data.return_to_location_id} onChange={(event) => form.setData('return_to_location_id', event.target.value)}>
                                    <option value="">Keep current location</option>
                                    {renderOptions(props.options.locations)}
                                </AppSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Return to room</label>
                                <AppInput
                                    value={form.data.return_to_room_or_area}
                                    onChange={(event) => form.setData('return_to_room_or_area', event.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Post-return status</label>
                                <AppSelect value={form.data.post_return_status} onChange={(event) => form.setData('post_return_status', event.target.value)}>
                                    {renderOptions(returnStatusOptions)}
                                </AppSelect>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Remarks</label>
                                <AppTextarea rows={5} value={form.data.remarks} onChange={(event) => form.setData('remarks', event.target.value)} />
                            </div>
                        </AppCardContent>
                    </AppCard>
                </div>
            </div>
        </AppLayout>
    );
}
