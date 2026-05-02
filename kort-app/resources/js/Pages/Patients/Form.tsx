import { ArrowLeft, Save, Search } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { PatientFormData, PatientFormPageProps } from '@/types/patients';

export default function PatientFormPage() {
    const { props } = useReactPage<PatientFormPageProps>();
    const patient = props.patient;

    const form = useInertiaForm<PatientFormData>({
        cnic: patient?.cnic ?? '',
        full_name: patient?.full_name ?? '',
        father_name: patient?.father_name ?? '',
        gender: patient?.gender ?? 'male',
        date_of_birth: patient?.date_of_birth ?? '',
        age: patient?.age ? String(patient.age) : '',
        phone: patient?.phone ?? '',
        emergency_contact: patient?.emergency_contact ?? '',
        address: patient?.address ?? '',
        blood_group: patient?.blood_group ?? '',
        allergies: patient?.allergies ?? '',
        medical_history: patient?.medical_history ?? '',
        photo: null,
        assigned_doctor_id: patient?.assigned_doctor_id ? String(patient.assigned_doctor_id) : '',
        department_id: '',
        checkup_type: '',
        chief_complaint: '',
        visit_date: new Date().toISOString().slice(0, 16),
    });

    const submit = () => {
        if (patient) {
            form.put(route('patients.update', patient.id));
            return;
        }

        form.post(route('patients.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Patient Care' },
                { label: 'Patients', href: route('patients.index') },
                { label: patient ? 'Edit Patient' : 'Register Patient' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Patient Registration</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{patient ? 'Edit patient profile' : 'Register new patient'}</h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Search first to avoid duplicates, then capture demographics, contacts, allergies, and history.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {!patient ? (
                                <AppButton asChild variant="outline">
                                    <AppLink href={route('patients.search')}>
                                        <Search className="h-4 w-4" />
                                        Search Existing
                                    </AppLink>
                                </AppButton>
                            ) : null}
                            <AppButton asChild variant="outline">
                                <AppLink href={patient ? route('patients.show', patient.id) : route('patients.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </AppLink>
                            </AppButton>
                        </div>
                    </div>
                </div>

                {props.existingMatches.length > 0 ? (
                    <div className="app-card p-4">
                        <p className="text-sm font-semibold text-slate-900">Possible existing patients found</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {props.existingMatches.map((entry) => (
                                <AppButton key={entry.id} asChild size="sm" variant="outline">
                                    <AppLink href={route('patients.show', entry.id)}>
                                        {entry.full_name} ({entry.patient_number})
                                    </AppLink>
                                </AppButton>
                            ))}
                        </div>
                    </div>
                ) : null}

                <form
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                    }}
                >
                    <div className="app-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Demographic details</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">CNIC</label>
                                <AppInput placeholder="xxxxx-xxxxxxx-x" value={form.data.cnic} onChange={(event) => form.setData('cnic', event.target.value)} />
                                {form.errors.cnic ? <p className="mt-1 text-xs text-rose-600">{form.errors.cnic}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                                <AppInput value={form.data.full_name} onChange={(event) => form.setData('full_name', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Father Name</label>
                                <AppInput value={form.data.father_name} onChange={(event) => form.setData('father_name', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Gender</label>
                                <AppSelect
                                    value={form.data.gender}
                                    onChange={(event) => form.setData('gender', event.target.value)}
                                    options={[
                                        { label: 'Male', value: 'male' },
                                        { label: 'Female', value: 'female' },
                                        { label: 'Other', value: 'other' },
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Date of Birth</label>
                                <AppDateField value={form.data.date_of_birth} onChange={(event) => form.setData('date_of_birth', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Age</label>
                                <AppInput type="number" min={0} value={form.data.age} onChange={(event) => form.setData('age', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Blood Group</label>
                                <AppInput value={form.data.blood_group} onChange={(event) => form.setData('blood_group', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                                <AppInput value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Emergency Contact</label>
                                <AppInput value={form.data.emergency_contact} onChange={(event) => form.setData('emergency_contact', event.target.value)} />
                            </div>
                            <div className="md:col-span-2 xl:col-span-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
                                <AppTextarea rows={2} value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} />
                            </div>
                            <div className="md:col-span-2 xl:col-span-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">Patient Photo (optional)</label>
                                <AppInput
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null;
                                        form.setData('photo', file);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="app-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Clinical background</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Allergies</label>
                                <AppTextarea rows={4} value={form.data.allergies} onChange={(event) => form.setData('allergies', event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Medical History</label>
                                <AppTextarea rows={4} value={form.data.medical_history} onChange={(event) => form.setData('medical_history', event.target.value)} />
                            </div>
                        </div>
                    </div>

                    {(props.permissions.patient.assignDoctor || props.permissions.patient.changeDoctor) ? (
                        <div className="app-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Reception Assignment</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Patient number is auto-generated as <strong>KORT-PAT-YYYY-000001</strong>. Assign active doctor from Doctor role.
                        </p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Assigned Doctor</label>
                                <AppSelect
                                    disabled={!props.permissions.patient.assignDoctor && !props.permissions.patient.changeDoctor}
                                    value={form.data.assigned_doctor_id}
                                    onChange={(event) => form.setData('assigned_doctor_id', event.target.value)}
                                    options={[{ label: 'Select doctor', value: '' }, ...props.options.doctors.map((d) => ({ label: `${d.name}${d.designation ? ` (${d.designation})` : ''}`, value: d.id }))]}
                                />
                                {form.errors.assigned_doctor_id ? <p className="mt-1 text-xs text-rose-600">{form.errors.assigned_doctor_id}</p> : null}
                            </div>
                            {!patient ? (
                                <>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
                                        <AppSelect
                                            value={form.data.department_id}
                                            onChange={(event) => form.setData('department_id', event.target.value)}
                                            options={[{ label: 'Select department', value: '' }, ...props.options.departments.map((d) => ({ label: d.name, value: d.id }))]}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Checkup Type</label>
                                        <AppSelect
                                            value={form.data.checkup_type}
                                            onChange={(event) => form.setData('checkup_type', event.target.value)}
                                            options={[
                                                { label: 'Select checkup type', value: '' },
                                                { label: 'OPD', value: 'opd' },
                                                { label: 'Emergency', value: 'emergency' },
                                                { label: 'Admitted Follow-up', value: 'admitted_followup' },
                                            ]}
                                        />
                                        {form.errors.checkup_type ? <p className="mt-1 text-xs text-rose-600">{form.errors.checkup_type}</p> : null}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Visit Date/Time</label>
                                        <AppInput type="datetime-local" value={form.data.visit_date} onChange={(event) => form.setData('visit_date', event.target.value)} />
                                    </div>
                                    <div className="md:col-span-2 xl:col-span-4">
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Chief Complaint / Reason</label>
                                        <AppTextarea rows={2} value={form.data.chief_complaint} onChange={(event) => form.setData('chief_complaint', event.target.value)} />
                                        {form.errors.chief_complaint ? <p className="mt-1 text-xs text-rose-600">{form.errors.chief_complaint}</p> : null}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                    ) : null}

                    <div className="flex flex-wrap justify-end gap-3">
                        <AppButton asChild variant="outline">
                            <AppLink href={patient ? route('patients.show', patient.id) : route('patients.index')}>Cancel</AppLink>
                        </AppButton>
                        <AppButton type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" />
                            {patient ? 'Update Patient' : 'Create Patient'}
                        </AppButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
