<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetBulkPrintRequest;
use App\Http\Requests\Assets\AssetBulkTagRequest;
use App\Http\Requests\Assets\AssetTagGenerateRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Services\AssetTagService;
use App\Services\BarcodeLabelService;
use App\Services\SystemSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class AssetTagController extends Controller
{
    public function create(Asset $asset, AssetTagService $tagService): Response
    {
        $this->authorize('generateTag', $asset);

        return Inertia::render('Assets/Tags/Generate', [
            'asset' => AssetResource::make($asset->load(['category', 'department', 'location', 'activeTag'])),
            'previewTag' => $tagService->preview($asset),
            'canRegenerate' => request()->user()->can('asset-tag.regenerate'),
        ]);
    }

    public function store(AssetTagGenerateRequest $request, Asset $asset, AssetTagService $tagService): RedirectResponse
    {
        $force = $request->boolean('force');
        $this->authorize($force ? 'regenerateTag' : 'generateTag', $asset);

        $tagService->generate($asset, $request->user(), $force);

        return redirect()
            ->route('assets.show', $asset)
            ->with('success', $force ? 'Asset tag regenerated successfully.' : 'Asset tag generated successfully.');
    }

    public function bulkGenerate(AssetBulkTagRequest $request, AssetTagService $tagService): RedirectResponse
    {
        abort_unless($request->user()->can('asset-tag.bulk-generate'), 403);

        $assets = Asset::query()
            ->with(['activeTag', 'category', 'department', 'location.department'])
            ->whereIn('id', $request->validated('asset_ids'))
            ->get();

        $result = $tagService->bulkGenerate($assets, $request->user());

        $message = "{$result['generated']} asset tags generated.";

        if ($result['skipped'] > 0) {
            $message .= " {$result['skipped']} skipped because active tags already existed.";
        }

        return back()->with('success', $message);
    }

    public function showLabel(
        Request $request,
        Asset $asset,
        AssetTagService $tagService,
        BarcodeLabelService $labelService,
        SystemSettingsService $settingsService,
    ): View|RedirectResponse
    {
        $this->authorize('printTag', $asset);
        $asset->load(['department', 'location', 'activeTag']);

        if (! $asset->activeTag) {
            return redirect()
                ->route('assets.show', $asset)
                ->with('error', 'Generate a tag before printing a label.');
        }

        $tagService->markPrinted([$asset], $request->user());
        $printSettings = $this->printSettings($settingsService);

        return view('print.asset-labels', [
            'title' => 'Asset Label Preview',
            'labels' => [$labelService->buildLabelPayload($asset, $printSettings)],
            'printSettings' => $printSettings,
            'printMode' => true,
        ]);
    }

    public function bulkPrint(
        AssetBulkPrintRequest $request,
        AssetTagService $tagService,
        BarcodeLabelService $labelService,
        SystemSettingsService $settingsService,
    ): View
    {
        abort_unless($request->user()->can('asset-tag.print'), 403);

        $assets = Asset::query()
            ->with(['department', 'location', 'activeTag'])
            ->whereIn('id', $request->validated('assets'))
            ->get()
            ->filter(fn (Asset $asset) => $asset->activeTag !== null)
            ->values();

        abort_if($assets->isEmpty(), 404, 'No printable asset labels were found.');

        $tagService->markPrinted($assets, $request->user());
        $printSettings = $this->printSettings($settingsService);

        return view('print.asset-labels', [
            'title' => 'Bulk Asset Labels',
            'labels' => $labelService->buildMany($assets, $printSettings),
            'printSettings' => $printSettings,
            'printMode' => true,
        ]);
    }

    protected function printSettings(SystemSettingsService $settingsService): array
    {
        $values = $settingsService->labelValues();
        [$widthMm, $heightMm] = $this->parseLabelSize((string) ($values['label_size'] ?? '50x25'));
        $marginMm = $this->normalizeMargin($values['print_margin_mm'] ?? 2, $widthMm, $heightMm);

        return [
            'label_size' => "{$widthMm}x{$heightMm}",
            'label_width_mm' => $widthMm,
            'label_height_mm' => $heightMm,
            'print_margin_mm' => $marginMm,
            'barcode_enabled' => (bool) ($values['barcode_enabled'] ?? true),
            'qr_enabled' => (bool) ($values['qr_enabled'] ?? true),
            'include_department' => (bool) ($values['include_department'] ?? true),
            'include_location' => (bool) ($values['include_location'] ?? true),
            'label_footer' => trim((string) ($values['label_footer'] ?? '')),
            'compact_layout' => $heightMm <= 30,
        ];
    }

    protected function parseLabelSize(string $value): array
    {
        if (! preg_match('/^\s*(\d{2,3})\s*[xX]\s*(\d{2,3})\s*$/', $value, $matches)) {
            return [50, 25];
        }

        $widthMm = max(20, min(120, (int) $matches[1]));
        $heightMm = max(15, min(120, (int) $matches[2]));

        return [$widthMm, $heightMm];
    }

    protected function normalizeMargin(mixed $value, int $widthMm, int $heightMm): int
    {
        $marginMm = is_numeric($value) ? (int) $value : 2;
        $marginMm = max(0, min(20, $marginMm));
        $maxAllowedMargin = max(0, (int) floor((min($widthMm, $heightMm) - 2) / 2));

        return min($marginMm, $maxAllowedMargin);
    }
}
