import { ClipboardPlus, Save } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatDateTime, formatShortDate, formatTitleCase, joinDisplayParts } from '@/Lib/utils';
import type { AdmissionShowPageProps } from '@/types/patients';

export default function PatientAdmissionShowPage() {
    const { props } = useReactPage<AdmissionShowPageProps>();
    const { admission } = props;

    const form = useInertiaForm({
        discharge_date: admission.discharge_date ?? '',
        discharge_summary: admission.discharge_summary ?? '',
    });

    const doctorForm = useInertiaForm({
        attending_doctor_id: admission.attending_doctor_id ? String(admission.attending_doctor_id) : '',
    });

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Patient Care' },
                { label: 'Patients', href: route('patients.index') },
                { label: admission.patient_name, href: route('patients.show', admission.patient_id) },
                { label: admission.admission_number },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950">Admission Detail</h1>
                            <p className="mt-2 text-sm text-slate-600">{admission.patient_name} | {admission.patient_number} | {admission.cnic ?? 'No CNIC'}</p>
                        </div>
                        {props.can.diagnose ? (
                            <AppButton asChild>
                                <AppLink href={route('patients.diagnoses.create', admission.patient_id)}>
                                    <ClipboardPlus className="h-4 w-4" />
                                    Create Diagnosis
                                </AppLink>
                            </AppButton>
                        ) : null}
                    </div>
                </div>

                <div className="app-card p-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admission Number</p><p className="mt-1 font-medium text-slate-900">{admission.admission_number}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Date / Time</p><p className="mt-1 font-medium text-slate-900">{formatShortDate(admission.admission_date)} / {admission.admission_time}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p><p className="mt-1 font-medium text-slate-900">{formatTitleCase(admission.status)}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Doctor</p><p className="mt-1 font-medium text-slate-900">{admission.attending_doctor_name ?? 'Not assigned'}</p></div>
                        <div className="md:col-span-2 xl:col-span-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ward / Room / Bed</p><p className="mt-1 font-medium text-slate-900">{joinDisplayParts([admission.department_name, admission.ward_name, admission.room_name, admission.bed_name], ' / ')}</p></div>
                        <div className="md:col-span-2 xl:col-span-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reason</p><p className="mt-1 text-sm text-slate-700">{admission.admission_reason ?? 'Not recorded'}</p></div>
                        <div className="md:col-span-2 xl:col-span-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Initial Condition</p><p className="mt-1 text-sm text-slate-700">{admission.initial_condition ?? 'Not recorded'}</p></div>
                    </div>
                    {props.can.changeDoctor ? (
                        <form
                            className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                doctorForm.post(route('patients.admissions.change-doctor', [admission.patient_id, admission.id]));
                            }}
                        >
                            <div className="min-w-[260px] flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-700">Change Attending Doctor (before checkup starts)</label>
                                <AppSelect
                                    value={doctorForm.data.attending_doctor_id}
                                    onChange={(event) => doctorForm.setData('attending_doctor_id', event.target.value)}
                                    options={[{ label: 'Select doctor', value: '' }, ...props.options.doctors.map((d) => ({ label: `${d.name}${d.designation ? ` (${d.designation})` : ''}`, value: d.id }))]}
                                />
                            </div>
                            <AppButton type="submit" variant="outline" loading={doctorForm.processing}>Change Doctor</AppButton>
                        </form>
                    ) : null}
                </div>

                {props.can.discharge ? (
                    <form
                        className="app-card p-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post(route('patients.admissions.discharge', [admission.patient_id, admission.id]));
                        }}
                    >
                        <h2 className="text-lg font-semibold text-slate-900">Discharge / Transfer</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Discharge Date</label>
                                <AppDateField value={form.data.discharge_date} onChange={(event) => form.setData('discharge_date', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Discharge Summary</label>
                                <AppTextarea rows={3} value={form.data.discharge_summary} onChange={(event) => form.setData('discharge_summary', event.target.value)} />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <AppButton type="submit" loading={form.processing}>
                                <Save className="h-4 w-4" />
                                Mark Discharged
                            </AppButton>
                        </div>
                    </form>
                ) : null}

                <div className="app-card p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Admission Visits</h2>
                    {(admission.visits ?? []).length === 0 ? (
                        <p className="mt-3 text-sm text-slate-600">No visits recorded for this admission.</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {(admission.visits ?? []).map((visit) => (
                                <div key={visit.id} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="font-semibold text-slate-900">{visit.visit_number}</p>
                                    <p className="mt-1 text-sm text-slate-700">{formatDateTime(visit.visit_date)} | {formatTitleCase(visit.visit_type)} | Dr. {visit.doctor_name ?? 'Unknown'}</p>
                                    <p className="mt-1 text-sm text-slate-700">{visit.chief_complaint}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
