import { ArrowRightLeft } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { DiscrepancyBanner, GoodsReceiptHeaderCard, OrderedVsReceivedCard } from '@/Components/domain/procurement/ProcurementCards';
import { GoodsReceiptItemsTable } from '@/Components/domain/procurement/ProcurementTables';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLink } from '@/Components/ui/AppLink';
import { AppLayout } from '@/Layouts/AppLayout';
import type { GoodsReceiptShowPageProps } from '@/types/procurement';

export default function GoodsReceiptShowPage() {
    const { props } = useReactPage<GoodsReceiptShowPageProps>();
    const { goodsReceipt, permissions } = props;
    const hasDiscrepancy = goodsReceipt.items.some((item) => item.has_discrepancy);

    const totals = goodsReceipt.items.reduce(
        (summary, item) => ({
            ordered: summary.ordered + Number(item.quantity_received ?? 0),
            received: summary.received + Number(item.quantity_received ?? 0),
            accepted: summary.accepted + Number(item.quantity_accepted ?? 0),
            rejected: summary.rejected + Number(item.quantity_rejected ?? 0),
        }),
        { ordered: 0, received: 0, accepted: 0, rejected: 0 },
    );

    const actions = permissions?.viewPurchaseOrder && goodsReceipt.purchase_order_id ? (
        <AppButton asChild variant="outline">
            <AppLink href={route('procurement.purchase-orders.show', goodsReceipt.purchase_order_id)}>
                <ArrowRightLeft className="h-4 w-4" />
                View Linked PO
            </AppLink>
        </AppButton>
    ) : undefined;

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Procurement' },
                { label: 'Goods Receipts', href: route('procurement.goods-receipts.index') },
                { label: goodsReceipt.grn_number },
            ]}
        >
            <div className="space-y-6">
                <GoodsReceiptHeaderCard goodsReceipt={goodsReceipt} actions={actions} />

                {hasDiscrepancy ? (
                    <DiscrepancyBanner description="This receipt contains one or more discrepancies. Review the rejected quantities, storage details, and remarks before relying on the downstream stock outcome." />
                ) : null}

                <OrderedVsReceivedCard
                    title="Receipt Outcome"
                    ordered={totals.ordered}
                    received={totals.received}
                    accepted={totals.accepted}
                    rejected={totals.rejected}
                />

                <GoodsReceiptItemsTable items={goodsReceipt.items} />
            </div>
        </AppLayout>
    );
}
