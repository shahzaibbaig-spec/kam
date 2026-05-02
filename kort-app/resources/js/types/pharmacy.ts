import type { ReactSharedPageProps } from '@/types/app-shell';

export interface PharmacyLookupPrescriptionListRow {
    id: number;
    prescription_number: string;
    prescription_date?: string | null;
    dispensing_status: string;
    doctor_name?: string | null;
    patient: {
        id: number;
        patient_number: string;
        full_name: string;
        cnic?: string | null;
    };
}

export interface PharmacyLookupItemRow {
    id: number;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string | null;
    inventory_item_id?: number | null;
    inventory_item_name?: string | null;
    unit_of_measure?: string | null;
    prescribed_quantity?: number | null;
    dispensed_quantity?: number | null;
    remaining_quantity?: number | null;
    dispensing_status: string;
    available_stock?: number | null;
    batches: Array<{
        id: number;
        batch_number: string;
        expiry_date?: string | null;
        available_quantity: number;
        status: string;
    }>;
}

export interface PharmacyLookupSelectedPrescription {
    id: number;
    prescription_number: string;
    prescription_date?: string | null;
    dispensing_status: string;
    instructions?: string | null;
    printable_notes?: string | null;
    doctor_name?: string | null;
    diagnosis_summary?: string | null;
    patient: {
        id: number;
        patient_number: string;
        full_name: string;
        cnic?: string | null;
        gender?: string | null;
        age?: number | null;
    };
    items: PharmacyLookupItemRow[];
}

export interface PharmacyLookupPageProps extends ReactSharedPageProps {
    query: string;
    prescriptions: PharmacyLookupPrescriptionListRow[];
    medicines: Array<{
        id: number;
        item_name: string;
        item_code?: string | null;
        unit_of_measure?: string | null;
        current_quantity: number;
        available_quantity: number;
        is_available: boolean;
    }>;
    selectedPrescription: PharmacyLookupSelectedPrescription | null;
    can: {
        dispense: boolean;
        printSlip: boolean;
    };
}

export interface PharmacyReportRow {
    id: number;
    dispensed_at?: string | null;
    patient_name?: string | null;
    patient_number?: string | null;
    prescription_number?: string | null;
    doctor_name?: string | null;
    pharmacist_name?: string | null;
    medicine_name?: string | null;
    batch_number?: string | null;
    expiry_date?: string | null;
    dispensed_quantity: number;
    unit_of_measure: string;
}

export interface PharmacyReportPageProps extends ReactSharedPageProps {
    filters: {
        period: string;
        date_from: string;
        date_to: string;
        medicine: string;
        patient: string;
        doctor: string;
        pharmacist: string;
        department: string;
        batch_number: string;
    };
    summary: {
        total_dispensed_quantity: number;
        total_records: number;
        patients_covered: number;
        medicines_covered: number;
    };
    medicineUsage: Array<{
        medicine_name: string;
        dispensed_quantity: number;
        dispensing_count: number;
    }>;
    rows: PharmacyReportRow[];
    can: {
        export: boolean;
    };
}
