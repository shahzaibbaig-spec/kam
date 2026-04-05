import { MoreHorizontal } from 'lucide-react';

import { AppButton } from '@/Components/ui/AppButton';
import { AppDropdown } from '@/Components/ui/AppDropdown';
import type { AppDropdownItem } from '@/types/app-shell';

export interface AppDropdownActionMenuProps {
    items: AppDropdownItem[];
}

export function AppDropdownActionMenu({ items }: AppDropdownActionMenuProps) {
    return (
        <AppDropdown
            items={items}
            trigger={
                <AppButton aria-label="Open actions" variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </AppButton>
            }
        />
    );
}
