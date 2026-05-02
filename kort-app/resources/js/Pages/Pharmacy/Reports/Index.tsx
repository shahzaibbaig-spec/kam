import { Download, FileText } from 'lucide-react';
import { FormEvent } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppSelect } from '@/Components/ui/AppSelect';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatDateTime, formatShortDate } from '@/Lib/utils';
import type { PharmacyReportPageProps } from '@/types/pharmacy';

export default function PharmacyReportsPage() {
    const { props } = useReactPage<PharmacyReportPageProps>();
    const form = useInertiaForm({
        ...props.filters,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.get(route('pharmacy.reports.index'), { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Pharmacy' }, { label: 'Dispensing Reports' }]}>
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <h1 className="text-2xl font-semibold text-slate-950">Pharmacy Dispensing Reports</h1>
                    <p className="mt-2 text-sm text-slate-600">Daily, weekly, monthly, quarterly, and yearly medicine consumption with dispensing traceability.</p>
                </div>

                <form className="app-card p-6" onSubmit={submit}>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <AppSelect
                            value={form.data.period}
                            onChange={(event) => form.setData('period', event.target.value)}
                            options={[
                                { label: 'Daily', value: 'daily' },
                                { label: 'Weekly', value: 'weekly' },
                                { label: 'Monthly', value: 'monthly' },
                                { label: 'Quarterly', value: 'quarterly' },
                                { label: 'Yearly', value: 'yearly' },
                            ]}
                        />
                        <AppInput type="date" value={form.data.date_from} onChange={(event) => form.setData('date_from', event.target.value)} />
                        <AppInput type="date" value={form.data.date_to} onChange={(event) => form.setData('date_to', event.target.value)} />
                        <AppInput placeholder="Medicine" value={form.data.medicine} onChange={(event) => form.setData('medicine', event.target.value)} />
                        <AppInput placeholder="Patient/CNIC/No" value={form.data.patient} onChange={(event) => form.setData('patient', event.target.value)} />
                        <AppInput placeholder="Doctor" value={form.data.doctor} onChange={(event) => form.setData('doctor', event.target.value)} />
                        <AppInput placeholder="Pharmacist" value={form.data.pharmacist} onChange={(event) => form.setData('pharmacist', event.target.value)} />
                        <AppInput placeholder="Department" value={form.data.department} onChange={(event) => form.setData('department', event.target.value)} />
                        <AppInput placeholder="Batch Number" value={form.data.batch_number} onChange={(event) => form.setData('batch_number', event.target.value)} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <AppButton type="submit" loading={form.processing}>Apply Filters</AppButton>
                        {props.can.export ? (
                            <>
                                <AppButton type="button" variant="outline" onClick={() => form.get(route('pharmacy.reports.index', { ...form.data, export: 'csv' }))}>
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </AppButton>
                                <AppButton type="button" variant="outline" onClick={() => form.get(route('pharmacy.reports.index', { ...form.data, export: 'pdf' }))}>
                                    <FileText className="h-4 w-4" />
                                    Export PDF
                                </AppButton>
                            </>
                        ) : null}
                    </div>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="app-card p-5"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Quantity</p><p className="mt-2 text-2xl font-semibold text-slate-900">{props.summary.total_dispensed_quantity}</p></div>
                    <div className="app-card p-5"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dispensing Rows</p><p className="mt-2 text-2xl font-semibold text-slate-900">{props.summary.total_records}</p></div>
                    <div className="app-card p-5"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Patients Covered</p><p className="mt-2 text-2xl font-semibold text-slate-900">{props.summary.patients_covered}</p></div>
                    <div className="app-card p-5"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Medicines Covered</p><p className="mt-2 text-2xl font-semibold text-slate-900">{props.summary.medicines_covered}</p></div>
                </div>

                <div className="app-card p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Top Used Medicines</h2>
                    <div className="mt-3 space-y-2">
                        {props.medicineUsage.slice(0, 10).map((row) => (
                            <div key={row.medicine_name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <p className="text-sm font-medium text-slate-900">{row.medicine_name}</p>
                                <p className="text-sm text-slate-700">
                                    {row.dispensed_quantity} ({row.dispensing_count} issues)
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="app-card p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Dispensed At</th>
                                    <th className="px-4 py-3">Patient</th>
                                    <th className="px-4 py-3">Prescription</th>
                                    <th className="px-4 py-3">Doctor</th>
                                    <th className="px-4 py-3">Pharmacist</th>
                                    <th className="px-4 py-3">Medicine</th>
                                    <th className="px-4 py-3">Batch / Expiry</th>
                                    <th className="px-4 py-3">Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {props.rows.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3">{formatDateTime(row.dispensed_at)}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{row.patient_name ?? 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{row.patient_number ?? '-'}</p>
                                        </td>
                                        <td className="px-4 py-3">{row.prescription_number ?? '-'}</td>
                                        <td className="px-4 py-3">{row.doctor_name ?? '-'}</td>
                                        <td className="px-4 py-3">{row.pharmacist_name ?? '-'}</td>
                                        <td className="px-4 py-3">{row.medicine_name ?? '-'}</td>
                                        <td className="px-4 py-3">
                                            {row.batch_number ?? '-'} / {formatShortDate(row.expiry_date)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.dispensed_quantity} {row.unit_of_measure}
                                        </td>
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

