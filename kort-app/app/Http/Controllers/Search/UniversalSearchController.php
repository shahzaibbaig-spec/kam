<?php

namespace App\Http\Controllers\Search;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UniversalSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));
        $limit = max(1, min((int) $request->integer('limit', 5), 10));

        $emptyResults = [
            'assets' => [],
            'people' => [],
            'vendors' => [],
            'users' => [],
        ];

        if ($query === '' || mb_strlen($query) < 2) {
            return response()->json([
                'query' => $query,
                'results' => $emptyResults,
            ]);
        }

        $searchTerm = '%'.addcslashes($query, '\%_').'%';

        $assets = $request->user()->can('asset.view')
            ? Asset::query()
                ->with(['department:id,name', 'assignedUser:id,name'])
                ->where(function ($queryBuilder) use ($searchTerm) {
                    $queryBuilder
                        ->where('asset_name', 'like', $searchTerm)
                        ->orWhere('asset_code', 'like', $searchTerm)
                        ->orWhere('tag_number', 'like', $searchTerm)
                        ->orWhere('serial_number', 'like', $searchTerm)
                        ->orWhere('barcode_value', 'like', $searchTerm)
                        ->orWhere('custodian_name', 'like', $searchTerm);
                })
                ->orderBy('asset_name')
                ->limit($limit)
                ->get()
                ->map(function (Asset $asset) {
                    $subtitle = collect([
                        $asset->asset_code,
                        $asset->tag_number,
                        $asset->department?->name,
                        $asset->assignedUser?->name,
                    ])
                        ->filter()
                        ->implode(' | ');

                    return [
                        'id' => $asset->id,
                        'title' => $asset->asset_name,
                        'subtitle' => $subtitle !== '' ? $subtitle : 'Asset record',
                        'url' => route('assets.show', $asset),
                    ];
                })
                ->values()
                ->all()
            : [];

        $people = [];
        if ($request->user()->can('asset.view')) {
            $peopleFromAssets = Asset::query()
                ->select(['id', 'custodian_name', 'asset_name', 'asset_code'])
                ->whereNotNull('custodian_name')
                ->where('custodian_name', 'like', $searchTerm)
                ->orderBy('custodian_name')
                ->limit($limit * 2)
                ->get()
                ->map(function (Asset $asset) {
                    $subtitle = trim('Custodian on '.$asset->asset_name.($asset->asset_code ? ' ('.$asset->asset_code.')' : ''));

                    return [
                        'id' => 'asset-'.$asset->id,
                        'title' => (string) $asset->custodian_name,
                        'subtitle' => $subtitle,
                        'url' => route('assets.show', $asset),
                    ];
                });

            $peopleFromAssignments = AssetAssignment::query()
                ->select([
                    'asset_assignments.id',
                    'asset_assignments.custodian_name',
                    'asset_assignments.asset_id',
                    'assets.asset_name',
                    'assets.asset_code',
                ])
                ->join('assets', 'assets.id', '=', 'asset_assignments.asset_id')
                ->whereNull('assets.deleted_at')
                ->whereNotNull('asset_assignments.custodian_name')
                ->where('asset_assignments.custodian_name', 'like', $searchTerm)
                ->orderByDesc('asset_assignments.assigned_at')
                ->limit($limit * 2)
                ->get()
                ->map(function ($record) {
                    $subtitle = trim('Assignment record on '.$record->asset_name.($record->asset_code ? ' ('.$record->asset_code.')' : ''));

                    return [
                        'id' => 'assignment-'.$record->id,
                        'title' => (string) $record->custodian_name,
                        'subtitle' => $subtitle,
                        'url' => route('assets.show', ['asset' => $record->asset_id]),
                    ];
                });

            $people = $peopleFromAssets
                ->merge($peopleFromAssignments)
                ->unique(fn (array $entry) => mb_strtolower(trim((string) $entry['title'])))
                ->take($limit)
                ->values()
                ->all();
        }

        $vendors = $request->user()->can('supplier.view')
            ? Supplier::query()
                ->where(function ($queryBuilder) use ($searchTerm) {
                    $queryBuilder
                        ->where('supplier_name', 'like', $searchTerm)
                        ->orWhere('supplier_code', 'like', $searchTerm)
                        ->orWhere('contact_person', 'like', $searchTerm)
                        ->orWhere('email', 'like', $searchTerm);
                })
                ->orderBy('supplier_name')
                ->limit($limit)
                ->get()
                ->map(function (Supplier $supplier) {
                    $subtitle = collect([
                        $supplier->supplier_code,
                        $supplier->contact_person,
                        $supplier->email,
                    ])
                        ->filter()
                        ->implode(' | ');

                    return [
                        'id' => $supplier->id,
                        'title' => $supplier->supplier_name,
                        'subtitle' => $subtitle !== '' ? $subtitle : 'Vendor record',
                        'url' => route('procurement.suppliers.show', $supplier),
                    ];
                })
                ->values()
                ->all()
            : [];

        $canUpdateUsers = $request->user()->can('users.update');
        $users = $request->user()->can('users.view')
            ? User::query()
                ->where(function ($queryBuilder) use ($searchTerm) {
                    $queryBuilder
                        ->where('name', 'like', $searchTerm)
                        ->orWhere('email', 'like', $searchTerm)
                        ->orWhere('employee_id', 'like', $searchTerm)
                        ->orWhere('designation', 'like', $searchTerm);
                })
                ->orderBy('name')
                ->limit($limit)
                ->get()
                ->map(function (User $matchedUser) use ($canUpdateUsers) {
                    $subtitle = collect([
                        $matchedUser->employee_id,
                        $matchedUser->designation,
                        $matchedUser->email,
                    ])
                        ->filter()
                        ->implode(' | ');

                    $fallbackSearch = $matchedUser->email ?: $matchedUser->name;

                    return [
                        'id' => $matchedUser->id,
                        'title' => $matchedUser->name,
                        'subtitle' => $subtitle !== '' ? $subtitle : 'User record',
                        'url' => $canUpdateUsers
                            ? route('admin.users.edit', $matchedUser)
                            : route('admin.users.index', ['search' => $fallbackSearch]),
                    ];
                })
                ->values()
                ->all()
            : [];

        return response()->json([
            'query' => $query,
            'results' => [
                'assets' => $assets,
                'people' => $people,
                'vendors' => $vendors,
                'users' => $users,
            ],
        ]);
    }
}
