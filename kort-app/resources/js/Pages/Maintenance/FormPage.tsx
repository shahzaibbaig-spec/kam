import { ArrowLeft, Save } from 'lucide-react';
import { type ReactNode } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { MaintenanceAssetSummaryCard } from '@/Components/domain/maintenance/MaintenanceCards';
import { AppButton } from '@/Components/ui/AppButton';
import { AppCheckbox } from '@/Components/ui/AppCheckbox';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { asStringValue, hasPermission, toAppSelectOptions } from '@/Lib/forms';
import type { MaintenanceAssetSummary, MaintenanceFormData, MaintenanceFormPageProps } from '@/types/maintenance';

interface MaintenanceFormPageComponentProps {
    mode: 'create' | 'edit';
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <AppCard>
            <AppCardHeader>
                <AppCardTitle>{title}</AppCardTitle>
                <AppCardDescription>{description}</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>{children}</AppCardContent>
        </AppCard>
    );
}

function FormField({
    label,
    children,
    error,
    hint,
    required,
    className,
}: {
    label: string;
    children: ReactNode;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
                {required ? <span className="ml-1 text-rose-600">*</span> : null}
            </label>
            {children}
            {hint ? <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p> : null}
            {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        </div>
    );
}

function assetSummaryFromOptions(assetId: string, props: MaintenanceFormPageProps): MaintenanceAssetSummary | null {
    if (props.selectedAsset && String(props.selectedAsset.id) === String(assetId)) {
        return props.selectedAsset;
    }

    const option = props.options.assets.find((record) => String(record.id) === String(assetId));

    if (!option?.id) {
        return null;
    }

    return {
        id: Number(option.id),
        asset_name: option.name ?? null,
        asset_code: option.code ?? null,
        serial_number: option.serial_number ?? null,
        department_name: option.department_name ?? null,
        location_name: option.location_name ?? null,
        assigned_user_name: null,
        condition_status: null,
        status: null,
    };
}

export default function MaintenanceFormPage({ mode }: MaintenanceFormPageComponentProps) {
    const { props } = useReactPage<MaintenanceFormPageProps>();
    const ticket = props.ticket;
    const permissionNames = props.auth.user?.permissions ?? [];
    const canManage = hasPermission(permissionNames, 'maintenance.manage');
    const backHref = ticket ? route('maintenance.show', ticket.id) : route('maintenance.index');
    const form = useInertiaForm<MaintenanceFormData>({
        asset_id: asStringValue(ticket?.asset_id ?? props.selectedAsset?.id),
        reported_by_id: asStringValue(ticket?.reported_by_id ?? props.auth.user?.id),
        engineer_id: asStringValue(ticket?.engineer_id),
        supplier_id: asStringValue(ticket?.supplier_id),
        ticket_number: ticket?.ticket_number ?? '',
        maintenance_type: ticket?.maintenance_type ?? 'corrective',
        status: ticket?.status ?? 'open',
        fault_report: ticket?.fault_report ?? '',
        started_at: ticket?.started_at ? ticket.started_at.slice(0, 10) : '',
        completed_at: ticket?.completed_at ? ticket.completed_at.slice(0, 10) : '',
        downtime_minutes: asStringValue(ticket?.downtime_minutes),
        cost: asStringValue(ticket?.cost),
        spare_parts_used: ticket?.spare_parts_used ?? [],
        resolution_notes: ticket?.resolution_notes ?? '',
        fit_status: ticket?.fit_status ?? '',
        warranty_claim: ticket?.warranty_claim ?? false,
    });

    const selectedAsset = assetSummaryFromOptions(form.data.asset_id, props);

    const submit = () => {
        if (mode === 'edit' && ticket) {
            form.put(route('maintenance.update', ticket.id));
            return;
        }

        form.post(route('maintenance.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Maintenance', href: route('maintenance.index') },
                { label: mode === 'edit' ? 'Edit Ticket' : 'Create Ticket' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Maintenance Workflow</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                                {mode === 'edit' ? 'Update maintenance ticket' : canManage ? 'Create maintenance ticket' : 'Report equipment issue'}
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Capture equipment context clearly so engineering, stores, and clinical teams can act with less back-and-forth.
                            </p>
                        </div>
                        <AppButton asChild variant="outline">
                            <AppLink href={backHref}>
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </AppLink>
                        </AppButton>
                    </div>
                </div>

                <form
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                    }}
                >
                    <MaintenanceAssetSummaryCard asset={selectedAsset} />

                    <FormSection
                        title="Asset and Context"
                        description="Select the affected equipment and capture who reported the issue."
                    >
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <FormField
                                label="Asset"
                                error={form.errors.asset_id}
                                required
                                className="xl:col-span-2"
                            >
                                <AppSelect
                                    value={form.data.asset_id}
                                    onChange={(event) => form.setData('asset_id', event.target.value)}
                                    options={toAppSelectOptions(props.options.assets, { label: 'Select asset', value: '' })}
                                />
                            </FormField>
                            <FormField
                                label="Ticket Number"
                                error={form.errors.ticket_number}
                                hint="Optional. The system can generate a ticket number automatically."
                            >
                                <AppInput
                                    value={form.data.ticket_number}
                                    onChange={(event) => form.setData('ticket_number', event.target.value)}
                                    placeholder="Leave blank to auto-generate"
                                />
                            </FormField>
                            <FormField label="Reported By" error={form.errors.reported_by_id}>
                                <AppSelect
                                    value={form.data.reported_by_id}
                                    onChange={(event) => form.setData('reported_by_id', event.target.value)}
                                    options={toAppSelectOptions(props.options.users, { label: 'Reported by', value: '' })}
                                />
                            </FormField>
                        </div>
                    </FormSection>

                    <FormSection
                        title="Problem Description"
                        description="Describe the service context and the fault or request in plain operational language."
                    >
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <FormField label="Maintenance Type" error={form.errors.maintenance_type} required>
                                <AppSelect
                                    value={form.data.maintenance_type}
                                    onChange={(event) => form.setData('maintenance_type', event.target.value)}
                                    options={toAppSelectOptions(props.options.types)}
                                />
                            </FormField>
                            <FormField
                                label="Status"
                                error={form.errors.status}
                                required
                                hint={!canManage ? 'Issue reports open as new tickets and are updated by maintenance staff.' : undefined}
                            >
                                <AppSelect
                                    value={form.data.status}
                                    onChange={(event) => form.setData('status', event.target.value)}
                                    options={toAppSelectOptions(props.options.statuses)}
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField label="Warranty Claim" error={form.errors.warranty_claim}>
                                <div className="flex h-11 items-center gap-3 rounded-2xl border border-input bg-white px-4">
                                    <AppCheckbox
                                        checked={form.data.warranty_claim}
                                        onCheckedChange={(checked) => form.setData('warranty_claim', checked === true)}
                                    />
                                    <span className="text-sm text-slate-700">This issue is expected to be handled under warranty</span>
                                </div>
                            </FormField>
                            <FormField label="Assigned To" error={form.errors.engineer_id}>
                                <AppSelect
                                    value={form.data.engineer_id}
                                    onChange={(event) => form.setData('engineer_id', event.target.value)}
                                    options={toAppSelectOptions(props.options.users, { label: 'Assign later', value: '' })}
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField
                                label="Issue Description"
                                error={form.errors.fault_report}
                                className="md:col-span-2 xl:col-span-4"
                            >
                                <AppTextarea
                                    rows={5}
                                    value={form.data.fault_report}
                                    onChange={(event) => form.setData('fault_report', event.target.value)}
                                    placeholder="Describe the fault, symptoms, department impact, and anything the technician should know."
                                />
                            </FormField>
                        </div>
                    </FormSection>

                    <FormSection
                        title="Assignment and Service Details"
                        description="Track supplier, timestamps, downtime, fit result, and material usage where supported."
                    >
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <FormField label="Service Vendor" error={form.errors.supplier_id}>
                                <AppSelect
                                    value={form.data.supplier_id}
                                    onChange={(event) => form.setData('supplier_id', event.target.value)}
                                    options={toAppSelectOptions(props.options.suppliers, { label: 'No external vendor', value: '' })}
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField label="Started At" error={form.errors.started_at}>
                                <AppDateField
                                    value={form.data.started_at}
                                    onChange={(event) => form.setData('started_at', event.target.value)}
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField label="Completed At" error={form.errors.completed_at}>
                                <AppDateField
                                    value={form.data.completed_at}
                                    onChange={(event) => form.setData('completed_at', event.target.value)}
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField label="Downtime (minutes)" error={form.errors.downtime_minutes}>
                                <AppInput
                                    type="number"
                                    min={0}
                                    value={form.data.downtime_minutes}
                                    onChange={(event) => form.setData('downtime_minutes', event.target.value)}
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField label="Cost" error={form.errors.cost}>
                                <AppInput
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.data.cost}
                                    onChange={(event) => form.setData('cost', event.target.value)}
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField label="Fit Status" error={form.errors.fit_status}>
                                <AppSelect
                                    value={form.data.fit_status}
                                    onChange={(event) => form.setData('fit_status', event.target.value)}
                                    options={toAppSelectOptions(props.options.fitStatuses, { label: 'Not recorded', value: '' })}
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField
                                label="Spare Parts Used"
                                error={form.errors.spare_parts_used}
                                className="md:col-span-2 xl:col-span-2"
                            >
                                <AppTextarea
                                    rows={4}
                                    value={form.data.spare_parts_used.join('\n')}
                                    onChange={(event) =>
                                        form.setData(
                                            'spare_parts_used',
                                            event.target.value
                                                .split('\n')
                                                .map((part) => part.trim())
                                                .filter(Boolean),
                                        )
                                    }
                                    placeholder="One part per line"
                                    disabled={!canManage}
                                />
                            </FormField>
                            <FormField
                                label="Resolution Notes"
                                error={form.errors.resolution_notes}
                                className="md:col-span-2 xl:col-span-2"
                            >
                                <AppTextarea
                                    rows={4}
                                    value={form.data.resolution_notes}
                                    onChange={(event) => form.setData('resolution_notes', event.target.value)}
                                    disabled={!canManage}
                                    placeholder="Record work done, calibration outcome, fit result, and follow-up actions."
                                />
                            </FormField>
                        </div>
                    </FormSection>

                    <div className="flex flex-wrap justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={backHref}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" />
                            {mode === 'edit' ? 'Update Ticket' : canManage ? 'Create Ticket' : 'Report Issue'}
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
