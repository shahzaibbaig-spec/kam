import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { PrescriptionFormData, PrescriptionFormPageProps, PrescriptionItemFormData } from '@/types/patients';

function emptyItem(): PrescriptionItemFormData {
    return {
        medicine_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        inventory_item_id: '',
        prescribed_quantity: '',
    };
}

export default function PatientPrescriptionFormPage() {
    const { props } = useReactPage<PrescriptionFormPageProps>();
    const { patient, visit, prescription } = props;
    const isEditMode = Boolean(prescription);

    const form = useInertiaForm<PrescriptionFormData>({
        prescription_date: prescription?.prescription_date ? String(prescription.prescription_date).slice(0, 16) : new Date().toISOString().slice(0, 16),
        instructions: prescription?.instructions ?? '',
        printable_notes: prescription?.printable_notes ?? '',
        items:
            prescription?.items?.length
                ? prescription.items.map((item) => ({
                      medicine_name: item.medicine_name ?? '',
                      dosage: item.dosage ?? '',
                      frequency: item.frequency ?? '',
                      duration: item.duration ?? '',
                      instructions: item.instructions ?? '',
                      inventory_item_id: item.inventory_item_id ? String(item.inventory_item_id) : '',
                      prescribed_quantity: item.prescribed_quantity ? String(item.prescribed_quantity) : '',
                  }))
                : [emptyItem()],
    });

    const updateItem = (index: number, key: keyof PrescriptionItemFormData, value: string) => {
        const next = [...form.data.items];
        next[index] = { ...next[index], [key]: value };
        form.setData('items', next);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Patient Care' },
                { label: 'Patients', href: route('patients.index') },
                { label: patient.full_name, href: route('patients.show', patient.id) },
                { label: isEditMode ? 'Edit Prescription' : 'Create Prescription' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950">{isEditMode ? 'Edit Prescription' : 'Create Prescription'}</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                {patient.full_name} | {patient.patient_number} | Visit: {visit.visit_number} | Diagnosis: {visit.diagnosis_summary ?? 'Not recorded'}
                            </p>
                        </div>
                        <AppButton asChild variant="outline">
                            <AppLink href={route('patients.show', patient.id)}>
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
                        if (isEditMode && prescription) {
                            form.patch(route('patients.prescriptions.update', [patient.id, prescription.id]));
                            return;
                        }

                        form.post(route('patients.prescriptions.store', [patient.id, visit.id]));
                    }}
                >
                    <div className="app-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Prescription Header</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Prescription Date/Time</label>
                                <AppInput type="datetime-local" value={form.data.prescription_date} onChange={(event) => form.setData('prescription_date', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up Date</label>
                                <AppInput value={visit.follow_up_date ?? ''} disabled />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">General Instructions</label>
                                <AppTextarea rows={3} value={form.data.instructions} onChange={(event) => form.setData('instructions', event.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">Printable Notes / Advice</label>
                                <AppTextarea rows={3} value={form.data.printable_notes} onChange={(event) => form.setData('printable_notes', event.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="app-card p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Medicines</h2>
                            <AppButton type="button" variant="outline" onClick={() => form.setData('items', [...form.data.items, emptyItem()])}>
                                <Plus className="h-4 w-4" />
                                Add Medicine
                            </AppButton>
                        </div>
                        <div className="mt-4 space-y-4">
                            {form.data.items.map((item, index) => (
                                <div key={`item-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                                        <AppInput placeholder="Medicine name" value={item.medicine_name} onChange={(event) => updateItem(index, 'medicine_name', event.target.value)} />
                                        <AppInput placeholder="Dosage" value={item.dosage} onChange={(event) => updateItem(index, 'dosage', event.target.value)} />
                                        <AppInput placeholder="Frequency" value={item.frequency} onChange={(event) => updateItem(index, 'frequency', event.target.value)} />
                                        <AppInput placeholder="Duration" value={item.duration} onChange={(event) => updateItem(index, 'duration', event.target.value)} />
                                        <AppInput placeholder="Prescribed quantity" type="number" min="0" step="0.01" value={item.prescribed_quantity} onChange={(event) => updateItem(index, 'prescribed_quantity', event.target.value)} />
                                        <AppInput placeholder="Inventory item id (optional)" value={item.inventory_item_id} onChange={(event) => updateItem(index, 'inventory_item_id', event.target.value)} />
                                        <AppInput placeholder="Instructions" value={item.instructions} onChange={(event) => updateItem(index, 'instructions', event.target.value)} />
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <AppButton
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => form.setData('items', form.data.items.length > 1 ? form.data.items.filter((_, i) => i !== index) : [emptyItem()])}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remove
                                        </AppButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={route('patients.show', patient.id)}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" />
                            {isEditMode ? 'Update Prescription' : 'Save Prescription'}
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
