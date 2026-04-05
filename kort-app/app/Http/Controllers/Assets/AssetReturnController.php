<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetReturnRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Services\AssetAssignmentService;
use App\Services\AssetOptionsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AssetReturnController extends Controller
{
    public function create(Asset $asset, AssetOptionsService $optionsService): Response
    {
        $this->authorize('returnAsset', $asset);

        return Inertia::render('Assets/Workflow/Return', [
            'asset' => AssetResource::make($asset->load(['category', 'department', 'location', 'assignedUser', 'activeAssignment.department', 'activeAssignment.location', 'activeAssignment.assignedUser'])),
            'options' => $optionsService->workflowOptions(),
        ]);
    }

    public function store(AssetReturnRequest $request, Asset $asset, AssetAssignmentService $assignmentService): RedirectResponse
    {
        $this->authorize('returnAsset', $asset);

        $assignmentService->return($asset, $request->validated(), $request->user());

        return redirect()
            ->route('assets.show', $asset)
            ->with('success', 'Asset returned successfully.');
    }
}
