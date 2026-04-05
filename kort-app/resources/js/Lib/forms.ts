import type { AppSelectOption } from '@/Components/ui/AppSelect';

type SelectRecord = {
    id?: string | number | null;
    value?: string | number | null;
    label?: string | null;
    name?: string | null;
    title?: string | null;
    code?: string | null;
    item_name?: string | null;
    supplier_name?: string | null;
    asset_name?: string | null;
    ticket_number?: string | null;
    designation?: string | null;
    serial_number?: string | null;
    certificate_number?: string | null;
};

function firstPresentValue(...values: Array<string | number | null | undefined>) {
    return values.find((value) => value !== null && value !== undefined && String(value).trim() !== '');
}

function buildOptionLabel(record: SelectRecord) {
    const primary = firstPresentValue(
        record.label,
        record.name,
        record.title,
        record.item_name,
        record.supplier_name,
        record.asset_name,
        record.ticket_number,
        record.certificate_number,
        record.code,
    );
    const secondary = firstPresentValue(record.code, record.designation, record.serial_number);

    if (primary && secondary && String(primary) !== String(secondary) && !String(primary).includes(String(secondary))) {
        return `${primary} (${secondary})`;
    }

    return String(primary ?? secondary ?? 'Unnamed option');
}

export function toAppSelectOptions(records: SelectRecord[], placeholder?: AppSelectOption): AppSelectOption[] {
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

export function getFieldError(errors: Record<string, string>, path: string) {
    return errors[path];
}

export function hasPermission(permissions: string[] | null | undefined, permission: string) {
    return Array.isArray(permissions) && permissions.includes(permission);
}
