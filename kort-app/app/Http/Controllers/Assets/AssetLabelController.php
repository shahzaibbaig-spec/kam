<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetBulkPrintRequest;
use App\Http\Resources\AssetLabelPrintLogResource;
use App\Models\Asset;
use App\Models\AssetLabelPrintLog;
use App\Services\AssetLabelTsplService;
use App\Services\AssetTagService;
use App\Services\RawTsplPrinterService;
use App\Services\SystemSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class AssetLabelController extends Controller
{
    public function show(
        Request $request,
        Asset $asset,
        AssetLabelTsplService $tsplService,
        SystemSettingsService $settingsService,
    ): Response|RedirectResponse {
        $this->authorize('printTag', $asset);
        $asset->load(['department', 'location', 'activeTag']);

        if (! $asset->activeTag) {
            return redirect()
                ->route('assets.show', $asset)
                ->with('error', 'Generate a tag before printing a label.');
        }

        $job = $tsplService->buildJob([$asset]);

        return Inertia::render('Assets/Labels/Preview', [
            'title' => 'Asset Label Preview',
            'mode' => 'single',
            'labels' => $job['labels'],
            'tsplOutput' => $job['tspl'],
            'printerSettings' => $job['settings'],
            'directPrinterTarget' => $this->configuredPrinterTarget($settingsService),
            'localPrinterName' => $this->configuredLocalPrinterName($settingsService, $job['settings']),
            'selectedAssetIds' => [$asset->id],
            'printLogs' => AssetLabelPrintLogResource::collection(
                AssetLabelPrintLog::query()
                    ->with('printedBy')
                    ->where('asset_id', $asset->id)
                    ->latest('printed_at')
                    ->limit(12)
                    ->get(),
            ),
        ]);
    }

    public function bulkPreview(
        AssetBulkPrintRequest $request,
        AssetLabelTsplService $tsplService,
        SystemSettingsService $settingsService,
    ): Response {
        abort_unless($request->user()->can('asset-tag.print'), 403);

        $assets = $this->printableAssets($request->validated('assets'));
        abort_if($assets->isEmpty(), 404, 'No printable asset labels were found.');

        $job = $tsplService->buildJob($assets);

        return Inertia::render('Assets/Labels/Preview', [
            'title' => 'Bulk Asset Label Preview',
            'mode' => 'bulk',
            'labels' => $job['labels'],
            'tsplOutput' => $job['tspl'],
            'printerSettings' => $job['settings'],
            'directPrinterTarget' => $this->configuredPrinterTarget($settingsService),
            'localPrinterName' => $this->configuredLocalPrinterName($settingsService, $job['settings']),
            'selectedAssetIds' => $assets->pluck('id')->all(),
            'printLogs' => AssetLabelPrintLogResource::collection(
                AssetLabelPrintLog::query()
                    ->with('printedBy')
                    ->whereIn('asset_id', $assets->pluck('id')->all())
                    ->latest('printed_at')
                    ->limit(20)
                    ->get(),
            ),
        ]);
    }

    public function tspl(
        Request $request,
        Asset $asset,
        AssetLabelTsplService $tsplService,
        AssetTagService $tagService,
    ): HttpResponse|RedirectResponse {
        $this->authorize('printTag', $asset);
        $asset->load(['department', 'location', 'activeTag']);

        if (! $asset->activeTag) {
            return redirect()
                ->route('assets.show', $asset)
                ->with('error', 'Generate a tag before printing a label.');
        }

        $job = $tsplService->buildJob([$asset]);
        $labels = collect($job['labels']);

        if ($labels->isEmpty()) {
            abort(404, 'No printable asset labels were found.');
        }

        $this->recordPrintLogs($labels, $job['settings'], $request, 'single');
        $tagService->markPrinted([$asset], $request->user());

        return $this->tsplResponse($job['tspl'], "asset-label-{$asset->id}.tspl");
    }

    public function bulkTspl(
        AssetBulkPrintRequest $request,
        AssetLabelTsplService $tsplService,
        AssetTagService $tagService,
    ): HttpResponse {
        abort_unless($request->user()->can('asset-tag.print'), 403);

        $assets = $this->printableAssets($request->validated('assets'));
        abort_if($assets->isEmpty(), 404, 'No printable asset labels were found.');

        $job = $tsplService->buildJob($assets);
        $labels = collect($job['labels']);

        $this->recordPrintLogs($labels, $job['settings'], $request, 'bulk');
        $tagService->markPrinted($assets, $request->user());

        return $this->tsplResponse($job['tspl'], 'asset-labels-bulk.tspl');
    }

    public function direct(
        Request $request,
        Asset $asset,
        AssetLabelTsplService $tsplService,
        AssetTagService $tagService,
        RawTsplPrinterService $printerService,
        SystemSettingsService $settingsService,
    ): RedirectResponse {
        $this->authorize('printTag', $asset);
        $asset->load(['department', 'location', 'activeTag']);

        if (! $asset->activeTag) {
            return redirect()
                ->route('assets.show', $asset)
                ->with('error', 'Generate a tag before printing a label.');
        }

        $job = $tsplService->buildJob([$asset]);
        $labels = collect($job['labels']);

        if ($labels->isEmpty()) {
            return redirect()
                ->route('assets.show', $asset)
                ->with('error', 'No printable asset labels were found.');
        }

        try {
            $target = $this->configuredPrinterTarget($settingsService);
            $printerService->print($job['tspl'], $target);
        } catch (\Throwable $exception) {
            return redirect()
                ->route('assets.labels.show', $asset)
                ->with('error', 'Thermal printer dispatch failed: '.$exception->getMessage());
        }

        $this->recordPrintLogs($labels, $job['settings'], $request, 'single');
        $tagService->markPrinted([$asset], $request->user());

        return redirect()
            ->route('assets.labels.show', $asset)
            ->with('success', 'Label sent to the thermal printer queue.');
    }

    public function bulkDirect(
        AssetBulkPrintRequest $request,
        AssetLabelTsplService $tsplService,
        AssetTagService $tagService,
        RawTsplPrinterService $printerService,
        SystemSettingsService $settingsService,
    ): RedirectResponse {
        abort_unless($request->user()->can('asset-tag.print'), 403);

        $assets = $this->printableAssets($request->validated('assets'));
        if ($assets->isEmpty()) {
            return redirect()->route('assets.index')->with('error', 'No printable asset labels were found.');
        }

        $job = $tsplService->buildJob($assets);
        $labels = collect($job['labels']);

        try {
            $target = $this->configuredPrinterTarget($settingsService);
            $printerService->print($job['tspl'], $target);
        } catch (\Throwable $exception) {
            return redirect()
                ->route('assets.labels.bulk-print', ['assets' => $assets->pluck('id')->all()])
                ->with('error', 'Thermal printer dispatch failed: '.$exception->getMessage());
        }

        $this->recordPrintLogs($labels, $job['settings'], $request, 'bulk');
        $tagService->markPrinted($assets, $request->user());

        return redirect()
            ->route('assets.labels.bulk-print', ['assets' => $assets->pluck('id')->all()])
            ->with('success', 'Labels sent to the thermal printer queue.');
    }

    public function reprint(
        Request $request,
        AssetLabelPrintLog $printLog,
        AssetTagService $tagService,
    ): HttpResponse {
        $asset = Asset::query()
            ->with('activeTag')
            ->findOrFail($printLog->asset_id);

        $this->authorize('printTag', $asset);

        AssetLabelPrintLog::query()->create([
            'asset_id' => $printLog->asset_id,
            'asset_tag_id' => $asset->activeTag?->id,
            'printed_by' => $request->user()?->id,
            'reprinted_from_log_id' => $printLog->id,
            'print_source' => 'reprint',
            'output_format' => $printLog->output_format,
            'copies' => $printLog->copies,
            'printer_model' => $printLog->printer_model,
            'printer_language' => $printLog->printer_language,
            'printer_dpi' => $printLog->printer_dpi,
            'label_width_mm' => $printLog->label_width_mm,
            'label_height_mm' => $printLog->label_height_mm,
            'gap_mm' => $printLog->gap_mm,
            'direction' => $printLog->direction,
            'asset_name_printed' => $printLog->asset_name_printed,
            'tag_number_printed' => $printLog->tag_number_printed,
            'barcode_value_printed' => $printLog->barcode_value_printed,
            'qr_value_printed' => $printLog->qr_value_printed,
            'tspl_payload' => $printLog->tspl_payload,
            'printed_at' => now(),
        ]);

        if ($asset->activeTag) {
            $tagService->markPrinted([$asset], $request->user());
        }

        return $this->tsplResponse($printLog->tspl_payload, "asset-label-reprint-{$printLog->id}.tspl");
    }

    public function reprintDirect(
        Request $request,
        AssetLabelPrintLog $printLog,
        AssetTagService $tagService,
        RawTsplPrinterService $printerService,
        SystemSettingsService $settingsService,
    ): RedirectResponse {
        $asset = Asset::query()
            ->with('activeTag')
            ->findOrFail($printLog->asset_id);

        $this->authorize('printTag', $asset);

        try {
            $target = $this->configuredPrinterTarget($settingsService);
            $printerService->print($printLog->tspl_payload, $target);
        } catch (\Throwable $exception) {
            return back()->with('error', 'Thermal printer dispatch failed: '.$exception->getMessage());
        }

        AssetLabelPrintLog::query()->create([
            'asset_id' => $printLog->asset_id,
            'asset_tag_id' => $asset->activeTag?->id,
            'printed_by' => $request->user()?->id,
            'reprinted_from_log_id' => $printLog->id,
            'print_source' => 'reprint',
            'output_format' => $printLog->output_format,
            'copies' => $printLog->copies,
            'printer_model' => $printLog->printer_model,
            'printer_language' => $printLog->printer_language,
            'printer_dpi' => $printLog->printer_dpi,
            'label_width_mm' => $printLog->label_width_mm,
            'label_height_mm' => $printLog->label_height_mm,
            'gap_mm' => $printLog->gap_mm,
            'direction' => $printLog->direction,
            'asset_name_printed' => $printLog->asset_name_printed,
            'tag_number_printed' => $printLog->tag_number_printed,
            'barcode_value_printed' => $printLog->barcode_value_printed,
            'qr_value_printed' => $printLog->qr_value_printed,
            'tspl_payload' => $printLog->tspl_payload,
            'printed_at' => now(),
        ]);

        if ($asset->activeTag) {
            $tagService->markPrinted([$asset], $request->user());
        }

        return back()->with('success', 'Reprint sent to the thermal printer queue.');
    }

    protected function printableAssets(array $assetIds): Collection
    {
        return Asset::query()
            ->with(['department', 'location', 'activeTag'])
            ->whereIn('id', $assetIds)
            ->orderBy('asset_name')
            ->get()
            ->filter(fn (Asset $asset) => $asset->activeTag !== null)
            ->values();
    }

    protected function recordPrintLogs(
        Collection $labels,
        array $settings,
        Request $request,
        string $source,
    ): void {
        $printedAt = now();

        foreach ($labels as $label) {
            if (! is_array($label)) {
                continue;
            }

            if (! isset($label['asset_id'])) {
                continue;
            }

            AssetLabelPrintLog::query()->create([
                'asset_id' => $label['asset_id'],
                'asset_tag_id' => $label['asset_tag_id'] ?? null,
                'printed_by' => $request->user()?->id,
                'reprinted_from_log_id' => null,
                'print_source' => $source,
                'output_format' => 'tspl',
                'copies' => 1,
                'printer_model' => (string) ($settings['model'] ?? 'TSC TTP-244 Pro'),
                'printer_language' => (string) ($settings['language'] ?? 'TSPL'),
                'printer_dpi' => (int) ($settings['dpi'] ?? 203),
                'label_width_mm' => (int) ($settings['label_width_mm'] ?? 38),
                'label_height_mm' => (int) ($settings['label_height_mm'] ?? 28),
                'gap_mm' => (int) ($settings['gap_mm'] ?? 2),
                'direction' => (int) ($settings['direction'] ?? 1),
                'asset_name_printed' => (string) ($label['asset_name'] ?? 'Unknown'),
                'tag_number_printed' => (string) ($label['tag_number'] ?? 'TAG-PENDING'),
                'barcode_value_printed' => $label['barcode_value'] ?? null,
                'qr_value_printed' => $label['qr_value'] ?? null,
                'tspl_payload' => (string) ($label['tspl'] ?? ''),
                'printed_at' => $printedAt,
            ]);
        }
    }

    protected function configuredPrinterTarget(SystemSettingsService $settingsService): ?string
    {
        $settings = $settingsService->labelValues();

        $value = $settings['printer_share_path'] ?? null;
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : null;
    }

    protected function configuredLocalPrinterName(SystemSettingsService $settingsService, array $printerSettings): string
    {
        $settings = $settingsService->labelValues();
        $explicit = trim((string) ($settings['client_printer_name'] ?? ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $sharePath = trim((string) ($settings['printer_share_path'] ?? ''));
        if ($sharePath !== '') {
            $segments = array_values(array_filter(explode('\\', str_replace('/', '\\', $sharePath))));
            if (count($segments) >= 2) {
                return (string) $segments[1];
            }
        }

        return (string) ($printerSettings['model'] ?? 'TSC TTP-244 Pro');
    }

    protected function tsplResponse(string $contents, string $filename): HttpResponse
    {
        return response($contents, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
            'Pragma' => 'no-cache',
        ]);
    }
}
