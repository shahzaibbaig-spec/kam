import type { PaginatedResponse } from '@/types';
import type { ReactSharedPageProps } from '@/types/app-shell';

export interface PatientPermissions {
    patient: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
        search: boolean;
        assignDoctor: boolean;
        changeDoctor: boolean;
    };
    admission: {
        view: boolean;
        create: boolean;
        edit: boolean;
        discharge: boolean;
    };
    visit: {
        view: boolean;
        create: boolean;
        edit: boolean;
    };
    diagnosis: {
        view: boolean;
        create: boolean;
        edit: boolean;
    };
    prescription: {
        view: boolean;
        create: boolean;
        edit: boolean;
        print: boolean;
    };
}

export interface PatientListFilters {
    [key: string]: string | undefined;
    search?: string;
}

export interface DoctorOption {
    id: number;
    name: string;
    designation?: string | null;
    department_id?: number | null;
}

export interface DepartmentOption {
    id: number;
    name: string;
    code?: string | null;
}

export interface LocationOption {
    id: number;
    name: string;
    code?: string | null;
    department_id?: number | null;
}

export interface AdmissionRecord {
    id: number;
    admission_number: string;
    admission_date: string | null;
    admission_time?: string | null;
    department_name?: string | null;
    ward_name?: string | null;
    room_name?: string | null;
    bed_name?: string | null;
    attending_doctor_name?: string | null;
    admission_reason?: string | null;
    initial_condition?: string | null;
    status: string;
    discharge_date?: string | null;
    discharge_summary?: string | null;
}

export interface VisitDiagnosisRecord {
    id: number;
    doctor_name?: string | null;
    diagnosis: string;
    clinical_notes?: string | null;
    severity?: string | null;
    follow_up_date?: string | null;
}

export interface PrescriptionItemRecord {
    id: number;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string | null;
    inventory_item_id?: number | null;
    prescribed_quantity?: number | null;
    dispensed_quantity?: number | null;
    remaining_quantity?: number | null;
    dispensing_status?: string | null;
}

export interface VisitPrescriptionRecord {
    id: number;
    prescription_number: string;
    prescription_date: string | null;
    doctor_name?: string | null;
    instructions?: string | null;
    printable_notes?: string | null;
    items: PrescriptionItemRecord[];
}

export interface PatientVisitRecord {
    id: number;
    patient_id: number;
    admission_id?: number | null;
    department_id?: number | null;
    department_name?: string | null;
    visit_number: string;
    visit_date: string | null;
    visit_type: string;
    doctor_id: number;
    doctor_name?: string | null;
    chief_complaint: string;
    vitals?: string | null;
    notes?: string | null;
    diagnoses?: VisitDiagnosisRecord[];
    prescriptions?: VisitPrescriptionRecord[];
}

export interface DiagnosisRecord {
    id: number;
    visit_id: number;
    visit_number?: string | null;
    visit_date?: string | null;
    doctor_name?: string | null;
    diagnosis: string;
    clinical_notes?: string | null;
    severity?: string | null;
    follow_up_date?: string | null;
}

export interface PrescriptionRecord {
    id: number;
    visit_id: number;
    visit_number?: string | null;
    prescription_number: string;
    prescription_date: string | null;
    doctor_name?: string | null;
    dispensing_status?: string | null;
    instructions?: string | null;
    printable_notes?: string | null;
    items: PrescriptionItemRecord[];
}

export interface PatientDocumentRecord {
    id: number;
    visit_id?: number | null;
    visit_number?: string | null;
    file_name: string;
    file_path: string;
    file_type: string;
    notes?: string | null;
    uploaded_by_name?: string | null;
    created_at?: string | null;
}

export interface PatientListRow {
    id: number;
    patient_number: string;
    cnic?: string | null;
    full_name: string;
    father_name?: string | null;
    gender: string;
    date_of_birth?: string | null;
    age?: number | null;
    computed_age?: number | null;
    phone?: string | null;
    emergency_contact?: string | null;
    address?: string | null;
    blood_group?: string | null;
    allergies?: string | null;
    medical_history?: string | null;
    photo_path?: string | null;
    assigned_doctor_id?: number | null;
    assigned_doctor_name?: string | null;
    visits_count?: number | null;
    admissions_count?: number | null;
    current_admission_status?: string | null;
    active_admission?: AdmissionRecord | null;
    admissions?: AdmissionRecord[];
    visits?: PatientVisitRecord[];
    diagnoses?: DiagnosisRecord[];
    prescriptions?: PrescriptionRecord[];
    documents?: PatientDocumentRecord[];
    created_at?: string | null;
    updated_at?: string | null;
}

export interface AdmissionQueueRow {
    queue_type: 'admission' | 'visit';
    admission_id: number | null;
    visit_id?: number | null;
    visit_number?: string | null;
    admission_number?: string | null;
    admission_date: string | null;
    patient_id: number;
    patient_name: string;
    patient_number: string;
    cnic?: string | null;
    department_name?: string | null;
    ward_name?: string | null;
    room_name?: string | null;
    bed_name?: string | null;
    visit_type?: string | null;
    doctor_name?: string | null;
    status: string;
}

export interface PatientFormData {
    [key: string]: string | File | null;
    cnic: string;
    full_name: string;
    father_name: string;
    gender: string;
    date_of_birth: string;
    age: string;
    phone: string;
    emergency_contact: string;
    address: string;
    blood_group: string;
    allergies: string;
    medical_history: string;
    photo: File | null;
    assigned_doctor_id: string;
    department_id: string;
    checkup_type: string;
    chief_complaint: string;
    visit_date: string;
}

