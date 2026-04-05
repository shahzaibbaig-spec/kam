import { ArrowRightLeft } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { IssueSummaryCard } from '@/Components/domain/assets/AssetCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { AssetIssueFormData, AssetIssuePageProps, AssetOptionRecord } from '@/types/assets';

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

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-sm text-rose-600">{message}</p> : null;
}

export default function AssetIssuePage() {
    const { props } = useReactPage<AssetIssuePageProps>();
    const asset = props.asset;
    const form = useInertiaForm<AssetIssueFormData>({
        assignment_type: 'department',
        department_id: '',
        location_id: '',
        assigned_user_id: '',
        room_or_area: '',
        custodian_name: '',
        issued_at: new Date().toISOString().slice(0, 16),
        expected_return_at: '',
        remarks: '',
    });

    const showsWarning = asset.asset_status !== 'available';

    const submit = () => {
        form.post(route('assets.issue.store', asset.id));
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Assets', href: route('assets.index') }, { label: asset.asset_name, href: route('assets.show', asset.id) }, { label: 'Issue' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="Issue Asset"
                    description="Assign this asset to a department, room, location, or staff member with a clear, auditable handoff."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={route('assets.show', asset.id)}>Back to asset</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing}>
                                <ArrowRightLeft className="h-4 w-4" />
                                Issue asset
                            </AppButton>
                        </>
                    }
                />

                {showsWarning ? (
                    <AppAlert
                        variant="warning"
                        title="This asset may not be in a typical issue state"
                        description={`The current status is ${asset.asset_status}. Review the summary below before continuing.`}
                    />
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                    <IssueSummaryCard asset={asset} />

                    <AppCard>
                        <AppCardHeader className="border-b border-slate-100">
                            <AppCardTitle>Issue details</AppCardTitle>
                            <AppCardDescription>Choose the issue type and destination carefully to keep custody records accurate.</AppCardDescription>
                        </AppCardHeader>
                        <AppCardContent className="grid gap-5 p-6 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Issue type</label>
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
                                <FieldError message={form.errors.department_id} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Target location</label>
                                <AppSelect value={form.data.location_id} onChange={(event) => form.setData('location_id', event.target.value)}>
                                    <option value="">Select location</option>
                                    {renderOptions(props.options.locations)}
                                </AppSelect>
                                <FieldError message={form.errors.location_id} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Target user</label>
                                <AppSelect value={form.data.assigned_user_id} onChange={(event) => form.setData('assigned_user_id', event.target.value)}>
                                    <option value="">Select user</option>
                                    {renderOptions(props.options.users)}
                                </AppSelect>
                                <FieldError message={form.errors.assigned_user_id} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Room or area</label>
                                <AppInput value={form.data.room_or_area} onChange={(event) => form.setData('room_or_area', event.target.value)} />
                                <FieldError message={form.errors.room_or_area} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Custodian name</label>
                                <AppInput value={form.data.custodian_name} onChange={(event) => form.setData('custodian_name', event.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Issued at</label>
                                <AppInput type="datetime-local" value={form.data.issued_at} onChange={(event) => form.setData('issued_at', event.target.value)} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Expected return date</label>
                                <AppInput
                                    type="datetime-local"
                                    value={form.data.expected_return_at}
                                    onChange={(event) => form.setData('expected_return_at', event.target.value)}
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
