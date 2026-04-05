import { FilePlus2, ShoppingCart } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppEmptyState, AppEmptyStateAction } from '@/Components/data-display/AppEmptyState';
import { AppPagination } from '@/Components/data-display/AppPagination';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { ProcurementActionMenu } from '@/Components/domain/procurement/ProcurementActionMenu';
import { ProcurementFiltersBar } from '@/Components/domain/procurement/ProcurementFiltersBar';
import { PurchaseOrderStatusBadge } from '@/Components/domain/procurement/ProcurementBadges';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { hasPermission, toAppSelectOptions } from '@/Lib/procurement';
import { formatCurrency, formatShortDate } from '@/Lib/utils';
import { AppLayout } from '@/Layouts/AppLayout';
import type { PurchaseOrderIndexPageProps, PurchaseOrderListFilters, PurchaseOrderListRow } from '@/types/procurement';
import type { AppDropdownItem } from '@/types/app-shell';

function purchaseOrderActionItems(purchaseOrder: PurchaseOrderListRow, canEdit: boolean, canReceive: boolean): AppDropdownItem[] {
    return [
        { label: 'View Purchase Order', href: route('procurement.purchase-orders.show', purchaseOrder.id) },
        ...(canEdit && purchaseOrder.status === 'draft'
            ? [{ label: 'Edit Draft', href: route('procurement.purchase-orders.edit', purchaseOrder.id) }]
            : []),
        ...(canReceive && ['issued', 'partially_received'].includes(String(purchaseOrder.status ?? ''))
            ? [{ label: 'Create Goods Receipt', href: route('procurement.goods-receipts.create', { purchase_order: purchaseOrder.id }) }]
            : []),
    ];
}

export default function PurchaseOrderIndexPage() {
    const { props } = useReactPage<PurchaseOrderIndexPageProps>();
    const form = useInertiaForm<PurchaseOrderListFilters>({
        search: props.filters.search ?? '',
        status: props.filters.status ?? '',
        supplier_id: props.filters.supplier_id ?? '',
        purchase_requisition_id: props.filters.purchase_requisition_id ?? '',
    });
    const userPermissions = props.auth.user?.permissions ?? [];
    const canCreate = props.permissions?.create ?? false;
    const canEdit = hasPermission(userPermissions, 'purchase-order.edit');
    const canReceive = hasPermission(userPermissions, 'goods-receipt.create');

    const submitFilters = () => {
        form.get(route('procurement.purchase-orders.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        form.setValues({
            search: '',
            status: '',
            supplier_id: '',
            purchase_requisition_id: '',
        });

        form.get(route('procurement.purchase-orders.index'), {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Purchase Orders' },
            ]}
        >
            <div className="space-y-6">
                <div className="app-surface overflow-hidden p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Purchase Order Control</p>
                            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Purchase orders</h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Manage supplier-issued purchase orders, receiving progress, and closure status from one procurement workspace.
                            </p>
                        </div>
                        {canCreate ? (
                            <AppButton asChild>
                                <AppLink href={route('procurement.purchase-orders.create')}>
                                    <FilePlus2 className="h-4 w-4" />
                                    Create Purchase Order
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
                        placeholder="Search PO number or remarks"
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
                        value={form.data.purchase_requisition_id ?? ''}
                        onChange={(event) => form.setData('purchase_requisition_id', event.target.value)}
                        options={toAppSelectOptions(props.filterOptions.requisitions, { label: 'Any requisition', value: '' })}
                    />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">{props.purchaseOrders.meta.total}</p>
                        <p className="mt-1">PO records matching current filters</p>
                    </div>
                </ProcurementFiltersBar>

                <AppTableShell
                    title="Purchase order records"
                    description="Supplier commitments, linked requisitions, and receiving status remain visible here."
                    footer={<AppPagination links={props.purchaseOrders.links} />}
                >
                    {props.purchaseOrders.data.length === 0 ? (
                        <div className="p-6">
                            <AppEmptyState
                                title="No purchase orders found"
                                description="Adjust filters or create a new purchase order to continue procurement processing."
                                icon={ShoppingCart}
                                action={
                                    canCreate ? (
                                        <AppEmptyStateAction asChild>
                                            <AppLink href={route('procurement.purchase-orders.create')}>Create Purchase Order</AppLink>
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
                                        <th className="px-6 py-3.5">PO</th>
                                        <th className="px-6 py-3.5">Supplier</th>
                                        <th className="px-6 py-3.5">Linked Requisition</th>
                                        <th className="px-6 py-3.5">PO Date</th>
                                        <th className="px-6 py-3.5">Total</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {props.purchaseOrders.data.map((purchaseOrder) => (
                                        <tr key={purchaseOrder.id} className="transition hover:bg-slate-50/80">
                                            <td className="px-6 py-4">
                                                <AppLink href={route('procurement.purchase-orders.show', purchaseOrder.id)} className="block">
                                                    <p className="font-semibold text-slate-900">{purchaseOrder.po_number}</p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Delivery {formatShortDate(purchaseOrder.expected_delivery_date)}
                                                    </p>
                                                </AppLink>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{purchaseOrder.supplier_name ?? 'No supplier'}</td>
                                            <td className="px-6 py-4 text-slate-700">{purchaseOrder.requisition_number ?? 'Standalone'}</td>
                                            <td className="px-6 py-4 text-slate-700">{formatShortDate(purchaseOrder.po_date)}</td>
                                            <td className="px-6 py-4 text-slate-700">{formatCurrency(purchaseOrder.total_amount, purchaseOrder.currency ?? 'PKR')}</td>
                                            <td className="px-6 py-4">
                                                <PurchaseOrderStatusBadge value={purchaseOrder.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <ProcurementActionMenu items={purchaseOrderActionItems(purchaseOrder, canEdit, canReceive)} />
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