export interface AdmissionFormData {
    [key: string]: string;
    admission_date: string;
    admission_time: string;
    department_id: string;
    ward_id: string;
    room_id: string;
    bed_id: string;
    attending_doctor_id: string;
    admission_reason: string;
    initial_condition: string;
    status: string;
    discharge_date: string;
    discharge_summary: string;
}

export interface DiagnosisFormData {
    [key: string]: string;
    visit_id: string;
    admission_id: string;
    visit_date: string;
    visit_type: string;
    doctor_id: string;
    chief_complaint: string;
    vitals: string;
    notes: string;
    diagnosis: string;
    clinical_notes: string;
    severity: string;
    follow_up_date: string;
}

export interface PrescriptionItemFormData {
    [key: string]: string;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    inventory_item_id: string;
    prescribed_quantity: string;
}

export interface PrescriptionFormData {
    [key: string]: string | PrescriptionItemFormData[];
    prescription_date: string;
    instructions: string;
    printable_notes: string;
    items: PrescriptionItemFormData[];
}

export interface PatientIndexPageProps extends ReactSharedPageProps {
    filters: PatientListFilters;
    patients: PaginatedResponse<PatientListRow>;
    permissions: PatientPermissions;
}

export interface PatientSearchPageProps extends ReactSharedPageProps {
    query: string;
    results: PatientListRow[];
}

export interface PatientFormPageProps extends ReactSharedPageProps {
    patient: PatientListRow | null;
    existingMatches: PatientListRow[];
    options: {
        departments: DepartmentOption[];
        locations: LocationOption[];
        doctors: DoctorOption[];
    };
    permissions: PatientPermissions;
}

export interface PatientShowPageProps extends ReactSharedPageProps {
    patient: PatientListRow;
    permissions: PatientPermissions;
    options: {
        departments: DepartmentOption[];
        locations: LocationOption[];
        doctors: DoctorOption[];
    };
}

export interface PatientHistoryPageProps extends ReactSharedPageProps {
    patient: PatientListRow;
}

export interface AdmissionFormPageProps extends ReactSharedPageProps {
    patient: {
        id: number;
        patient_number: string;
        full_name: string;
        cnic?: string | null;
    };
    admission: AdmissionRecord | null;
    options: {
        departments: DepartmentOption[];
        locations: LocationOption[];
        doctors: DoctorOption[];
        statuses: Array<{ value: string; label: string }>;
    };
}

export interface AdmissionShowPageProps extends ReactSharedPageProps {
    admission: AdmissionRecord & {
        patient_id: number;
        patient_name: string;
        patient_number: string;
        cnic?: string | null;
        attending_doctor_id?: number | null;
        visits: Array<{
            id: number;
            visit_number: string;
            visit_date: string | null;
            visit_type: string;
            doctor_name?: string | null;
            chief_complaint: string;
        }>;
    };
    can: {
        edit: boolean;
        discharge: boolean;
        diagnose: boolean;
        changeDoctor: boolean;
    };
    options: {
        departments: DepartmentOption[];
        locations: LocationOption[];
        doctors: DoctorOption[];
        statuses: Array<{ value: string; label: string }>;
    };
}

export interface DoctorQueuePageProps extends ReactSharedPageProps {
    queue: PaginatedResponse<AdmissionQueueRow>;
}

export interface DiagnosisFormPageProps extends ReactSharedPageProps {
    patient: {
        id: number;
        patient_number: string;
        full_name: string;
        cnic?: string | null;
    };
    diagnosis?: {
        id: number;
        visit_id: number;
        admission_id?: number | null;
        visit_date: string;
        visit_type: string;
        doctor_id: number;
        chief_complaint: string;
        vitals?: string | null;
        notes?: string | null;
        diagnosis: string;
        clinical_notes?: string | null;
        severity?: string | null;
        follow_up_date?: string | null;
    } | null;
    pendingVisit?: {
        id: number;
        visit_number: string;
        visit_date: string;
        visit_type: string;
        doctor_id: number;
        chief_complaint: string;
        vitals?: string | null;
        notes?: string | null;
        admission_id?: number | null;
    } | null;
    options: {
        admissions: Array<{ id: number; admission_number: string; admission_date: string | null }>;
        doctors: DoctorOption[];
        visitTypes: Array<{ value: string; label: string }>;
        severities: Array<{ value: string; label: string }>;
    };
}

export interface PrescriptionFormPageProps extends ReactSharedPageProps {
    patient: {
        id: number;
        patient_number: string;
        full_name: string;
        cnic?: string | null;
        gender: string;
        age?: number | null;
    };
    visit: {
        id: number;
        visit_number: string;
        visit_date: string | null;
        doctor_id: number;
        doctor_name?: string | null;
        chief_complaint: string;
        diagnosis_summary?: string | null;
        follow_up_date?: string | null;
    };
    prescription: PrescriptionRecord | null;
    can?: {
        edit?: boolean;
    };
}

export interface PrescriptionShowPageProps extends ReactSharedPageProps {
    patient: {
        id: number;
        patient_number: string;
        full_name: string;
        cnic?: string | null;
        gender: string;
        age?: number | null;
    };
    prescription: {
        id: number;
        prescription_number: string;
        prescription_date: string | null;
        doctor_name?: string | null;
        visit_id: number;
        visit_number?: string | null;
        dispensing_status?: string | null;
        diagnosis_summary?: string | null;
        follow_up_date?: string | null;
        instructions?: string | null;
        printable_notes?: string | null;
        items: PrescriptionItemRecord[];
    };
    can: {
        print: boolean;
        edit: boolean;
    };
    edit_locked?: boolean;
    edit_lock_message?: string | null;
}
