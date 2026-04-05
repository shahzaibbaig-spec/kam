import { ArrowRightLeft, ClipboardPenLine, Eye, Pencil, ScanLine, Undo2 } from 'lucide-react';

import { AppDropdownActionMenu } from '@/Components/data-display/AppDropdownActionMenu';
import type { InventoryDetailPermissions, InventoryListPermissions, InventoryListRow } from '@/types/inventory';
import type { AppDropdownItem } from '@/types/app-shell';

export interface InventoryActionMenuProps {
    item: Pick<InventoryListRow, 'id'>;
    permissions: Partial<InventoryListPermissions & InventoryDetailPermissions>;
}

export function InventoryActionMenu({ item, permissions }: InventoryActionMenuProps) {
    const items: AppDropdownItem[] = [
        {
            label: 'View item',
            href: route('inventory.items.show', item.id),
            icon: Eye,
        },
    ];

    if (permissions.edit) {
        items.push({
            label: 'Edit item',
            href: route('inventory.items.edit', item.id),
            icon: Pencil,
        });
    }

    if (permissions.receive) {
        items.push({
            label: 'Receive stock',
            href: route('inventory.receipts.create', { item: item.id }),
            icon: ArrowRightLeft,
        });
    }

    if (permissions.issue) {
        items.push({
            label: 'Issue stock',
            href: route('inventory.issues.create', { item: item.id }),
            icon: ArrowRightLeft,
        });
    }

    if (permissions.return) {
        items.push({
            label: 'Return stock',
            href: route('inventory.returns.create', { item: item.id }),
            icon: Undo2,
        });
    }

    if (permissions.transfer) {
        items.push({
            label: 'Transfer stock',
            href: route('inventory.transfers.create', { item: item.id }),
            icon: ArrowRightLeft,
        });
    }

    if (permissions.adjust) {
        items.push({
            label: 'Adjust stock',
            href: route('inventory.adjustments.create', { item: item.id }),
            icon: ClipboardPenLine,
        });
    }

    if (permissions.scan) {
        items.push({
            label: 'Scan item',
            href: route('inventory.scan.index'),
            icon: ScanLine,
        });
    }

    return <AppDropdownActionMenu items={items} />;
}
