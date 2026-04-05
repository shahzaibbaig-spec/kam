<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetIssueRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Services\AssetAssignmentService;
use App\Services\AssetOptionsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AssetIssueController extends Controller
{
    public function create(Asset $asset, AssetOptionsService $optionsService): Response
    {
        $this->authorize('issue', $asset);

        return Inertia::render('Assets/Workflow/Issue', [
            'asset' => AssetResource::make($asset->load(['category', 'department', 'location', 'assignedUser', 'activeAssignment'])),
            'options' => $optionsService->workflowOptions(),
        ]);
    }

    public function store(AssetIssueRequest $request, Asset $asset, AssetAssignmentService $assignmentService): RedirectResponse
    {
        $this->authorize('issue', $asset);

        $assignmentService->issue($asset, $request->validated(), $request->user());

        return redirect()
            ->route('assets.show', $asset)
            ->with('success', 'Asset issued successfully.');
    }
}
