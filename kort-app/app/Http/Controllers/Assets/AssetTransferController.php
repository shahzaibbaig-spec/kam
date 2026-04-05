<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetTransferRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Services\AssetAssignmentService;
use App\Services\AssetOptionsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AssetTransferController extends Controller
{
    public function create(Asset $asset, AssetOptionsService $optionsService): Response
    {
        $this->authorize('transfer', $asset);

        return Inertia::render('Assets/Workflow/Transfer', [
            'asset' => AssetResource::make($asset->load(['category', 'department', 'location', 'assignedUser', 'assignedDepartment', 'assignedLocation', 'activeAssignment'])),
            'options' => $optionsService->workflowOptions(),
        ]);
    }

    public function store(AssetTransferRequest $request, Asset $asset, AssetAssignmentService $assignmentService): RedirectResponse
    {
        $this->authorize('transfer', $asset);

        $assignmentService->transfer($asset, $request->validated(), $request->user());

        return redirect()
            ->route('assets.show', $asset)
            ->with('success', 'Asset transferred successfully.');
    }
}
