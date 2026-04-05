import { Camera, ScanLine, Search } from 'lucide-react';
import { router } from '@inertiajs/core';
import { useMemo, useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { InventoryScanResultCard } from '@/Components/domain/inventory/InventoryScanResultCard';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLayout } from '@/Layouts/AppLayout';
import type { InventoryScanPageProps } from '@/types/inventory';

export default function InventoryScanPage() {
    const { props } = useReactPage<InventoryScanPageProps>();
    const [query, setQuery] = useState(props.query ?? '');

    const results = useMemo(() => (Array.isArray(props.results) ? props.results : (props.results.data ?? [])), [props.results]);

    const submit = () => {
        router.get(
            route('inventory.scan.lookup'),
            { query },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Inventory', href: route('inventory.items.index') },
                { label: 'Scan Item' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Scan Inventory Item"
                    description="Use a barcode scanner or quick lookup value to open the right inventory record without stepping through the full list."
                />

                <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <AppCard className="border-blue-100">
                        <AppCardHeader className="border-b border-slate-100">
                            <AppCardTitle>Scanner-ready input</AppCardTitle>
                            <AppCardDescription>The search field below is ready for handheld scanners, pasted values, and manual lookup.</AppCardDescription>
                        </AppCardHeader>
                        <AppCardContent className="space-y-6 p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Scan or search value</label>
                                <AppSearchInput
                                    autoFocus
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Barcode, item code, item name, or batch number"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <AppButton type="button" onClick={submit}>
                                    <Search className="h-4 w-4" />
                                    Find item
                                </AppButton>
                            </div>

                            <AppAlert
                                variant="info"
                                title="Scanner input works best in the active field"
                                description="Place the cursor in the search box, scan the barcode, and the value should populate automatically before lookup."
                            />

                            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/80 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Camera className="h-4 w-4 text-blue-700" />
                                    Camera scan placeholder
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    Camera-based scan can be layered in later if the deployment environment supports it. For now, USB scanners and pasted codes work well here.
                                </p>
                            </div>
                        </AppCardContent>
                    </AppCard>

                    <AppCard>
                        <AppCardHeader className="border-b border-slate-100">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <AppCardTitle>Lookup results</AppCardTitle>
                                    <AppCardDescription>Multiple matches are shown here so staff can open the correct inventory record quickly.</AppCardDescription>
                                </div>
                                {props.query ? <span className="text-sm text-slate-500">Search: {props.query}</span> : null}
                            </div>
                        </AppCardHeader>
                        <AppCardContent className="space-y-4 p-6">
                            {!props.searched ? (
                                <AppEmptyState
                                    title="Ready to scan"
                                    description="Scan a barcode, type an item code, or search by item name or batch number to begin."
                                />
                            ) : results.length === 0 ? (
                                <AppAlert
                                    variant="warning"
                                    title="No inventory item matched the scan"
                                    description={`No inventory item matched "${props.query}". Check the barcode or search using an item code or item name.`}
                                />
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <ScanLine className="h-4 w-4 text-blue-700" />
                                        {results.length} matching record{results.length === 1 ? '' : 's'}
                                    </div>
                                    {results.map((item) => (
                                        <InventoryScanResultCard key={item.id} item={item} />
                                    ))}
                                </>
                            )}
                        </AppCardContent>
                    </AppCard>
                </div>
            </div>
        </AppLayout>
    );
}
