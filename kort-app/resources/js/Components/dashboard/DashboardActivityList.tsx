import { Activity } from 'lucide-react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { DashboardEmptyState } from '@/Components/dashboard/DashboardEmptyState';
import { formatDateTime, formatTitleCase } from '@/Lib/utils';
import type { DashboardActivityItem } from '@/types/dashboard';

export interface DashboardActivityListProps {
    items: DashboardActivityItem[];
}

export function DashboardActivityList({ items }: DashboardActivityListProps) {
    if (items.length === 0) {
        return (
            <DashboardEmptyState
                title="No recent activity yet"
                description="Once staff actions are recorded, audit-ready operational updates will appear here."
                icon={Activity}
            />
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={`${item.description}-${item.createdAt ?? index}`} className="flex gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                    <div className="flex flex-col items-center">
                        <div className="mt-0.5 h-3 w-3 rounded-full bg-blue-600" />
                        {index !== items.length - 1 ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-medium text-slate-900">{item.description}</p>
                            <AppBadge variant="outline" className="bg-white">
                                {formatTitleCase(item.event ?? 'recorded')}
                            </AppBadge>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">
                            {item.causerName} | {formatDateTime(item.createdAt)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
