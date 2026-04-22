import { ClipboardCopy, Printer, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { LabelPreviewCard } from '@/Components/domain/assets/LabelPreviewCard';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppLayout } from '@/Layouts/AppLayout';
import { formatDateTime, formatTitleCase } from '@/Lib/utils';
import type { AssetLabelPreviewPageProps } from '@/types/assets';

function buildBulkTsplUrl(assetIds: number[]): string {
    const params = new URLSearchParams();

    assetIds.forEach((id, index) => {
        params.append(`assets[${index}]`, String(id));
    });

    return `${route('assets.labels.bulk-print.tspl')}?${params.toString()}`;
}

function buildBulkDirectUrl(assetIds: number[]): string {
    const params = new URLSearchParams();

    assetIds.forEach((id, index) => {
        params.append(`assets[${index}]`, String(id));
    });

    return `${route('assets.labels.bulk-print.direct')}?${params.toString()}`;
}

function buildBulkBrowserPrintUrl(assetIds: number[]): string {
    const params = new URLSearchParams();

    assetIds.forEach((id, index) => {
        params.append(`assets[${index}]`, String(id));
    });

    return `${route('assets.labels.bulk-print.browser')}?${params.toString()}`;
}

function extractShareName(uncPath: string | null | undefined): string | null {
    const source = (uncPath ?? '').trim();
    if (source === '') {
        return null;
    }

    const normalized = source.replaceAll('/', '\\').replace(/^\\+/, '');
    const segments = normalized.split('\\').filter((segment) => segment.trim() !== '');

    return segments.length >= 2 ? segments[1] : null;
}

