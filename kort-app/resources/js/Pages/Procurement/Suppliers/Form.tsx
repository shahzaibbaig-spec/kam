import { ArrowLeft, Save } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { ProcurementFormField, ProcurementFormSection } from '@/Components/domain/procurement/ProcurementForm';
import { AppButton } from '@/Components/ui/AppButton';
import { AppCheckbox } from '@/Components/ui/AppCheckbox';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { asStringValue, toAppSelectOptions } from '@/Lib/procurement';
import { AppLayout } from '@/Layouts/AppLayout';
import type { SupplierFormData, SupplierFormPageProps } from '@/types/procurement';

export default function SupplierFormPage() {
    const { props } = useReactPage<SupplierFormPageProps>();
    const supplier = props.supplier;
    const form = useInertiaForm<SupplierFormData>({
        supplier_code: supplier?.supplier_code ?? '',
        supplier_name: supplier?.supplier_name ?? '',
        supplier_type: supplier?.supplier_type ?? 'mixed',
        contact_person: supplier?.contact_person ?? '',
        phone: supplier?.phone ?? '',
        alternate_phone: supplier?.alternate_phone ?? '',
        email: supplier?.email ?? '',
        address: supplier?.address ?? '',
        city: supplier?.city ?? '',
        country: supplier?.country ?? 'Pakistan',
        tax_number: supplier?.tax_number ?? '',
        registration_number: supplier?.registration_number ?? '',
        payment_terms: supplier?.payment_terms ?? '',
        lead_time_days: asStringValue(supplier?.lead_time_days),
        is_active: supplier?.is_active ?? true,
        notes: supplier?.notes ?? '',
    });

    const backHref = supplier ? route('procurement.suppliers.show', supplier.id) : route('procurement.suppliers.index');

    const submit = () => {
        if (supplier) {
            form.put(route('procurement.suppliers.update', supplier.id));
            return;
        }

        form.post(route('procurement.suppliers.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Suppliers', href: route('procurement.suppliers.index') },
                { label: supplier ? 'Edit Supplier' : 'Add Supplier' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Supplier Setup</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                                {supplier ? 'Edit supplier profile' : 'Register a procurement supplier'}
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Capture supplier identity, contact, commercial terms, and operational readiness in a clean hospital procurement workflow.
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
                    <ProcurementFormSection title="Identity" description="Core supplier identity values used across procurement records and vendor selection.">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <ProcurementFormField label="Supplier Code" hint="Leave blank to auto-generate a supplier code." error={form.errors.supplier_code}>
                                <AppInput value={form.data.supplier_code} onChange={(event) => form.setData('supplier_code', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Supplier Name" required error={form.errors.supplier_name}>
                                <AppInput value={form.data.supplier_name} onChange={(event) => form.setData('supplier_name', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Supplier Type" required error={form.errors.supplier_type}>
                                <AppSelect
                                    value={form.data.supplier_type}
                                    onChange={(event) => form.setData('supplier_type', event.target.value)}
                                    options={toAppSelectOptions(props.options.types)}
                                />
                            </ProcurementFormField>
                        </div>
                    </ProcurementFormSection>

                    <ProcurementFormSection title="Contact" description="Operational contact details used by procurement and receiving teams.">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <ProcurementFormField label="Contact Person" error={form.errors.contact_person}>
                                <AppInput value={form.data.contact_person} onChange={(event) => form.setData('contact_person', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Phone" error={form.errors.phone}>
                                <AppInput value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Alternate Phone" error={form.errors.alternate_phone}>
                                <AppInput value={form.data.alternate_phone} onChange={(event) => form.setData('alternate_phone', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Email" error={form.errors.email}>
                                <AppInput type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                            </ProcurementFormField>
                        </div>
                    </ProcurementFormSection>

                    <ProcurementFormSection title="Address" description="Location details for contracting, deliveries, and invoice validation.">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <ProcurementFormField label="Address" error={form.errors.address} className="md:col-span-2 xl:col-span-3">
                                <AppTextarea rows={3} value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="City" error={form.errors.city}>
                                <AppInput value={form.data.city} onChange={(event) => form.setData('city', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Country" error={form.errors.country}>
                                <AppInput value={form.data.country} onChange={(event) => form.setData('country', event.target.value)} />
                            </ProcurementFormField>
                        </div>
                    </ProcurementFormSection>

                    <ProcurementFormSection title="Commercial" description="Commercial reference data used when evaluating suppliers and issuing orders.">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <ProcurementFormField label="Tax Number" error={form.errors.tax_number}>
                                <AppInput value={form.data.tax_number} onChange={(event) => form.setData('tax_number', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Registration Number" error={form.errors.registration_number}>
                                <AppInput value={form.data.registration_number} onChange={(event) => form.setData('registration_number', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Payment Terms" error={form.errors.payment_terms}>
                                <AppInput value={form.data.payment_terms} onChange={(event) => form.setData('payment_terms', event.target.value)} />
                            </ProcurementFormField>
                            <ProcurementFormField label="Lead Time Days" error={form.errors.lead_time_days}>
                                <AppInput type="number" min={0} value={form.data.lead_time_days} onChange={(event) => form.setData('lead_time_days', event.target.value)} />
                            </ProcurementFormField>
                        </div>
                    </ProcurementFormSection>

                    <ProcurementFormSection title="Notes and Status" description="Final supplier notes and whether the supplier should remain selectable in procurement flows.">
                        <div className="grid gap-5 md:grid-cols-2">
                            <ProcurementFormField label="Notes" error={form.errors.notes}>
                                <AppTextarea rows={5} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                            </ProcurementFormField>
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-5 py-5">
                                <label className="flex items-start gap-3 text-sm text-slate-700">
                                    <AppCheckbox checked={form.data.is_active} onCheckedChange={(checked) => form.setData('is_active', checked === true)} />
                                    <span>
                                        <span className="block font-medium text-slate-900">Supplier is active for procurement</span>
                                        <span className="mt-1 block leading-6 text-slate-500">
                                            Inactive suppliers stay in history but are hidden from new requisition and purchase order selection.
                                        </span>
                                    </span>
                                </label>
                                {form.errors.is_active ? <p className="mt-3 text-sm text-rose-600">{form.errors.is_active}</p> : null}
                            </div>
                        </div>
                    </ProcurementFormSection>

                    <div className="flex flex-wrap justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={backHref}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" />
                            {supplier ? 'Update Supplier' : 'Create Supplier'}
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
