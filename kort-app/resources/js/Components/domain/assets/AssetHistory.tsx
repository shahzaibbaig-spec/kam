import { Clock3 } from 'lucide-react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import type { AssetHistoryTimelineItem, AssetMovementRecord } from '@/types/assets';
import { formatDateTime, formatTitleCase, joinDisplayParts } from '@/Lib/utils';

export interface AssetHistoryTimelineProps {
    items: AssetHistoryTimelineItem[];
    emptyTitle?: string;
    emptyDescription?: string;
}

export function AssetHistoryTimeline({
    items,
    emptyTitle = 'No history available',
    emptyDescription = 'Timeline entries will appear here once this asset begins moving through operational workflows.',
}: AssetHistoryTimelineProps) {
    if (items.length === 0) {
        return <AppEmptyState title={emptyTitle} description={emptyDescription} className="border-none bg-slate-50" />;
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={item.id} className="relative rounded-3xl border border-slate-100 bg-white px-5 py-4">
                    {index < items.length - 1 ? <div className="absolute bottom-[-1rem] left-[1.35rem] top-[2.5rem] w-px bg-slate-200" /> : null}
                    <div className="flex gap-4">
                        <div className="relative z-10 mt-1 rounded-full bg-primary-soft p-2 text-blue-700">
                            <Clock3 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="font-semibold text-slate-950">{item.title}</p>
                                {item.badgeLabel ? <AppBadge variant={item.badgeVariant ?? 'outline'}>{item.badgeLabel}</AppBadge> : null}
                            </div>
                            {item.meta ? <p className="mt-1 text-sm text-slate-500">{item.meta}</p> : null}
                            {item.description ? <p className="mt-2 text-sm text-slate-700">{item.description}</p> : null}
                            {item.body ? <p className="mt-2 text-sm text-slate-600">{item.body}</p> : null}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export interface AssetMovementTableProps {
    items: AssetMovementRecord[];
}

export function AssetMovementTable({ items }: AssetMovementTableProps) {
    if (items.length === 0) {
        return (
            <AppEmptyState
                title="No movement history"
                description="This asset has not recorded any custody or location movement yet."
                className="border-none bg-slate-50"
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                    <tr>
                        <th className="px-5 py-3.5">Event</th>
                        <th className="px-5 py-3.5">From</th>
                        <th className="px-5 py-3.5">To</th>
                        <th className="px-5 py-3.5">When</th>
                        <th className="px-5 py-3.5">By</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((movement) => (
                        <tr key={movement.id} className="transition hover:bg-slate-50/70">
                            <td className="px-5 py-4">
                                <AppBadge variant="outline">{formatTitleCase(movement.movement_type)}</AppBadge>
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                                {joinDisplayParts(
                                    [
                                        movement.from_department,
                                        movement.from_location,
                                        movement.from_user,
                                        movement.from_room_or_area,
                                    ],
                                    ' / ',
                                    'Not recorded',
                                )}
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                                {joinDisplayParts(
                                    [
                                        movement.to_department,
                                        movement.to_location,
                                        movement.to_user,
                                        movement.to_room_or_area,
                                    ],
                                    ' / ',
                                    'Not recorded',
                                )}
                            </td>
                            <td className="px-5 py-4 text-slate-700">{formatDateTime(movement.movement_datetime)}</td>
                            <td className="px-5 py-4 text-slate-700">
                                <p>{movement.performed_by ?? 'System'}</p>
                                {movement.notes ? <p className="mt-1 text-xs text-slate-500">{movement.notes}</p> : null}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