export default function AssetLabelPreviewPage() {
    const { props } = useReactPage<AssetLabelPreviewPageProps>();
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
    const printLogs = Array.isArray(props.printLogs)
        ? props.printLogs
        : Array.isArray((props.printLogs as unknown as { data?: unknown[] })?.data)
          ? ((props.printLogs as unknown as { data: AssetLabelPreviewPageProps['printLogs'] }).data ?? [])
          : [];
    const directPrinterConfigured = typeof props.directPrinterTarget === 'string' && props.directPrinterTarget.trim() !== '';

    const labelCount = props.labels.length;
    const tsplDownloadUrl = useMemo(() => {
        if (props.mode === 'single') {
            const [assetId] = props.selectedAssetIds;
            return assetId ? route('assets.labels.tspl', assetId) : null;
        }

        return props.selectedAssetIds.length > 0 ? buildBulkTsplUrl(props.selectedAssetIds) : null;
    }, [props.mode, props.selectedAssetIds]);
    const directPrintUrl = useMemo(() => {
        if (!directPrinterConfigured) {
            return null;
        }

        if (props.mode === 'single') {
            const [assetId] = props.selectedAssetIds;
            return assetId ? route('assets.labels.direct', assetId) : null;
        }

        return props.selectedAssetIds.length > 0 ? buildBulkDirectUrl(props.selectedAssetIds) : null;
    }, [directPrinterConfigured, props.mode, props.selectedAssetIds]);
    const browserPrintUrl = useMemo(() => {
        if (props.mode === 'single') {
            const [assetId] = props.selectedAssetIds;
            return assetId ? route('assets.labels.browser-print', assetId) : null;
        }

        return props.selectedAssetIds.length > 0 ? buildBulkBrowserPrintUrl(props.selectedAssetIds) : null;
    }, [props.mode, props.selectedAssetIds]);
    const serverShareName = useMemo(() => extractShareName(props.directPrinterTarget), [props.directPrinterTarget]);

    const copyTspl = async () => {
        try {
            await navigator.clipboard.writeText(props.tsplOutput);
            setCopyState('copied');
        } catch {
            setCopyState('failed');
        }

        window.setTimeout(() => setCopyState('idle'), 1800);
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Assets', href: route('assets.index') }, { label: 'Label Preview' }]}>
            <div className="space-y-6">
                <PageHeader
                    title={props.title}
                    description="Review the compact layout, then print using TSPL for TSC TTP-244 Pro label output."
                    meta={<AppBadge variant="outline">{labelCount} label{labelCount === 1 ? '' : 's'}</AppBadge>}
                    actions={
                        <>
                            {browserPrintUrl ? (
                                <AppButton asChild>
                                    <a href={browserPrintUrl} target="_blank" rel="noreferrer">
                                        <Printer className="h-4 w-4" />
                                        One-click thermal print
                                    </a>
                                </AppButton>
                            ) : (
                                <AppButton type="button" disabled>
                                    <Printer className="h-4 w-4" />
                                    One-click thermal print
                                </AppButton>
                            )}
                            {directPrintUrl ? (
                                <AppButton asChild variant="outline">
                                    <a href={directPrintUrl}>
                                        <Printer className="h-4 w-4" />
                                        Server-side print
                                    </a>
                                </AppButton>
                            ) : null}
                            {tsplDownloadUrl ? (
                                <AppButton asChild variant="outline">
                                    <a href={tsplDownloadUrl} target="_blank" rel="noreferrer">
                                        <Printer className="h-4 w-4" />
                                        Download TSPL
                                    </a>
                                </AppButton>
                            ) : (
                                <AppButton type="button" disabled variant="outline">
                                    <Printer className="h-4 w-4" />
                                    Download TSPL
                                </AppButton>
                            )}
                        </>
                    }
                />

                <AppCard className="print:hidden">
                    <AppCardHeader className="border-b border-slate-100">
                        <AppCardTitle>Printer profile</AppCardTitle>
                        <AppCardDescription>Target printer setup for TSPL output generation.</AppCardDescription>
                    </AppCardHeader>
                    <AppCardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                            <p className="text-sm text-slate-500">Printer</p>
                            <p className="mt-1 font-medium text-slate-900">{props.printerSettings.model}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Language / DPI</p>
                            <p className="mt-1 font-medium text-slate-900">
                                {props.printerSettings.language} / {props.printerSettings.dpi}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Label size</p>
                            <p className="mt-1 font-medium text-slate-900">
                                {props.printerSettings.label_width_mm} x {props.printerSettings.label_height_mm} mm
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Server target (optional)</p>
                            <p className="mt-1 font-medium text-slate-900">{props.directPrinterTarget || 'Not configured'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Detected share name</p>
                            <p className="mt-1 font-medium text-slate-900">{serverShareName || 'N/A'}</p>
                        </div>
                    </AppCardContent>
                    <p className="px-6 pb-6 text-sm text-slate-600">
                        One-click uses your browser print dialog. Set the thermal printer as your default system printer for fastest printing.
                    </p>
                </AppCard>

                <AppAlert
                    variant="info"
                    title="One-click printing behavior"
                    description="Web browsers can print to local printers, but silent auto-print without a dialog requires kiosk/silent-print browser mode with your thermal printer set as default."
                />

                <div className="grid gap-6 xl:grid-cols-2">
                    {props.labels.map((label) => (
                        <LabelPreviewCard
                            key={`${label.asset_id ?? 'label'}-${label.tag_number ?? 'pending'}`}
                            label={label}
                            printedCount={0}
                            lastPrintedAt={null}
                        />
                    ))}
                </div>

                <AppCard className="print:hidden">
                    <AppCardHeader className="border-b border-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <AppCardTitle>TSPL output</AppCardTitle>
                                <AppCardDescription>Raw TSPL commands generated for this print batch.</AppCardDescription>
                            </div>
                            <AppButton type="button" size="sm" variant="outline" onClick={copyTspl}>
                                <ClipboardCopy className="h-4 w-4" />
                                {copyState === 'idle' ? 'Copy TSPL' : copyState === 'copied' ? 'Copied' : 'Copy failed'}
                            </AppButton>
                        </div>
                    </AppCardHeader>
                    <AppCardContent className="p-6">
                        <pre className="max-h-[360px] overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                            {props.tsplOutput}
                        </pre>
                    </AppCardContent>
                </AppCard>

                <AppCard className="print:hidden">
                    <AppCardHeader className="border-b border-slate-100">
                        <AppCardTitle>Print logs</AppCardTitle>
                        <AppCardDescription>Recent print and reprint history for this label context.</AppCardDescription>
                    </AppCardHeader>
                    <AppCardContent className="p-0">
                        {printLogs.length === 0 ? (
                            <p className="p-6 text-sm text-slate-600">No print logs found for the selected assets yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                                        <tr>
                                            <th className="px-5 py-3.5">Printed at</th>
                                            <th className="px-5 py-3.5">Asset / Tag</th>
                                            <th className="px-5 py-3.5">Source</th>
                                            <th className="px-5 py-3.5">Operator</th>
                                            <th className="px-5 py-3.5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {printLogs.map((log) => (
                                            <tr key={log.id} className="transition hover:bg-blue-50/30">
                                                <td className="px-5 py-4 text-slate-700">{formatDateTime(log.printed_at)}</td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-slate-900">{log.asset_name_printed}</p>
                                                    <p className="text-xs text-slate-500">{log.tag_number_printed}</p>
                                                </td>
                                                <td className="px-5 py-4 text-slate-700">{formatTitleCase(log.print_source)}</td>
                                                <td className="px-5 py-4 text-slate-700">{log.printed_by_name ?? 'System'}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {directPrinterConfigured ? (
                                                            <AppButton asChild size="sm">
                                                                <a href={route('assets.labels.reprint.direct', log.id)}>
                                                                    <RefreshCcw className="h-4 w-4" />
                                                                    Reprint
                                                                </a>
                                                            </AppButton>
                                                        ) : null}
                                                        <AppButton asChild size="sm" variant="outline">
                                                            <a href={route('assets.labels.reprint', log.id)} target="_blank" rel="noreferrer">
                                                                <RefreshCcw className="h-4 w-4" />
                                                                TSPL
                                                            </a>
                                                        </AppButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </AppCardContent>
                </AppCard>
            </div>
        </AppLayout>
    );
}
