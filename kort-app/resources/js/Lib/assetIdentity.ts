type MaybeWrappedRecord<T> = T | { data?: T } | null | undefined;

export function unwrapResourceRecord<T>(value: MaybeWrappedRecord<T>): T | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'object' && value !== null && 'data' in (value as Record<string, unknown>)) {
        const wrappedData = (value as { data?: unknown }).data;

        if (wrappedData && typeof wrappedData === 'object') {
            return wrappedData as T;
        }
    }

    return value as T;
}

export function resolveAssetIdentifier(value: unknown): number | null {
    const asset = unwrapResourceRecord<{ id?: unknown; asset_id?: unknown }>(value);

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
            return null;
        }

        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}
