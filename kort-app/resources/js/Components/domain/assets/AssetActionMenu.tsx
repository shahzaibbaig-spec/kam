import { ArrowRightLeft, Eye, Pencil, Printer, ScanLine, Tags } from 'lucide-react';

import { AppDropdownActionMenu } from '@/Components/data-display/AppDropdownActionMenu';
import type { AssetDetailPermissions, AssetListPermissions, AssetListRow } from '@/types/assets';
import type { AppDropdownItem } from '@/types/app-shell';

export interface AssetActionMenuProps {
    asset: Pick<AssetListRow, 'id' | 'tag_number'>;
    permissions: Partial<AssetListPermissions & AssetDetailPermissions>;
}

export function AssetActionMenu({ asset, permissions }: AssetActionMenuProps) {
    const items: AppDropdownItem[] = [
        {
            label: 'View asset',
            href: route('assets.show', asset.id),
            icon: Eye,
        },
    ];

    if (permissions.edit) {
        items.push({
            label: 'Edit asset',
            href: route('assets.edit', asset.id),
            icon: Pencil,
        });
    }

    if (permissions.issue) {
        items.push({
            label: 'Issue asset',
            href: route('assets.issue.create', asset.id),
            icon: ArrowRightLeft,
        });
    }

    if (permissions.transfer) {
        items.push({
            label: 'Transfer asset',
            href: route('assets.transfer.create', asset.id),
            icon: ArrowRightLeft,
        });
    }

    if (permissions.generateTag && !asset.tag_number) {
        items.push({
            label: 'Generate tag',
            href: route('assets.tags.create', asset.id),
            icon: Tags,
        });
    }

    if (permissions.regenerateTag && asset.tag_number) {
        items.push({
            label: 'Re-generate tag',
            href: route('assets.tags.create', asset.id),
            icon: Tags,
        });
    }

    if (permissions.printLabel && asset.tag_number) {
        items.push({
            label: 'Print label',
            icon: Printer,
            onSelect: () => window.open(route('assets.labels.show', asset.id), '_blank', 'noopener'),
        });
    }

    if (permissions.scan) {
        items.push({
            label: 'Open scan desk',
            href: route('assets.scan.index'),
            icon: ScanLine,
        });
    }

    return <AppDropdownActionMenu items={items} />;
}
