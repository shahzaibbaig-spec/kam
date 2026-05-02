import { ArrowLeft, Save } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { AdmissionFormData, AdmissionFormPageProps } from '@/types/patients';

export default function PatientAdmissionFormPage() {
    const { props } = useReactPage<AdmissionFormPageProps>();
    const { patient } = props;

    const form = useInertiaForm<AdmissionFormData>({
        admission_date: new Date().toISOString().slice(0, 10),
        admission_time: new Date().toISOString().slice(11, 16),
        department_id: '',
        ward_id: '',
        room_id: '',
        bed_id: '',
        attending_doctor_id: '',
        admission_reason: '',
        initial_condition: '',
        status: 'admitted',
        discharge_date: '',
        discharge_summary: '',
    });

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Patient Care' },
                { label: 'Patients', href: route('patients.index') },
                { label: patient.full_name, href: route('patients.show', patient.id) },
                { label: 'Admit Patient' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950">Admit Patient</h1>
                            <p className="mt-2 text-sm text-slate-600">{patient.full_name} | {patient.patient_number} | CNIC: {patient.cnic ?? 'Not recorded'}</p>
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
                        form.post(route('patients.admissions.store', patient.id));
                    }}
                >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Admission Date</label>
                            <AppDateField value={form.data.admission_date} onChange={(event) => form.setData('admission_date', event.target.value)} />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Admission Time</label>
                            <AppInput type="time" value={form.data.admission_time} onChange={(event) => form.setData('admission_time', event.target.value)} />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
                            <AppSelect
                                value={form.data.department_id}
                                onChange={(event) => form.setData('department_id', event.target.value)}
                                options={[{ label: 'Select department', value: '' }, ...props.options.departments.map((d) => ({ label: d.name, value: d.id }))]}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Attending Doctor</label>
                            <AppSelect
                                value={form.data.attending_doctor_id}
                                onChange={(event) => form.setData('attending_doctor_id', event.target.value)}
                                options={[{ label: 'Select doctor', value: '' }, ...props.options.doctors.map((d) => ({ label: d.name, value: d.id }))]}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Ward</label>
                            <AppSelect
                                value={form.data.ward_id}
                                onChange={(event) => form.setData('ward_id', event.target.value)}
                                options={[{ label: 'Select ward', value: '' }, ...props.options.locations.map((l) => ({ label: l.name, value: l.id }))]}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Room</label>
                            <AppSelect
                                value={form.data.room_id}
                                onChange={(event) => form.setData('room_id', event.target.value)}
                                options={[{ label: 'Select room', value: '' }, ...props.options.locations.map((l) => ({ label: l.name, value: l.id }))]}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Bed</label>
                            <AppSelect
                                value={form.data.bed_id}
                                onChange={(event) => form.setData('bed_id', event.target.value)}
                                options={[{ label: 'Select bed', value: '' }, ...props.options.locations.map((l) => ({ label: l.name, value: l.id }))]}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                            <AppSelect
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.target.value)}
                                options={props.options.statuses.map((s) => ({ label: s.label, value: s.value }))}
                            />
                        </div>
                        <div className="md:col-span-2 xl:col-span-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Admission Reason</label>
                            <AppTextarea rows={3} value={form.data.admission_reason} onChange={(event) => form.setData('admission_reason', event.target.value)} />
                        </div>
                        <div className="md:col-span-2 xl:col-span-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Initial Condition</label>
                            <AppTextarea rows={3} value={form.data.initial_condition} onChange={(event) => form.setData('initial_condition', event.target.value)} />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={route('patients.show', patient.id)}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" />
                            Save Admission
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
