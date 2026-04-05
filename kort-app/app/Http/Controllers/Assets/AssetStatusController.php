<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetStatusChangeRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Services\AssetOptionsService;
use App\Services\AssetStatusService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AssetStatusController extends Controller
{
    public function create(Asset $asset, AssetOptionsService $optionsService): Response
    {
        $this->authorize('changeStatus', $asset);

        return Inertia::render('Assets/Workflow/Status', [
            'asset' => AssetResource::make($asset->load(['category', 'department', 'location'])),
            'options' => $optionsService->workflowOptions(),
        ]);
    }

    public function store(AssetStatusChangeRequest $request, Asset $asset, AssetStatusService $statusService): RedirectResponse
    {
        $this->authorize('changeStatus', $asset);

        $statusService->change(
            $asset,
            $request->validated('asset_status'),
            $request->validated('condition_status'),
            $request->validated('reason'),
            $request->user(),
        );

        return redirect()
            ->route('assets.show', $asset)
            ->with('success', 'Asset status updated successfully.');
    }
}
