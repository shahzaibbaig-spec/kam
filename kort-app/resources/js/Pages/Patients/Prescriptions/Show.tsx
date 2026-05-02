import { Download, FilePenLine, Printer } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatDateTime, formatShortDate } from '@/Lib/utils';
import type { PrescriptionShowPageProps } from '@/types/patients';

export default function PatientPrescriptionShowPage() {
    const { props } = useReactPage<PrescriptionShowPageProps>();
    const { patient, prescription } = props;

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Patient Care' },
                { label: 'Patients', href: route('patients.index') },
                { label: patient.full_name, href: route('patients.show', patient.id) },
                { label: prescription.prescription_number },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950">Prescription Detail</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                {prescription.prescription_number} | {formatDateTime(prescription.prescription_date)} | Dr. {prescription.doctor_name ?? 'Unknown'} | Dispensing:{' '}
                                {prescription.dispensing_status ?? 'pending'}
                            </p>
                        </div>
                        {props.can.print || props.can.edit ? (
                            <div className="flex gap-2">
                                {props.can.edit ? (
                                    <AppButton asChild variant="outline">
                                        <AppLink href={route('patients.prescriptions.edit', [patient.id, prescription.id])}>
                                            <FilePenLine className="h-4 w-4" />
                                            Edit Prescription
                                        </AppLink>
                                    </AppButton>
                                ) : null}
                                {props.can.print ? (
                                    <>
                                        <AppButton asChild variant="outline">
                                            <AppLink href={route('patients.prescriptions.print', [patient.id, prescription.id])}>
                                                <Printer className="h-4 w-4" />
                                                Print Prescription
                                            </AppLink>
                                        </AppButton>
                                        <AppButton asChild>
                                            <AppLink href={route('patients.prescriptions.pdf', [patient.id, prescription.id])}>
                                                <Download className="h-4 w-4" />
                                                Download PDF
                                            </AppLink>
                                        </AppButton>
                                    </>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                    {props.edit_locked ? (
                        <p className="mt-3 text-sm font-medium text-amber-700">
                            {props.edit_lock_message ?? 'Editing is locked 24 hours after prescription creation.'}
                        </p>
                    ) : null}
                </div>

                <div className="app-card p-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Patient</p><p className="mt-1 font-medium text-slate-900">{patient.full_name}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Patient Number</p><p className="mt-1 font-medium text-slate-900">{patient.patient_number}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">CNIC</p><p className="mt-1 font-medium text-slate-900">{patient.cnic ?? 'Not recorded'}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Age / Gender</p><p className="mt-1 font-medium text-slate-900">{patient.age ?? '-'} / {patient.gender}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Visit Number</p><p className="mt-1 font-medium text-slate-900">{prescription.visit_number ?? '-'}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Follow-up</p><p className="mt-1 font-medium text-slate-900">{formatShortDate(prescription.follow_up_date)}</p></div>
                        <div className="md:col-span-2 xl:col-span-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Diagnosis Summary</p><p className="mt-1 text-sm text-slate-700">{prescription.diagnosis_summary ?? 'Not recorded'}</p></div>
                        <div className="md:col-span-2 xl:col-span-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">General Instructions</p><p className="mt-1 text-sm text-slate-700">{prescription.instructions ?? 'Not recorded'}</p></div>
                    </div>
                </div>

                <div className="app-card p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Medicine Items</h2>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Medicine</th>
                                    <th className="px-4 py-3">Dosage</th>
                                    <th className="px-4 py-3">Frequency</th>
                                    <th className="px-4 py-3">Duration</th>
                                    <th className="px-4 py-3">Prescribed Qty</th>
                                    <th className="px-4 py-3">Dispensed Qty</th>
                                    <th className="px-4 py-3">Remaining Qty</th>
                                    <th className="px-4 py-3">Instructions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {prescription.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">{item.medicine_name}</td>
                                        <td className="px-4 py-3">{item.dosage}</td>
                                        <td className="px-4 py-3">{item.frequency}</td>
                                        <td className="px-4 py-3">{item.duration}</td>
                                        <td className="px-4 py-3">{item.prescribed_quantity ?? '-'}</td>
                                        <td className="px-4 py-3">{item.dispensed_quantity ?? 0}</td>
                                        <td className="px-4 py-3">{item.remaining_quantity ?? '-'}</td>
                                        <td className="px-4 py-3">{item.instructions ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
