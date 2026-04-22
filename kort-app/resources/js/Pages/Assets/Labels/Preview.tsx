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

type LocalPrintState = 'idle' | 'printing' | 'printed' | 'failed';

interface QzTrayApi {
    websocket: {
        isActive: () => boolean;
        connect: (options?: { retries?: number; delay?: number }) => Promise<void>;
    };
    printers: {
        find: (printer: string) => Promise<string>;
        getDefault: () => Promise<string>;
    };
    configs: {
        create: (printer: string, options?: Record<string, unknown>) => unknown;
    };
    print: (config: unknown, data: Array<string | Record<string, unknown>>) => Promise<void>;
}

declare global {
    interface Window {
        qz?: QzTrayApi;
    }
}

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

function extractShareName(uncPath: string | null | undefined): string | null {
    const source = (uncPath ?? '').trim();
    if (source === '') {
        return null;
    }

    const normalized = source.replaceAll('/', '\\').replace(/^\\+/, '');
    const segments = normalized.split('\\').filter((segment) => segment.trim() !== '');

    return segments.length >= 2 ? segments[1] : null;
}

async function loadQzTray(): Promise<QzTrayApi> {
    if (window.qz) {
        return window.qz;
    }

    const existing = document.querySelector('script[data-qz-tray-script="true"]') as HTMLScriptElement | null;
    if (existing) {
        await new Promise<void>((resolve, reject) => {
            if (window.qz) {
                resolve();
                return;
            }

            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load QZ Tray script.')), { once: true });
        });

        if (!window.qz) {
            throw new Error('QZ Tray library loaded but API is unavailable.');
        }

        return window.qz;
    }

    await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.js';
        script.async = true;
        script.dataset.qzTrayScript = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Unable to load QZ Tray script from CDN.'));
        document.head.appendChild(script);
    });

    if (!window.qz) {
        throw new Error('QZ Tray script loaded, but printer API is still unavailable.');
    }

    return window.qz;
}

async function connectQz(qz: QzTrayApi): Promise<void> {
    if (!qz.websocket.isActive()) {
        await qz.websocket.connect({ retries: 1, delay: 0 });
    }
}

async function resolvePrinter(qz: QzTrayApi, candidates: string[]): Promise<string> {
    const uniqueCandidates = Array.from(
        new Set(
            candidates
                .map((candidate) => candidate.trim())
                .filter((candidate) => candidate !== ''),
        ),
    );

    for (const candidate of uniqueCandidates) {
        try {
            const matched = await qz.printers.find(candidate);
            if (matched) {
                return matched;
            }
        } catch {
            // continue trying candidates
        }
    }

    return qz.printers.getDefault();
}

export default function AssetLabelPreviewPage() {
    const { props } = useReactPage<AssetLabelPreviewPageProps>();
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
    const [localPrintState, setLocalPrintState] = useState<LocalPrintState>('idle');
    const [localPrintMessage, setLocalPrintMessage] = useState<string | null>(null);
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
    const localPrinterCandidates = useMemo(() => {
        const shareName = extractShareName(props.directPrinterTarget);
        const normalizedShareName = shareName ? shareName.replaceAll('_', ' ') : '';
        const configuredName = (props.localPrinterName ?? '').trim();

        return [
            configuredName,
            props.printerSettings.model,
            shareName ?? '',
            normalizedShareName,
        ].filter((value) => value.trim() !== '');
    }, [props.directPrinterTarget, props.localPrinterName, props.printerSettings.model]);

    const copyTspl = async () => {
        try {
            await navigator.clipboard.writeText(props.tsplOutput);
            setCopyState('copied');
        } catch {
            setCopyState('failed');
        }

        window.setTimeout(() => setCopyState('idle'), 1800);
    };

    const printLocally = async () => {
        setLocalPrintState('printing');
        setLocalPrintMessage(null);

        try {
            const qz = await loadQzTray();
            await connectQz(qz);
            const printer = await resolvePrinter(qz, localPrinterCandidates);
            const config = qz.configs.create(printer, { encoding: 'UTF-8' });

            await qz.print(config, [props.tsplOutput]);

            setLocalPrintState('printed');
            setLocalPrintMessage(`Sent to ${printer}.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to send TSPL to local printer.';
            setLocalPrintState('failed');
            setLocalPrintMessage(message);
        } finally {
            window.setTimeout(() => setLocalPrintState('idle'), 2200);
        }
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
                            <AppButton type="button" variant="outline" onClick={() => window.print()}>
                                <Printer className="h-4 w-4" />
                                Print browser preview
                            </AppButton>
                            <AppButton type="button" onClick={printLocally} loading={localPrintState === 'printing'}>
                                <Printer className="h-4 w-4" />
                                {localPrintState === 'idle'
                                    ? 'One-click thermal print'
                                    : localPrintState === 'printing'
                                      ? 'Sending...'
                                      : localPrintState === 'printed'
                                        ? 'Printed'
                                        : 'Retry print'}
                            </AppButton>
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

                {localPrintState === 'failed' && localPrintMessage ? (
                    <AppAlert
                        variant="warning"
                        title="Local print bridge unavailable"
                        description={`Install/open QZ Tray on this computer, then try again. Details: ${localPrintMessage}`}
                    />
                ) : null}

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
                            <p className="text-sm text-slate-500">Local printer name</p>
                            <p className="mt-1 font-medium text-slate-900">{props.localPrinterName || props.printerSettings.model}</p>
                        </div>
                    </AppCardContent>
                    <p className="px-6 pb-6 text-sm text-slate-600">
                        For live/shared hosting one-click printing, install QZ Tray on each client PC and keep this page open while printing.
                    </p>
                </AppCard>

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

