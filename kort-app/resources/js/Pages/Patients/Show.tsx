import { ClipboardPlus, FileText, Pencil, Printer, UserPlus } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatDateTime, formatShortDate, formatTitleCase, joinDisplayParts } from '@/Lib/utils';
import type { PatientShowPageProps } from '@/types/patients';

export default function PatientShowPage() {
    const { props } = useReactPage<PatientShowPageProps>();
    const { patient, permissions, options } = props;

    const documentForm = useInertiaForm({
        visit_id: '',
        file: null as File | null,
        notes: '',
    });

    const quickVisitForm = useInertiaForm({
        admission_id: '',
        department_id: '',
        visit_date: new Date().toISOString().slice(0, 16),
        visit_type: 'opd',
        doctor_id: patient.assigned_doctor_id ? String(patient.assigned_doctor_id) : '',
        chief_complaint: '',
        vitals: '',
        notes: '',
    });

    const [visitDoctorSelection, setVisitDoctorSelection] = useState<Record<number, string>>({});

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Patient Care' },
                { label: 'Patients', href: route('patients.index') },
                { label: patient.full_name },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Patient Profile</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{patient.full_name}</h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                {patient.patient_number} | CNIC: {patient.cnic ?? 'Not recorded'} | Current status:{' '}
                                {patient.current_admission_status ? formatTitleCase(patient.current_admission_status) : 'Not admitted'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {permissions.patient.edit ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('patients.edit', patient.id)}>
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.admission.create ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('patients.admissions.create', patient.id)}>
                                        <UserPlus className="h-4 w-4" />
                                        Admit Patient
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {permissions.diagnosis.create ? (
                                <AppButton asChild>
                                    <AppLink href={route('patients.diagnoses.create', patient.id)}>
                                        <ClipboardPlus className="h-4 w-4" />
                                        Create Diagnosis
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            <AppButton asChild variant="outline">
                                <AppLink href={route('patients.history', patient.id)}>
                                    <FileText className="h-4 w-4" />
                                    Full History
                                </AppLink>
                            </AppButton>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <div className="app-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Demographics</h2>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Father Name</p><p className="mt-1 font-medium text-slate-900">{patient.father_name ?? 'Not recorded'}</p></div>
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gender / Age</p><p className="mt-1 font-medium text-slate-900">{formatTitleCase(patient.gender)} / {patient.computed_age ?? patient.age ?? '-'}</p></div>
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Date of Birth</p><p className="mt-1 font-medium text-slate-900">{formatShortDate(patient.date_of_birth)}</p></div>
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Blood Group</p><p className="mt-1 font-medium text-slate-900">{patient.blood_group ?? 'Not recorded'}</p></div>
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</p><p className="mt-1 font-medium text-slate-900">{patient.phone ?? 'Not recorded'}</p></div>
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Emergency Contact</p><p className="mt-1 font-medium text-slate-900">{patient.emergency_contact ?? 'Not recorded'}</p></div>
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned Doctor</p><p className="mt-1 font-medium text-slate-900">{patient.assigned_doctor_name ?? 'Not assigned'}</p></div>
                            <div className="md:col-span-2"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Address</p><p className="mt-1 font-medium text-slate-900">{patient.address ?? 'Not recorded'}</p></div>
                        </div>
                    </div>

                    <div className="app-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Allergies and history</h2>
                        <div className="mt-4 space-y-4">
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Allergies</p><p className="mt-1 text-sm leading-6 text-slate-700">{patient.allergies ?? 'No allergies recorded'}</p></div>
                            <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Medical History</p><p className="mt-1 text-sm leading-6 text-slate-700">{patient.medical_history ?? 'No medical history recorded'}</p></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admissions</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">{patient.admissions_count ?? 0}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Visits</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">{patient.visits_count ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {permissions.visit.create || permissions.patient.assignDoctor ? (
                    <form
                        className="app-card p-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            quickVisitForm.post(route('patients.visits.store', patient.id));
                        }}
                    >
                        <h2 className="text-lg font-semibold text-slate-900">Reception Desk Checkup Assignment</h2>
                        <p className="mt-2 text-sm text-slate-600">Assign department/checkup type and doctor before checkup starts.</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <AppSelect
                                value={quickVisitForm.data.department_id}
                                onChange={(event) => quickVisitForm.setData('department_id', event.target.value)}
                                options={[{ label: 'Select department', value: '' }, ...options.departments.map((d) => ({ label: d.name, value: d.id }))]}
                            />
                            <AppSelect
                                value={quickVisitForm.data.visit_type}
                                onChange={(event) => quickVisitForm.setData('visit_type', event.target.value)}
                                options={[
                                    { label: 'OPD', value: 'opd' },
                                    { label: 'Emergency', value: 'emergency' },
                                    { label: 'Admitted Follow-up', value: 'admitted_followup' },
                                ]}
                            />
                            <AppSelect
                                value={quickVisitForm.data.doctor_id}
                                onChange={(event) => quickVisitForm.setData('doctor_id', event.target.value)}
                                options={[{ label: 'Select doctor', value: '' }, ...options.doctors.map((d) => ({ label: `${d.name}${d.designation ? ` (${d.designation})` : ''}`, value: d.id }))]}
                            />
                            <AppInput type="datetime-local" value={quickVisitForm.data.visit_date} onChange={(event) => quickVisitForm.setData('visit_date', event.target.value)} />
                            <div className="md:col-span-2 xl:col-span-4">
                                <AppTextarea rows={2} placeholder="Chief complaint / reason" value={quickVisitForm.data.chief_complaint} onChange={(event) => quickVisitForm.setData('chief_complaint', event.target.value)} />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <AppButton type="submit" loading={quickVisitForm.processing}>Assign to Doctor Queue</AppButton>
                        </div>
                    </form>
                ) : null}

                <AppTableShell title="Admissions" description="Current and past admission records with status and assigned care locations.">
                    {(patient.admissions?.length ?? 0) === 0 ? (
                        <div className="p-6"><AppEmptyState title="No admissions yet" description="Admit the patient to start inpatient tracking." /></div>
                    ) : (
                        <div className="space-y-3 p-6">
                            {patient.admissions?.map((admission) => (
                                <AppLink key={admission.id} href={route('patients.admissions.show', [patient.id, admission.id])} className="block rounded-3xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-blue-200">
                                    <p className="font-semibold text-slate-900">{admission.admission_number} - {formatTitleCase(admission.status)}</p>
                                    <p className="mt-1 text-sm text-slate-700">
                                        {formatShortDate(admission.admission_date)} | {joinDisplayParts([admission.department_name, admission.ward_name, admission.room_name, admission.bed_name], ' / ')}
                                    </p>
                                </AppLink>
                            ))}
                        </div>
                    )}
                </AppTableShell>

                <AppTableShell title="Visit and diagnosis history" description="Every doctor visit with complaints, notes, diagnoses, and prescriptions.">
                    {(patient.visits?.length ?? 0) === 0 ? (
                        <div className="p-6"><AppEmptyState title="No visits yet" description="Create diagnosis to record the first clinical visit." /></div>
                    ) : (
                        <div className="space-y-4 p-6">
                            {patient.visits?.map((visit) => (
                                <div key={visit.id} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900">{visit.visit_number} ({formatTitleCase(visit.visit_type)})</p>
                                            <p className="mt-1 text-sm text-slate-700">{formatDateTime(visit.visit_date)} | Dr. {visit.doctor_name ?? 'Not assigned'}</p>
                                            <p className="mt-1 text-sm text-slate-700"><strong>Complaint:</strong> {visit.chief_complaint}</p>
                                            <p className="mt-1 text-sm text-slate-700"><strong>Vitals:</strong> {visit.vitals ?? 'Not recorded'}</p>
                                            <p className="mt-1 text-sm text-slate-700"><strong>Notes:</strong> {visit.notes ?? 'Not recorded'}</p>
                                        </div>
                                        {permissions.prescription.create ? (
                                            <AppButton asChild size="sm">
                                                <AppLink href={route('patients.prescriptions.create', [patient.id, visit.id])}>Create Prescription</AppLink>
                                            </AppButton>
                                        ) : null}
                                        {(visit.diagnoses?.length ?? 0) === 0 && permissions.diagnosis.create ? (
                                            <AppButton asChild size="sm" variant="outline">
                                                <AppLink href={`${route('patients.diagnoses.create', patient.id)}?visit=${visit.id}`}>Start Diagnosis</AppLink>
                                            </AppButton>
                                        ) : null}
                                    </div>
                                    {(visit.diagnoses?.length ?? 0) === 0 && permissions.patient.changeDoctor ? (
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <AppSelect
                                                value={visitDoctorSelection[visit.id] ?? String(visit.doctor_id)}
                                                onChange={(event) => setVisitDoctorSelection((prev) => ({ ...prev, [visit.id]: event.target.value }))}
                                                options={options.doctors.map((d) => ({ label: `${d.name}${d.designation ? ` (${d.designation})` : ''}`, value: d.id }))}
                                            />
                                            <AppButton
                                                size="sm"
                                                variant="outline"
                                                type="button"
                                                onClick={() => {
                                                    const doctorId = visitDoctorSelection[visit.id] ?? String(visit.doctor_id);
                                                    router.post(route('patients.visits.change-doctor', [patient.id, visit.id]), { doctor_id: doctorId });
                                                }}
                                            >
                                                Change Doctor
                                            </AppButton>
                                        </div>
                                    ) : null}
                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Diagnoses</p>
                                            {(visit.diagnoses?.length ?? 0) === 0 ? (
                                                <p className="mt-2 text-sm text-slate-600">No diagnosis entries.</p>
                                            ) : (
                                                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                                    {visit.diagnoses?.map((diagnosis) => (
                                                        <li key={diagnosis.id}>- {diagnosis.diagnosis}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prescriptions</p>
                                            {(visit.prescriptions?.length ?? 0) === 0 ? (
                                                <p className="mt-2 text-sm text-slate-600">No prescriptions yet.</p>
                                            ) : (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {visit.prescriptions?.map((prescription) => (
                                                        <AppButton key={prescription.id} asChild size="sm" variant="outline">
                                                            <AppLink href={route('patients.prescriptions.show', [patient.id, prescription.id])}>
                                                                {prescription.prescription_number}
                                                            </AppLink>
                                                        </AppButton>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AppTableShell>

                <AppTableShell title="Patient documents" description="Upload and retain medical files linked to patient or specific visits.">
                    <div className="border-b border-slate-100 p-6">
                        <form
                            className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                documentForm.post(route('patients.documents.store', patient.id));
                            }}
                        >
                            <AppSelect
                                value={documentForm.data.visit_id}
                                onChange={(event) => documentForm.setData('visit_id', event.target.value)}
                                options={[
                                    { label: 'General patient document', value: '' },
                                    ...(patient.visits ?? []).map((visit) => ({ label: `${visit.visit_number} (${formatShortDate(visit.visit_date)})`, value: visit.id })),
                                ]}
                            />
                            <AppInput
                                type="file"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    documentForm.setData('file', file);
                                }}
                            />
                            <AppTextarea rows={1} value={documentForm.data.notes} onChange={(event) => documentForm.setData('notes', event.target.value)} placeholder="Notes" />
                            <AppButton type="submit" loading={documentForm.processing}>Upload</AppButton>
                        </form>
                    </div>
                    {(patient.documents?.length ?? 0) === 0 ? (
                        <div className="p-6"><AppEmptyState title="No documents uploaded" description="Upload lab reports, scans, and supporting records." /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3.5">File</th>
                                        <th className="px-6 py-3.5">Type</th>
                                        <th className="px-6 py-3.5">Visit</th>
                                        <th className="px-6 py-3.5">Uploaded By</th>
                                        <th className="px-6 py-3.5">Date</th>
                                        <th className="px-6 py-3.5 text-right">Open</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {patient.documents?.map((document) => (
                                        <tr key={document.id}>
                                            <td className="px-6 py-4 text-slate-700">{document.file_name}</td>
                                            <td className="px-6 py-4 text-slate-700">{document.file_type}</td>
                                            <td className="px-6 py-4 text-slate-700">{document.visit_number ?? 'General'}</td>
                                            <td className="px-6 py-4 text-slate-700">{document.uploaded_by_name ?? 'Unknown'}</td>
                                            <td className="px-6 py-4 text-slate-700">{formatDateTime(document.created_at)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <AppButton asChild size="sm" variant="outline">
                                                    <a href={`/storage/${document.file_path}`} target="_blank" rel="noreferrer">Open</a>
                                                </AppButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AppTableShell>

                {(patient.prescriptions?.length ?? 0) > 0 ? (
                    <AppTableShell title="Prescription quick print" description="Open, print, and download previous prescriptions.">
                        <div className="space-y-3 p-6">
                            {patient.prescriptions?.slice(0, 8).map((prescription) => (
                                <div key={prescription.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{prescription.prescription_number}</p>
                                        <p className="mt-1 text-sm text-slate-700">{formatDateTime(prescription.prescription_date)} | Dr. {prescription.doctor_name ?? 'Unknown'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <AppButton asChild size="sm" variant="outline">
                                            <AppLink href={route('patients.prescriptions.show', [patient.id, prescription.id])}>View</AppLink>
                                        </AppButton>
                                        {permissions.prescription.print ? (
                                            <AppButton asChild size="sm">
                                                <AppLink href={route('patients.prescriptions.print', [patient.id, prescription.id])}>
                                                    <Printer className="h-4 w-4" />
                                                    Print
                                                </AppLink>
                                            </AppButton>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AppTableShell>
                ) : null}
            </div>
        </AppLayout>
    );
}
