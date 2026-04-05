import { router } from '@inertiajs/vue3';
import { Camera, ScanLine, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AssetScanResultCard } from '@/Components/domain/assets/AssetScanResultCard';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLayout } from '@/Layouts/AppLayout';
import type { AssetScanPageProps } from '@/types/assets';

type BarcodeDetectorConstructor = new (config?: { formats: string[] }) => {
    detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

declare global {
    interface Window {
        BarcodeDetector?: BarcodeDetectorConstructor;
    }
}

export default function AssetScanPage() {
    const { props } = useReactPage<AssetScanPageProps>();
    const [query, setQuery] = useState(props.query ?? '');
    const [barcodeSupported, setBarcodeSupported] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const detectorRef = useRef<InstanceType<BarcodeDetectorConstructor> | null>(null);

    useEffect(() => {
        const BarcodeDetectorClass = window.BarcodeDetector;
        const supported = Boolean(BarcodeDetectorClass && navigator.mediaDevices?.getUserMedia);

        setBarcodeSupported(supported);

        if (BarcodeDetectorClass) {
            detectorRef.current = new BarcodeDetectorClass({
                formats: ['qr_code', 'code_128', 'code_39', 'ean_13'],
            });
        }
    }, []);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const stopCamera = () => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraActive(false);
    };

    const submit = () => {
        router.get(
            route('assets.scan.lookup'),
            { query },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const scanLoop = async () => {
        if (!detectorRef.current || !videoRef.current) {
            return;
        }

        try {
            const detections = await detectorRef.current.detect(videoRef.current);

            if (detections.length > 0 && detections[0]?.rawValue) {
                setQuery(detections[0].rawValue);
                stopCamera();
                router.get(
                    route('assets.scan.lookup'),
                    { query: detections[0].rawValue },
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
                return;
            }
        } catch {
            setCameraError('The camera is active, but barcode detection is not available for this browser session.');
            stopCamera();
            return;
        }

        animationFrameRef.current = requestAnimationFrame(scanLoop);
    };

    const startCamera = async () => {
        setCameraError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });

            streamRef.current = stream;

            if (!videoRef.current) {
                return;
            }

            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setCameraActive(true);
            animationFrameRef.current = requestAnimationFrame(scanLoop);
        } catch {
            setCameraError('Camera access was blocked or is unavailable on this device.');
            stopCamera();
        }
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Assets', href: route('assets.index') }, { label: 'Scan Asset' }]}>
            <div className="space-y-6">
                <PageHeader
                    title="Scan Asset"
                    description="Use a USB scanner, pasted barcode, QR value, asset code, or serial number to reach the asset record quickly."
                />

                <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                    <AppCard className="border-blue-100">
                        <AppCardHeader className="border-b border-slate-100">
                            <AppCardTitle>Scanner input</AppCardTitle>
                            <AppCardDescription>The field below is scanner-ready and also supports manual lookup values.</AppCardDescription>
                        </AppCardHeader>
                        <AppCardContent className="space-y-6 p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Scan or search value</label>
                                <AppInput
                                    autoFocus
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Tag number, barcode, QR value, asset code, or serial number"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <AppButton type="button" onClick={submit}>
                                    <Search className="h-4 w-4" />
                                    Find asset
                                </AppButton>
                                {barcodeSupported && !cameraActive ? (
                                    <AppButton type="button" variant="outline" onClick={startCamera}>
                                        <Camera className="h-4 w-4" />
                                        Start camera
                                    </AppButton>
                                ) : null}
                                {cameraActive ? (
                                    <AppButton type="button" variant="outline" onClick={stopCamera}>
                                        Stop camera
                                    </AppButton>
                                ) : null}
                            </div>

                            {!barcodeSupported ? (
                                <AppAlert
                                    variant="info"
                                    title="Camera scan is not available in this browser"
                                    description="The manual field still works well with USB scanners and pasted values."
                                />
                            ) : null}

                            {cameraError ? <AppAlert variant="danger" title="Camera issue" description={cameraError} /> : null}

                            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/80 p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <ScanLine className="h-4 w-4 text-blue-700" />
                                    Camera scan preview
                                </div>
                                <video ref={videoRef} className="w-full rounded-[1.25rem] bg-slate-950" muted playsInline />
                            </div>
                        </AppCardContent>
                    </AppCard>

                    <AppCard>
                        <AppCardHeader className="border-b border-slate-100">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <AppCardTitle>Lookup results</AppCardTitle>
                                    <AppCardDescription>Multiple matches will be shown below so staff can choose the correct asset record.</AppCardDescription>
                                </div>
                                {props.query ? <span className="text-sm text-slate-500">Search: {props.query}</span> : null}
                            </div>
                        </AppCardHeader>
                        <AppCardContent className="space-y-4 p-6">
                            {props.error ? <AppAlert variant="danger" title="No matching asset found" description={props.error} /> : null}

                            {!props.error && props.matches.length === 0 ? (
                                <AppEmptyState
                                    title="Ready to scan"
                                    description="Scan a barcode or QR value, or type an asset code or serial number to begin."
                                />
                            ) : null}

                            {props.matches.map((asset) => (
                                <AssetScanResultCard key={asset.id} asset={asset} />
                            ))}
                        </AppCardContent>
                    </AppCard>
                </div>
            </div>
        </AppLayout>
    );
}
