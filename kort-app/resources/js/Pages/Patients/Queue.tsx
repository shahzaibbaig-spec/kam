import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatShortDate, formatTitleCase, joinDisplayParts } from '@/Lib/utils';
import type { DoctorQueuePageProps } from '@/types/patients';

export default function DoctorQueuePage() {
    const { props } = useReactPage<DoctorQueuePageProps>();

    return (
        <AppLayout breadcrumbs={[{ label: 'Patient Care' }, { label: 'Doctor Queue' }]}>
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <h1 className="text-2xl font-semibold text-slate-950">Doctor Patient Queue</h1>
                    <p className="mt-2 text-sm text-slate-600">Admitted patients and receptionist-assigned checkups waiting for diagnosis.</p>
                </div>

                <AppTableShell title="Queue" footer={<AppPagination links={props.queue.links} />}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                <tr>
                                    <th className="px-6 py-3.5">Admission</th>
                                    <th className="px-6 py-3.5">Patient</th>
                                    <th className="px-6 py-3.5">Location</th>
                                    <th className="px-6 py-3.5">Type</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {props.queue.data.map((entry) => (
                                    <tr key={`${entry.queue_type}-${entry.admission_id ?? entry.visit_id}`}>
                                        <td className="px-6 py-4 text-slate-700">
                                            <p className="font-semibold text-slate-900">{entry.admission_number ?? entry.visit_number ?? '-'}</p>
                                            <p className="mt-1 text-xs text-slate-500">{formatShortDate(entry.admission_date)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            <p className="font-semibold text-slate-900">{entry.patient_name}</p>
                                            <p className="mt-1 text-xs text-slate-500">{entry.patient_number} | {entry.cnic ?? 'No CNIC'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">{joinDisplayParts([entry.department_name, entry.ward_name, entry.room_name, entry.bed_name], ' / ')}</td>
                                        <td className="px-6 py-4 text-slate-700">{formatTitleCase(entry.visit_type ?? entry.queue_type)}</td>
                                        <td className="px-6 py-4 text-slate-700">{formatTitleCase(entry.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {entry.admission_id ? (
                                                    <AppButton asChild size="sm" variant="outline">
                                                        <AppLink href={route('patients.admissions.show', [entry.patient_id, entry.admission_id])}>Admission</AppLink>
                                                    </AppButton>
                                                ) : null}
                                                <AppButton asChild size="sm">
                                                    <AppLink href={entry.visit_id ? `${route('patients.diagnoses.create', entry.patient_id)}?visit=${entry.visit_id}` : route('patients.diagnoses.create', entry.patient_id)}>Diagnose</AppLink>
                                                </AppButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AppTableShell>
            </div>
        </AppLayout>
    );
}
