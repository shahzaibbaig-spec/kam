import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatDateTime, formatShortDate, formatTitleCase } from '@/Lib/utils';
import type { PatientHistoryPageProps } from '@/types/patients';

export default function PatientHistoryPage() {
    const { props } = useReactPage<PatientHistoryPageProps>();
    const { patient } = props;

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Patient Care' },
                { label: 'Patients', href: route('patients.index') },
                { label: patient.full_name, href: route('patients.show', patient.id) },
                { label: 'History' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <h1 className="text-2xl font-semibold text-slate-950">Patient History Timeline</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        {patient.full_name} | {patient.patient_number} | CNIC: {patient.cnic ?? 'Not recorded'}
                    </p>
                </div>

                <AppTableShell title="Admissions">
                    <div className="space-y-3 p-6">
                        {(patient.admissions ?? []).map((admission) => (
                            <div key={admission.id} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                                <p className="font-semibold text-slate-900">{admission.admission_number} - {formatTitleCase(admission.status)}</p>
                                <p className="mt-1 text-sm text-slate-700">
                                    {formatShortDate(admission.admission_date)} | {admission.department_name ?? 'No department'} | Doctor: {admission.attending_doctor_name ?? 'Not assigned'}
                                </p>
                            </div>
                        ))}
                    </div>
                </AppTableShell>

                <AppTableShell title="Visits, Diagnoses, and Prescriptions">
                    <div className="space-y-4 p-6">
                        {(patient.visits ?? []).map((visit) => (
                            <div key={visit.id} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                                <p className="font-semibold text-slate-900">{visit.visit_number} ({formatTitleCase(visit.visit_type)})</p>
                                <p className="mt-1 text-sm text-slate-700">{formatDateTime(visit.visit_date)} | Dr. {visit.doctor_name ?? 'Unknown'}</p>
                                <p className="mt-1 text-sm text-slate-700"><strong>Complaint:</strong> {visit.chief_complaint}</p>
                                {(visit.diagnoses ?? []).map((diagnosis) => (
                                    <p key={diagnosis.id} className="mt-1 text-sm text-slate-700">
                                        <strong>Diagnosis:</strong> {diagnosis.diagnosis} ({diagnosis.severity ?? 'n/a'})
                                    </p>
                                ))}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(visit.prescriptions ?? []).map((prescription) => (
                                        <a key={prescription.id} href={route('patients.prescriptions.show', [patient.id, prescription.id])} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700">
                                            {prescription.prescription_number}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </AppTableShell>
            </div>
        </AppLayout>
    );
}
