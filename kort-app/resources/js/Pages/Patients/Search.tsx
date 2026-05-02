import { Search } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import type { PatientSearchPageProps } from '@/types/patients';

export default function PatientSearchPage() {
    const { props } = useReactPage<PatientSearchPageProps>();

    return (
        <AppLayout breadcrumbs={[{ label: 'Patient Care' }, { label: 'Patient Search' }]}>
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <h1 className="text-2xl font-semibold text-slate-950">Patient Search</h1>
                    <p className="mt-2 text-sm text-slate-600">Search by CNIC, patient number, full name, or phone. Exact CNIC/patient number opens profile directly.</p>
                    <form className="mt-4 flex gap-2" method="get" action={route('patients.search')}>
                        <AppInput name="q" defaultValue={props.query} placeholder="Search patient..." />
                        <AppButton type="submit">
                            <Search className="h-4 w-4" />
                            Search
                        </AppButton>
                    </form>
                </div>

                <div className="app-card p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Matching Patients</h2>
                    {props.results.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-600">No results yet.</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {props.results.map((patient) => (
                                <AppLink key={patient.id} href={route('patients.show', patient.id)} className="block rounded-3xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-blue-200">
                                    <p className="font-semibold text-slate-900">{patient.full_name}</p>
                                    <p className="mt-1 text-sm text-slate-700">
                                        {patient.patient_number} | CNIC: {patient.cnic ?? 'Not recorded'} | Phone: {patient.phone ?? 'Not recorded'}
                                    </p>
                                </AppLink>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
