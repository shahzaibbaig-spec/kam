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

    public function showLabel(Request $request, Asset $asset, AssetTagService $tagService, BarcodeLabelService $labelService): View|RedirectResponse
    {
        $this->authorize('printTag', $asset);
        $asset->load(['department', 'location', 'activeTag']);

        if (! $asset->activeTag) {
            return redirect()
                ->route('assets.show', $asset)
                ->with('error', 'Generate a tag before printing a label.');
        }

        $tagService->markPrinted([$asset], $request->user());

        return view('print.asset-labels', [
            'title' => 'Asset Label Preview',
            'labels' => [$labelService->buildLabelPayload($asset)],
            'printMode' => true,
        ]);
    }

    public function bulkPrint(AssetBulkPrintRequest $request, AssetTagService $tagService, BarcodeLabelService $labelService): View
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

        return view('print.asset-labels', [
            'title' => 'Bulk Asset Labels',
            'labels' => $labelService->buildMany($assets),
            'printMode' => true,
        ]);
    }
}
