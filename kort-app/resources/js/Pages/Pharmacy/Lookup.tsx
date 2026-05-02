import { Search, ShieldAlert } from 'lucide-react';
import { FormEvent } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatDateTime, formatShortDate, formatTitleCase } from '@/Lib/utils';
import type { PharmacyLookupPageProps } from '@/types/pharmacy';

interface DispenseLine {
    [key: string]: string | number;
    prescription_item_id: number;
    dispensed_quantity: string;
    remarks: string;
}

export default function PharmacyLookupPage() {
    const { props } = useReactPage<PharmacyLookupPageProps>();
    const selected = props.selectedPrescription;
    const searchForm = useInertiaForm<{ query: string }>({
        query: props.query ?? '',
    });

    const dispenseForm = useInertiaForm<{
        dispensed_at: string;
        remarks: string;
        items: DispenseLine[];
    }>({
        dispensed_at: new Date().toISOString().slice(0, 16),
        remarks: '',
        items:
            selected?.items.map((item) => ({
                prescription_item_id: item.id,
                dispensed_quantity: '',
                remarks: '',
            })) ?? [],
    });

    const submitLookup = (event: FormEvent) => {
        event.preventDefault();
        searchForm.get(route('pharmacy.lookup'), { preserveState: true, replace: true });
    };

    const submitDispense = (event: FormEvent) => {
        event.preventDefault();
        if (!selected) {
            return;
        }

        dispenseForm.post(route('pharmacy.dispense.store', selected.id));
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Pharmacy' }, { label: 'Prescription Lookup' }]}>
            <div className="space-y-6">
                <div className="app-surface p-6">
                    <h1 className="text-2xl font-semibold text-slate-950">Pharmacy Prescription Lookup</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Search by CNIC, patient number, prescription number, or medicine name/code. Check availability and complete dispensing.
                    </p>
                    <form className="mt-4 flex gap-2" onSubmit={submitLookup}>
                        <AppInput
                            placeholder="Enter CNIC, patient number, prescription number, or medicine"
                            value={searchForm.data.query}
                            onChange={(event) => searchForm.setData('query', event.target.value)}
                        />
                        <AppButton type="submit" loading={searchForm.processing}>
                            <Search className="h-4 w-4" />
                            Search
                        </AppButton>
                    </form>
                </div>

                {props.prescriptions.length > 0 ? (
                    <div className="app-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Matched Prescriptions</h2>
                        <div className="mt-4 space-y-3">
                            {props.prescriptions.map((prescription) => (
                                <AppLink
                                    key={prescription.id}
                                    href={route('pharmacy.lookup', { query: props.query, prescription: prescription.id })}
                                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-300"
                                >
                                    <p className="font-semibold text-slate-900">
                                        {prescription.prescription_number} | {prescription.patient.full_name}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {prescription.patient.patient_number} | {prescription.patient.cnic ?? 'No CNIC'} | Dr. {prescription.doctor_name ?? 'Unknown'}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                                        {formatTitleCase(prescription.dispensing_status)} | {formatDateTime(prescription.prescription_date)}
                                    </p>
                                </AppLink>
                            ))}
                        </div>
                    </div>
                ) : null}

                {props.query.trim() !== '' ? (
                    <div className="app-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Medicine Availability</h2>
                        {props.medicines.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-600">No medicine matched your search.</p>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Medicine</th>
                                            <th className="px-4 py-3">Code</th>
                                            <th className="px-4 py-3">Available</th>
                                            <th className="px-4 py-3">Stock</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {props.medicines.map((medicine) => (
                                            <tr key={medicine.id}>
                                                <td className="px-4 py-3 font-medium text-slate-900">{medicine.item_name}</td>
                                                <td className="px-4 py-3 text-slate-700">{medicine.item_code ?? '-'}</td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {medicine.available_quantity} {medicine.unit_of_measure ?? ''}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {medicine.current_quantity} {medicine.unit_of_measure ?? ''}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            medicine.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}
                                                    >
                                                        {medicine.is_available ? 'Available' : 'Out of stock'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : null}

                {selected ? (
                    <form className="space-y-6" onSubmit={submitDispense}>
                        <div className="app-card p-6">
                            <h2 className="text-lg font-semibold text-slate-900">Selected Prescription</h2>
                            <p className="mt-2 text-sm text-slate-700">
                                {selected.prescription_number} | {selected.patient.full_name} ({selected.patient.patient_number}) | CNIC:{' '}
                                {selected.patient.cnic ?? 'Not recorded'} | Dr. {selected.doctor_name ?? 'Unknown'}
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                                Date: {formatDateTime(selected.prescription_date)} | Status: {formatTitleCase(selected.dispensing_status)}
                            </p>
                        </div>

                        <div className="app-card p-6">
                            <div className="mb-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Dispensed At</label>
                                    <AppInput
                                        type="datetime-local"
                                        value={dispenseForm.data.dispensed_at}
                                        onChange={(event) => dispenseForm.setData('dispensed_at', event.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Dispensing Remarks</label>
                                    <AppInput value={dispenseForm.data.remarks} onChange={(event) => dispenseForm.setData('remarks', event.target.value)} />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Medicine</th>
                                            <th className="px-4 py-3">Dose/Frequency/Duration</th>
                                            <th className="px-4 py-3">Prescribed</th>
                                            <th className="px-4 py-3">Dispensed</th>
                                            <th className="px-4 py-3">Remaining</th>
                                            <th className="px-4 py-3">Available</th>
                                            <th className="px-4 py-3">Batch / Expiry</th>
                                            <th className="px-4 py-3">Dispense Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {selected.items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{item.medicine_name}</p>
                                                    <p className="text-xs text-slate-500">{item.inventory_item_name ?? 'No linked inventory item'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {item.dosage} / {item.frequency} / {item.duration}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{item.prescribed_quantity ?? '-'}</td>
                                                <td className="px-4 py-3 text-slate-700">{item.dispensed_quantity ?? 0}</td>
                                                <td className="px-4 py-3 text-slate-700">{item.remaining_quantity ?? '-'}</td>
                                                <td className="px-4 py-3 text-slate-700">{item.available_stock ?? 0}</td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {item.batches.length > 0
                                                        ? item.batches
                                                              .slice(0, 2)
                                                              .map((batch) => `${batch.batch_number} (${formatShortDate(batch.expiry_date)})`)
                                                              .join(', ')
                                                        : 'No issuable batches'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <AppInput
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={dispenseForm.data.items[index]?.dispensed_quantity ?? ''}
                                                        onChange={(event) => {
                                                            const rows = [...dispenseForm.data.items];
                                                            rows[index] = {
                                                                ...rows[index],
                                                                dispensed_quantity: event.target.value,
                                                            };
                                                            dispenseForm.setData('items', rows);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {dispenseForm.errors.items ? (
                                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <ShieldAlert className="mr-2 inline h-4 w-4" />
                                    {dispenseForm.errors.items}
                                </div>
                            ) : null}

                            <div className="mt-6 flex items-center justify-end gap-2">
                                {props.can.dispense ? (
                                    <AppButton type="submit" loading={dispenseForm.processing}>
                                        Done
                                    </AppButton>
                                ) : null}
                            </div>
                        </div>
                    </form>
                ) : null}
            </div>
        </AppLayout>
    );
}
