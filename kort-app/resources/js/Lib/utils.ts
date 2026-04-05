import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatLabel(value: string | number | boolean | null | undefined) {
    if (value === true) {
        return 'Yes';
    }

    if (value === false) {
        return 'No';
    }

    return String(value ?? '')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .trim();
}

export function formatTitleCase(value: string | number | boolean | null | undefined) {
    return formatLabel(value).replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatShortDate(value: string | null | undefined, locale = 'en-US') {
    if (!value) {
        return 'Not available';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

export function formatDateTime(value: string | null | undefined, locale = 'en-US') {
    if (!value) {
        return 'Not available';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

export function formatCurrency(value: string | number | null | undefined, currency = 'PKR', locale = 'en-PK') {
    if (value === null || value === undefined || value === '') {
        return 'Not available';
    }

    const amount = typeof value === 'number' ? value : Number(value);

    if (Number.isNaN(amount)) {
        return String(value);
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function joinDisplayParts(
    values: Array<string | number | boolean | null | undefined>,
    separator = ' / ',
    fallback = 'Not available',
) {
    const text = values
        .map((value) => (value === null || value === undefined ? '' : String(value).trim()))
        .filter(Boolean)
        .join(separator);

    return text || fallback;
}

export function getInitials(value: string | null | undefined) {
    if (!value) {
        return 'KA';
    }

    return value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function routeStartsWith(currentRoute: string | undefined, routeName: string) {
    return currentRoute === routeName || currentRoute?.startsWith(`${routeName}.`) === true;
}
