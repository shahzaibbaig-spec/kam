type MaybeWrappedRecord<T> = T | { data?: T } | null | undefined;

export function unwrapResourceRecord<T>(value: MaybeWrappedRecord<T>): T | null {
    if (value === null || value === undefined) {
        return null;
    }

    let current: unknown = value;

    while (typeof current === 'object' && current !== null && 'data' in (current as Record<string, unknown>)) {
        const wrappedData = (current as { data?: unknown }).data;

        if (!wrappedData || typeof wrappedData !== 'object') {
            break;
        }

        current = wrappedData;
    }

    return current as T;
}

function parseAssetIdFromUrl(): number | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const match = window.location.pathname.match(/\/assets\/(\d+)(?:\/|$)/);
    if (!match) {
        return null;
    }

    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
}

export function resolveAssetIdentifier(value: unknown): number | null {
    const asset = unwrapResourceRecord<{ id?: unknown; asset_id?: unknown }>(value as MaybeWrappedRecord<{ id?: unknown; asset_id?: unknown }>);

    if (!asset) {
        return null;
    }

    const candidate = asset.id ?? asset.asset_id;

    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate;
    }

    if (typeof candidate === 'string') {
        const trimmed = candidate.trim();
        if (trimmed === '') {
            return parseAssetIdFromUrl();
        }

        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : parseAssetIdFromUrl();
    }

    return parseAssetIdFromUrl();
}
