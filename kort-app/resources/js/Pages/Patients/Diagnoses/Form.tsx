import { ArrowLeft, Save } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { asStringValue } from '@/Lib/forms';
import { AppLayout } from '@/Layouts/AppLayout';
import type { DiagnosisFormData, DiagnosisFormPageProps } from '@/types/patients';

export default function PatientDiagnosisFormPage() {
    const { props } = useReactPage<DiagnosisFormPageProps>();
    const diagnosis = props.diagnosis ?? null;
    const pendingVisit = props.pendingVisit ?? null;
    const { patient } = props;

    const form = useInertiaForm<DiagnosisFormData>({
        visit_id: asStringValue(diagnosis?.visit_id ?? pendingVisit?.id),
        admission_id: asStringValue(diagnosis?.admission_id ?? pendingVisit?.admission_id),
        visit_date: diagnosis?.visit_date ?? pendingVisit?.visit_date ?? new Date().toISOString().slice(0, 16),
        visit_type: diagnosis?.visit_type ?? pendingVisit?.visit_type ?? 'opd',
        doctor_id: asStringValue(diagnosis?.doctor_id ?? pendingVisit?.doctor_id ?? props.auth.user?.id),
        chief_complaint: diagnosis?.chief_complaint ?? pendingVisit?.chief_complaint ?? '',
        vitals: diagnosis?.vitals ?? pendingVisit?.vitals ?? '',
        notes: diagnosis?.notes ?? pendingVisit?.notes ?? '',
        diagnosis: diagnosis?.diagnosis ?? '',
        clinical_notes: diagnosis?.clinical_notes ?? '',
        severity: diagnosis?.severity ?? '',
        follow_up_date: diagnosis?.follow_up_date ?? '',
    });

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Patient Care' },
                { label: 'Patients', href: route('patients.index') },
                { label: patient.full_name, href: route('patients.show', patient.id) },
                { label: diagnosis ? 'Edit Diagnosis' : 'Create Diagnosis' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950">{diagnosis ? 'Edit Diagnosis' : 'Create Diagnosis'}</h1>
                            <p className="mt-2 text-sm text-slate-600">{patient.full_name} | {patient.patient_number} | {patient.cnic ?? 'No CNIC'}</p>
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
                    className="app-card p-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (diagnosis) {
                            form.put(route('patients.diagnoses.update', [patient.id, diagnosis.id]));
                            return;
                        }

                        form.post(route('patients.diagnoses.store', patient.id));
                    }}
                >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Admission</label>
                            <AppSelect
                                value={form.data.admission_id}
                                onChange={(event) => form.setData('admission_id', event.target.value)}
                                options={[
                                    { label: 'No admission (OPD)', value: '' },
                                    ...props.options.admissions.map((entry) => ({ label: `${entry.admission_number}`, value: entry.id })),
                                ]}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Visit Date/Time</label>
                            <AppInput type="datetime-local" value={form.data.visit_date} onChange={(event) => form.setData('visit_date', event.target.value)} />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Visit Type</label>
                            <AppSelect
                                value={form.data.visit_type}
                                onChange={(event) => form.setData('visit_type', event.target.value)}
                                options={props.options.visitTypes.map((entry) => ({ label: entry.label, value: entry.value }))}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Doctor</label>
                            <AppSelect
                                value={form.data.doctor_id}
                                onChange={(event) => form.setData('doctor_id', event.target.value)}
                                options={props.options.doctors.map((entry) => ({ label: entry.name, value: entry.id }))}
                            />
                        </div>
                        <div className="md:col-span-2 xl:col-span-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Chief Complaint</label>
                            <AppTextarea rows={3} value={form.data.chief_complaint} onChange={(event) => form.setData('chief_complaint', event.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Vitals</label>
                            <AppTextarea rows={3} value={form.data.vitals} onChange={(event) => form.setData('vitals', event.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Visit Notes</label>
                            <AppTextarea rows={3} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                        </div>
                        <div className="md:col-span-2 xl:col-span-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Diagnosis</label>
                            <AppTextarea rows={3} value={form.data.diagnosis} onChange={(event) => form.setData('diagnosis', event.target.value)} />
                        </div>
                        <div className="md:col-span-2 xl:col-span-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Clinical Notes</label>
                            <AppTextarea rows={3} value={form.data.clinical_notes} onChange={(event) => form.setData('clinical_notes', event.target.value)} />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Severity</label>
                            <AppSelect
                                value={form.data.severity}
                                onChange={(event) => form.setData('severity', event.target.value)}
                                options={[{ label: 'Not specified', value: '' }, ...props.options.severities.map((entry) => ({ label: entry.label, value: entry.value }))]}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up Date</label>
                            <AppInput type="date" value={form.data.follow_up_date} onChange={(event) => form.setData('follow_up_date', event.target.value)} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={route('patients.show', patient.id)}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" />
                            {diagnosis ? 'Update Diagnosis' : 'Save Diagnosis'}
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
