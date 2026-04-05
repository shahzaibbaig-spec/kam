<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\AssetScanRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetScanController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('asset.scan'), 403);

        return Inertia::render('Assets/Scan/Index', [
            'query' => null,
            'matches' => [],
            'error' => null,
        ]);
    }

    public function lookup(AssetScanRequest $request): Response|RedirectResponse
    {
        abort_unless($request->user()->can('asset.scan'), 403);

        $query = trim((string) $request->validated('query'));

        if (preg_match('/\/assets\/(\d+)/', $query, $matches)) {
            $asset = Asset::query()->find($matches[1]);

            if ($asset) {
                return redirect()->route('assets.show', $asset);
            }
        }

        $assets = Asset::query()
            ->with(['category', 'department', 'location', 'assignedUser', 'activeTag'])
            ->where(function ($queryBuilder) use ($query) {
                $queryBuilder
                    ->where('tag_number', $query)
                    ->orWhere('barcode_value', $query)
                    ->orWhere('qr_value', $query)
                    ->orWhere('asset_code', $query)
                    ->orWhere('serial_number', $query);
            })
            ->orderBy('asset_name')
            ->get();

        if ($assets->count() === 1) {
            return redirect()->route('assets.show', $assets->first());
        }

        return Inertia::render('Assets/Scan/Index', [
            'query' => $query,
            'matches' => AssetResource::collection($assets),
            'error' => $assets->isEmpty() ? 'No asset matched the scanned value.' : null,
        ]);
    }
}
