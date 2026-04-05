import type { AppSelectOption } from '@/Components/ui/AppSelect';

type ProcurementSelectRecord = {
    id?: string | number;
    value?: string | number;
    label?: string;
    name?: string;
    code?: string | null;
    item_name?: string | null;
    supplier_name?: string | null;
    requisition_number?: string | null;
    po_number?: string | null;
    item_description?: string | null;
    item_code?: string | null;
    designation?: string | null;
    payment_terms?: string | null;
    supplier_type?: string | null;
};

export function getFieldError(errors: Record<string, string>, path: string) {
    return errors[path];
}

function firstPresentValue(...values: Array<string | number | null | undefined>) {
    return values.find((value) => value !== null && value !== undefined && String(value).trim() !== '');
}

function buildOptionLabel(record: ProcurementSelectRecord) {
    const primary = firstPresentValue(
        record.label,
        record.name,
        record.item_name,
        record.supplier_name,
        record.requisition_number,
        record.po_number,
        record.item_description,
        record.code,
        record.item_code,
    );
    const secondary = firstPresentValue(
        record.code,
        record.item_code,
        record.designation,
        record.payment_terms,
        record.supplier_type,
    );

    if (primary && secondary && String(primary) !== String(secondary) && !String(primary).includes(String(secondary))) {
        return `${primary} (${secondary})`;
    }

    return String(primary ?? secondary ?? 'Unnamed option');
}

export function toAppSelectOptions(
    records: ProcurementSelectRecord[],
    placeholder?: AppSelectOption,
): AppSelectOption[] {
    const options = records.map((record) => ({
        value: record.id ?? record.value ?? '',
        label: buildOptionLabel(record),
    }));

    return placeholder ? [placeholder, ...options] : options;
}

export function asStringValue(value: string | number | null | undefined) {
    return value === null || value === undefined ? '' : String(value);
}

export function asNumber(value: string | number | null | undefined) {
    const parsed = Number(value ?? 0);

    return Number.isFinite(parsed) ? parsed : 0;
}

export function updateArrayItem<T>(items: T[], index: number, updater: (item: T) => T) {
    return items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
}

export function removeArrayItem<T>(items: T[], index: number) {
    return items.filter((_, itemIndex) => itemIndex !== index);
}

export function hasPermission(permissions: string[] | null | undefined, permission: string) {
    return Array.isArray(permissions) && permissions.includes(permission);
}
