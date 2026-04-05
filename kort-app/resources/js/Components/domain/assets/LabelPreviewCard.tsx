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
        <AppCard className="overflow-hidden">
            <AppCardHeader className="border-b border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <AppCardTitle>Label preview</AppCardTitle>
                        <AppCardDescription>Barcode and QR-ready layout for ward, room, and custody identification.</AppCardDescription>
                    </div>
                    <AppBadge variant="outline">{printedCount} prints</AppBadge>
                </div>
            </AppCardHeader>

            <AppCardContent className="p-6">
                <div className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-5 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-blue-700">KORT Assest Managment System</p>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{label.asset_name}</h3>
                    <p className="mt-1 text-sm font-medium text-slate-600">{label.tag_number ?? 'Tag pending'}</p>
                    <p className="mt-2 text-sm text-slate-600">
                        {joinDisplayParts([label.department_name, label.location_name], ' / ', 'Department and location not assigned')}
                    </p>

                    <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Barcode</p>
                            <div
                                className="mt-4 flex min-h-[92px] items-center justify-center"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        label.barcode_svg ??
                                        '<div style="color:#64748b;font-size:0.875rem;font-weight:500;">Barcode will appear here after tag generation.</div>',
                                }}
                            />
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">QR</p>
                            <div
                                className="mt-4 flex min-h-[92px] items-center justify-center"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        label.qr_svg ??
                                        '<div style="color:#64748b;font-size:0.875rem;font-weight:500;">QR preview unavailable.</div>',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {lastPrintedAt ? <p className="mt-4 text-sm text-slate-500">Last printed {formatDateTime(lastPrintedAt)}</p> : null}
            </AppCardContent>
        </AppCard>
    );
}
