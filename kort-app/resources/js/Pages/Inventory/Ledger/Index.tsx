import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { router } from '@inertiajs/core';
import { useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { InventoryLedgerTable } from '@/Components/domain/inventory/InventoryLedgerTable';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryLedgerPageProps } from '@/types/inventory';

type LedgerFilters = {
    search: string;
    item_id: string;
    location_id: string;
    date_from: string;
    date_to: string;
};

function emptyFilters(props: InventoryLedgerPageProps): LedgerFilters {
    return {
        search: props.filters.search ?? '',
        item_id: props.filters.item_id ?? '',
        location_id: props.filters.location_id ?? '',
        date_from: props.filters.date_from ?? '',
        date_to: props.filters.date_to ?? '',
    };
}

export default function InventoryLedgerIndexPage() {
    const { props } = useReactPage<InventoryLedgerPageProps>();
    const [filters, setFilters] = useState<LedgerFilters>(emptyFilters(props));

    const setFilter = <TField extends keyof LedgerFilters>(field: TField, value: LedgerFilters[TField]) => {
        setFilters((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const applyFilters = () => {
        router.get(route('inventory.ledger.index'), filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const next = {
            search: '',
            item_id: '',
            location_id: '',
            date_from: '',
            date_to: '',
        };
        setFilters(next);
        router.get(route('inventory.ledger.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Inventory', href: route('inventory.items.index') },
                { label: 'Ledger' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Inventory Ledger"
                    description="Track receipts, issues, returns, transfers, quarantine activity, expiry actions, and manual adjustments in one chronological ledger."
                    actions={
                        <AppButton asChild variant="outline">
                            <AppLink href={route('inventory.items.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to inventory
                            </AppLink>
                        </AppButton>
                    }
                />

                <AppTableShell
                    title="Ledger entries"
                    description={`Showing ${props.transactions.meta.from ?? 0} to ${props.transactions.meta.to ?? 0} of ${props.transactions.meta.total} transactions.`}
                    toolbar={
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                            <AppSearchInput
                                value={filters.search}
                                onChange={(event) => setFilter('search', event.target.value)}
                                placeholder="Reference, item, batch, or remark"
                            />
                            <AppSelect value={filters.item_id} onChange={(event) => setFilter('item_id', event.target.value)}>
                                <option value="">Any item</option>
                                {(props.filterOptions.items ?? []).map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.item_name} ({item.item_code})
                                    </option>
                                ))}
                            </AppSelect>
                            <AppSelect value={filters.location_id} onChange={(event) => setFilter('location_id', event.target.value)}>
                                <option value="">Any location</option>
                                {(props.filterOptions.locations ?? []).map((location) => (
                                    <option key={location.id ?? location.name} value={location.id}>
                                        {location.name}
                                    </option>
                                ))}
                            </AppSelect>
                            <AppDateField value={filters.date_from} onChange={(event) => setFilter('date_from', event.target.value)} />
                            <AppDateField value={filters.date_to} onChange={(event) => setFilter('date_to', event.target.value)} />
                            <div className="flex gap-3 md:col-span-2 xl:col-span-5">
                                <AppButton type="button" size="sm" onClick={applyFilters}>
                                    Apply filters
                                </AppButton>
                                <AppButton type="button" size="sm" variant="outline" onClick={resetFilters}>
                                    <RefreshCcw className="h-4 w-4" />
                                    Reset
                                </AppButton>
                            </div>
                        </div>
                    }
                    footer={props.transactions.links.length > 0 ? <AppPagination links={props.transactions.links} /> : null}
                >
                    <InventoryLedgerTable items={props.transactions.data} />
                </AppTableShell>
            </div>
        </AppLayout>
    );
}
