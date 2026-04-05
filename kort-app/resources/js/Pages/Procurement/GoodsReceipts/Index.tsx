import { FilePlus2, ReceiptText } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppEmptyState, AppEmptyStateAction } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { ProcurementActionMenu } from '@/Components/domain/procurement/ProcurementActionMenu';
import { ProcurementFiltersBar } from '@/Components/domain/procurement/ProcurementFiltersBar';
import { DiscrepancyBadge, GoodsReceiptStatusBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { hasPermission, toAppSelectOptions } from '@/Lib/procurement';
import { formatShortDate } from '@/Lib/utils';
import { AppLayout } from '@/Layouts/AppLayout';
import type { GoodsReceiptIndexPageProps, GoodsReceiptListFilters, GoodsReceiptListRow } from '@/types/procurement';
import type { AppDropdownItem } from '@/types/app-shell';

function goodsReceiptActionItems(goodsReceipt: GoodsReceiptListRow, canViewPurchaseOrder: boolean): AppDropdownItem[] {
    return [
        { label: 'View Receipt', href: route('procurement.goods-receipts.show', goodsReceipt.id) },
        ...(canViewPurchaseOrder && goodsReceipt.purchase_order_id
            ? [{ label: 'View Linked PO', href: route('procurement.purchase-orders.show', goodsReceipt.purchase_order_id) }]
            : []),
    ];
}

export default function GoodsReceiptIndexPage() {
    const { props } = useReactPage<GoodsReceiptIndexPageProps>();
    const form = useInertiaForm<GoodsReceiptListFilters>({
        search: props.filters.search ?? '',
        status: props.filters.status ?? '',
        supplier_id: props.filters.supplier_id ?? '',
        purchase_order_id: props.filters.purchase_order_id ?? '',
    });
    const userPermissions = props.auth.user?.permissions ?? [];
    const canCreate = props.permissions?.create ?? false;
    const canViewPurchaseOrder = hasPermission(userPermissions, 'purchase-order.view');

    const submitFilters = () => {
        form.get(route('procurement.goods-receipts.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        form.setValues({
            search: '',
            status: '',
            supplier_id: '',
            purchase_order_id: '',
        });

        form.get(route('procurement.goods-receipts.index'), {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Goods Receipts' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Receiving Control</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Goods receipts</h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Process deliveries, discrepancies, and receipt outcomes with clear ordered vs received visibility.
                            </p>
                        </div>
                        {canCreate ? (
                            <AppButton asChild>
                                <AppLink href={route('procurement.goods-receipts.create')}>
                                    <FilePlus2 className="h-4 w-4" />
                                    Create Goods Receipt
                                </AppLink>
                            </AppButton>
                        ) : null}
                    </div>
                </div>

                <ProcurementFiltersBar
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitFilters();
                    }}
                    onReset={resetFilters}
                >
                    <AppSearchInput
                        placeholder="Search GRN number, invoice, or delivery note"
                        value={form.data.search ?? ''}
                        onChange={(event) => form.setData('search', event.target.value)}
                    />
                    <AppSelect
                        value={form.data.status ?? ''}
                        onChange={(event) => form.setData('status', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.statuses, { label: 'Any status', value: '' })}
                    />
                    <AppSelect
                        value={form.data.supplier_id ?? ''}
                        onChange={(event) => form.setData('supplier_id', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.suppliers, { label: 'Any supplier', value: '' })}
                    />
                    <AppSelect
                        value={form.data.purchase_order_id ?? ''}
                        onChange={(event) => form.setData('purchase_order_id', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.purchaseOrders, { label: 'Any purchase order', value: '' })}
                    />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">{props.goodsReceipts.meta.total}</p>
                        <p className="mt-1">Receipt records matching current filters</p>
                    </div>
                </ProcurementFiltersBar>

                <AppTableShell
                    title="Goods receipt records"
                    description="Receipts, invoice references, discrepancies, and linked purchase orders all stay visible here."
                    footer={<AppPagination links={props.goodsReceipts.links} />}
                >
                    {props.goodsReceipts.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No goods receipts found"
                                description="Adjust filters or process a purchase order delivery to create the first receipt."
                                icon={ReceiptText}
                                action={
                                    canCreate ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('procurement.goods-receipts.create')}>Create Goods Receipt</AppLink>
                                        </AppEmptyStateAction>
                                    ) : undefined
                                }
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3.5">GRN</th>
                                        <th className="px-6 py-3.5">Supplier</th>
                                        <th className="px-6 py-3.5">PO</th>
                                        <th className="px-6 py-3.5">Receipt Date</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Flag</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.goodsReceipts.data.map((goodsReceipt) => (
                                        <tr key={goodsReceipt.id} className="transition hover:bg-slate-50/80">
                                            <td className="px-6 py-4">
                                                <AppLink href={route('procurement.goods-receipts.show', goodsReceipt.id)} className="block">
                                                    <p className="font-semibold text-slate-900">{goodsReceipt.grn_number}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{goodsReceipt.invoice_reference ?? 'No invoice reference'}</p>
                                                </AppLink>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{goodsReceipt.supplier_name ?? 'No supplier'}</td>
                                            <td className="px-6 py-4 text-slate-700">{goodsReceipt.purchase_order_number ?? 'Standalone'}</td>
                                            <td className="px-6 py-4 text-slate-700">{formatShortDate(goodsReceipt.receipt_date)}</td>
                                            <td className="px-6 py-4">
                                                <GoodsReceiptStatusBadge value={goodsReceipt.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <DiscrepancyBadge flagged={goodsReceipt.status === 'flagged'} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <ProcurementActionMenu items={goodsReceiptActionItems(goodsReceipt, canViewPurchaseOrder)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AppTableShell>
            </div>
        </AppLayout>
    );
}
