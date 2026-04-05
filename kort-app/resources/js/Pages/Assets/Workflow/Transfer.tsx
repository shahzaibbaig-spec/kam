import { ArrowRightLeft } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AssetSummaryCard, TransferComparisonCard } from '@/Components/domain/assets/AssetCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { AssetOptionRecord, AssetTransferFormData, AssetTransferPageProps } from '@/types/assets';

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

function findLabel(records: AssetOptionRecord[], value: string) {
    return records.find((record) => String(record.id ?? record.value ?? '') === value)?.name
        ?? records.find((record) => String(record.id ?? record.value ?? '') === value)?.label
        ?? null;
}

export default function AssetTransferPage() {
    const { props } = useReactPage<AssetTransferPageProps>();
    const asset = props.asset;
    const form = useInertiaForm<AssetTransferFormData>({
        assignment_type: 'location',
        department_id: '',
        location_id: '',
        assigned_user_id: '',
        room_or_area: '',
        custodian_name: '',
        transfer_datetime: new Date().toISOString().slice(0, 16),
        remarks: '',
    });

    const submit = () => {
        form.post(route('assets.transfer.store', asset.id));
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Assets', href: route('assets.index') }, { label: asset.asset_name, href: route('assets.show', asset.id) }, { label: 'Transfer' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="Transfer Asset"
                    description="Move this asset between departments, locations, rooms, or staff while keeping the custody trail intact."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={route('assets.show', asset.id)}>Back to asset</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <ArrowRightLeft className="h-4 w-4" />
                                Transfer asset
                            </AppButton>
                        </>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                    <div className="space-y-6">
                        <AssetSummaryCard
                            asset={asset}
                            title="Current placement"
                            description="Review the current state before assigning the asset to a new destination."
                        />
                        <TransferComparisonCard
                            asset={asset}
                            destination={{
                                departmentName: findLabel(props.options.departments, form.data.department_id),
                                locationName: findLabel(props.options.locations, form.data.location_id),
                                assignedUserName: findLabel(props.options.users, form.data.assigned_user_id),
                                roomOrArea: form.data.room_or_area,
                                custodianName: form.data.custodian_name,
                                assignmentType: form.data.assignment_type,
                            }}
                        />
                    </div>

                    <AppCard>
                        <AppCardHeader className="border-b border-slate-100">
                            <AppCardTitle>Transfer details</AppCardTitle>
                            <AppCardDescription>Use the destination fields carefully to reduce mistakes during inter-department or room movement.</AppCardDescription>
                        </AppCardHeader>
                        <AppCardContent className="grid gap-5 p-6 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Transfer type</label>
                                <AppSelect value={form.data.assignment_type} onChange={(event) => form.setData('assignment_type', event.target.value)}>
                                    {renderOptions(props.options.assignmentTypes ?? [])}
                                </AppSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Target department</label>
                                <AppSelect value={form.data.department_id} onChange={(event) => form.setData('department_id', event.target.value)}>
                                    <option value="">Select department</option>
                                    {renderOptions(props.options.departments)}
                                </AppSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Target location</label>
                                <AppSelect value={form.data.location_id} onChange={(event) => form.setData('location_id', event.target.value)}>
                                    <option value="">Select location</option>
                                    {renderOptions(props.options.locations)}
                                </AppSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Target user</label>
                                <AppSelect value={form.data.assigned_user_id} onChange={(event) => form.setData('assigned_user_id', event.target.value)}>
                                    <option value="">Select user</option>
                                    {renderOptions(props.options.users)}
                                </AppSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Target room or area</label>
                                <AppInput value={form.data.room_or_area} onChange={(event) => form.setData('room_or_area', event.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Custodian name</label>
                                <AppInput value={form.data.custodian_name} onChange={(event) => form.setData('custodian_name', event.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Transfer date and time</label>
                                <AppInput
                                    type="datetime-local"
                                    value={form.data.transfer_datetime}
                                    onChange={(event) => form.setData('transfer_datetime', event.target.value)}
                                />
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
