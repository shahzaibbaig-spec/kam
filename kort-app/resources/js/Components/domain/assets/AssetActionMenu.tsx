import { ArrowRightLeft, Eye, Pencil, Printer, ScanLine, Tags } from 'lucide-react';

import { AppDropdownActionMenu } from '@/Components/data-display/AppDropdownActionMenu';
import type { AssetDetailPermissions, AssetListPermissions, AssetListRow } from '@/types/assets';
import type { AppDropdownItem } from '@/types/app-shell';

export interface AssetActionMenuProps {
    asset: Pick<AssetListRow, 'id' | 'tag_number'> & { asset_id?: number | null };
    permissions: Partial<AssetListPermissions & AssetDetailPermissions>;
}

export function AssetActionMenu({ asset, permissions }: AssetActionMenuProps) {
    const assetId = typeof asset.id === 'number' ? asset.id : typeof asset.asset_id === 'number' ? asset.asset_id : null;
    const items: AppDropdownItem[] = [];

    if (assetId !== null) {
        items.push({
            label: 'View asset',
            href: route('assets.show', assetId),
            icon: Eye,
        });
    }

    if (permissions.edit && assetId !== null) {
        items.push({
            label: 'Edit asset',
            href: route('assets.edit', assetId),
            icon: Pencil,
        });
    }

    if (permissions.issue && assetId !== null) {
        items.push({
            label: 'Issue asset',
            href: route('assets.issue.create', assetId),
            icon: ArrowRightLeft,
        });
    }

    if (permissions.transfer && assetId !== null) {
        items.push({
            label: 'Transfer asset',
            href: route('assets.transfer.create', assetId),
            icon: ArrowRightLeft,
        });
    }

    if (permissions.generateTag && !asset.tag_number && assetId !== null) {
        items.push({
            label: 'Generate tag',
            href: route('assets.tags.create', assetId),
            icon: Tags,
        });
    }

    if (permissions.regenerateTag && asset.tag_number && assetId !== null) {
        items.push({
            label: 'Re-generate tag',
            href: route('assets.tags.create', assetId),
            icon: Tags,
        });
    }

    if (permissions.printLabel && asset.tag_number && assetId !== null) {
        items.push({
            label: 'Print label',
            icon: Printer,
            onSelect: () => window.open(route('assets.labels.show', assetId), '_blank', 'noopener'),
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
