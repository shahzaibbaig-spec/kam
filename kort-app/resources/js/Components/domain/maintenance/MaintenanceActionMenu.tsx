import { Eye, Pencil, Wrench } from 'lucide-react';

import { AppButton } from '@/Components/ui/AppButton';
import { AppDropdown } from '@/Components/ui/AppDropdown';
import type { MaintenanceListRow } from '@/types/maintenance';

export interface MaintenanceActionMenuProps {
    ticket: MaintenanceListRow;
    canEdit: boolean;
    canViewAsset: boolean;
}

export function MaintenanceActionMenu({ ticket, canEdit, canViewAsset }: MaintenanceActionMenuProps) {
    const items = [
        {
            label: 'View Ticket',
            href: route('maintenance.show', ticket.id),
            icon: Eye,
        },
        ...(canEdit
            ? [
                  {
                      label: 'Edit Ticket',
                      href: route('maintenance.edit', ticket.id),
                      icon: Pencil,
                  },
              ]
            : []),
        ...(canViewAsset && ticket.asset_id
            ? [
                  {
                      label: 'View Asset',
                      href: route('assets.show', ticket.asset_id),
                      icon: Wrench,
                  },
              ]
            : []),
    ];

    return (
        <AppDropdown
            items={items}
            trigger={
                <AppButton variant="ghost" size="sm">
                    Actions
                </AppButton>
            }
        />
    );
}
