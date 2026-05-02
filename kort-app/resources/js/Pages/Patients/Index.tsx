import { FilePlus2, Search } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppEmptyState, AppEmptyStateAction } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatTitleCase } from '@/Lib/utils';
import type { PatientIndexPageProps, PatientListFilters } from '@/types/patients';

export default function PatientIndexPage() {
    const { props } = useReactPage<PatientIndexPageProps>();
    const form = useInertiaForm<PatientListFilters>({
        search: props.filters.search ?? '',
    });

    const applySearch = () => {
        form.get(route('patients.index'), { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Patient Care' }, { label: 'Patients' }]}>
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Patient Management</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Patient directory and history</h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Register, search, and manage patients with complete admission, visit, diagnosis, and prescription history.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {props.permissions.patient.search ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('patients.search')}>
                                        <Search className="h-4 w-4" />
                                        Patient Search
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            {props.permissions.patient.create ? (
                                <AppButton asChild>
                                    <AppLink href={route('patients.create')}>
                                        <FilePlus2 className="h-4 w-4" />
                                        Register Patient
                                    </AppLink>
                                </AppButton>
                            ) : null}
                        </div>
                    </div>
                </div>

                <form
                    className="app-card p-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        applySearch();
                    }}
                >
                    <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                        <AppSearchInput
                            placeholder="Search CNIC, patient no, full name, or phone"
                            value={form.data.search ?? ''}
                            onChange={(event) => form.setData('search', event.target.value)}
                        />
                        <AppButton type="submit">Search</AppButton>
                        <AppButton
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.setData('search', '');
                                form.get(route('patients.index'), { preserveState: true, replace: true });
                            }}
                        >
                            Reset
                        </AppButton>
                    </div>
                </form>

                <AppTableShell
                    title="Patients"
                    description="Exact CNIC or patient number search opens the profile directly."
                    footer={<AppPagination links={props.patients.links} />}
                >
                    {props.patients.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No patients found"
                                description="Try another search term or register a new patient."
                                action={
                                    props.permissions.patient.create ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('patients.create')}>Register Patient</AppLink>
                                        </AppEmptyStateAction>
                                    ) : undefined
                                }
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3.5">Patient</th>
                                        <th className="px-6 py-3.5">CNIC</th>
                                        <th className="px-6 py-3.5">Phone</th>
                                        <th className="px-6 py-3.5">Gender / Age</th>
                                        <th className="px-6 py-3.5">Admission</th>
                                        <th className="px-6 py-3.5">Visits</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.patients.data.map((patient) => (
                                        <tr key={patient.id} className="transition hover:bg-slate-50/80">
                                            <td className="px-6 py-4">
                                                <AppLink href={route('patients.show', patient.id)} className="block">
                                                    <p className="font-semibold text-slate-900">{patient.full_name}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{patient.patient_number}</p>
                                                </AppLink>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{patient.cnic ?? 'Not recorded'}</td>
                                            <td className="px-6 py-4 text-slate-700">{patient.phone ?? 'Not recorded'}</td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {formatTitleCase(patient.gender)} / {patient.computed_age ?? patient.age ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {patient.current_admission_status ? formatTitleCase(patient.current_admission_status) : 'No active admission'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{patient.visits_count ?? 0}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <AppButton asChild size="sm" variant="outline">
                                                        <AppLink href={route('patients.show', patient.id)}>Profile</AppLink>
                                                    </AppButton>
                                                    {props.permissions.admission.create ? (
                                                        <AppButton asChild size="sm" variant="outline">
                                                            <AppLink href={route('patients.admissions.create', patient.id)}>Admit</AppLink>
                                                        </AppButton>
                                                    ) : null}
                                                    {props.permissions.diagnosis.create ? (
                                                        <AppButton asChild size="sm">
                                                            <AppLink href={route('patients.diagnoses.create', patient.id)}>Diagnose</AppLink>
                                                        </AppButton>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AppTableShell>
            </div>
        </AppLayout>
    );
}
