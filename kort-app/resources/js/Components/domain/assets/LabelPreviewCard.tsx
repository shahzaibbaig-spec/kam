import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import type { AssetLabelPreview } from '@/types/assets';
import { formatDateTime, joinDisplayParts } from '@/Lib/utils';

export interface LabelPreviewCardProps {
    label: AssetLabelPreview;
    printedCount?: number;
    lastPrintedAt?: string | null;
}

export function LabelPreviewCard({ label, printedCount = 0, lastPrintedAt }: LabelPreviewCardProps) {
    return (
        <AppCard className="overflow-hidden border-blue-100">
            <AppCardHeader className="border-b border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <AppCardTitle>Label preview</AppCardTitle>
                        <AppCardDescription>Compact layout tuned for scanner reliability with text on top-left, QR on the right, and barcode at the bottom.</AppCardDescription>
                    </div>
                    <AppBadge variant="outline">{printedCount} prints</AppBadge>
                </div>
            </AppCardHeader>

            <AppCardContent className="space-y-4 p-6">
                <div className="rounded-[1.4rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-blue-700">KORT Asset Label</p>
                            <h3 className="text-base font-semibold leading-tight text-slate-950">{label.asset_name}</h3>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">{label.tag_number ?? 'Tag pending'}</p>
                            <p className="text-xs text-slate-600">
                                {joinDisplayParts([label.department_name, label.location_name], ' / ', 'Department and location not assigned')}
                            </p>
                        </div>

                        <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5">
                            <div
                                className="flex min-h-[72px] min-w-[72px] items-center justify-center"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        label.qr_svg ??
                                        '<div style="color:#64748b;font-size:0.75rem;font-weight:500;text-align:center;">QR unavailable</div>',
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2.5">
                        <div
                            className="flex min-h-[86px] items-center justify-center"
                            dangerouslySetInnerHTML={{
                                __html:
                                    label.barcode_svg ??
                                    '<div style="color:#64748b;font-size:0.875rem;font-weight:500;">Barcode will appear here after tag generation.</div>',
                            }}
                        />
                    </div>
                </div>

                {lastPrintedAt ? <p className="mt-4 text-sm text-slate-500">Last printed {formatDateTime(lastPrintedAt)}</p> : null}
            </AppCardContent>
        </AppCard>
    );
}
