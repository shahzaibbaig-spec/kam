import { AppDropdownActionMenu } from '@/Components/data-display/AppDropdownActionMenu';
import type { AppDropdownItem } from '@/types/app-shell';

export interface ProcurementActionMenuProps {
    items: AppDropdownItem[];
}

export function ProcurementActionMenu({ items }: ProcurementActionMenuProps) {
    return <AppDropdownActionMenu items={items.filter((item) => !item.disabled)} />;
}
