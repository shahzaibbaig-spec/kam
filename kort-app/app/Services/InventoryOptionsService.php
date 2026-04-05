<?php

namespace App\Services;

use App\Enums\InventoryBatchStatus;
use App\Enums\InventoryIssueType;
use App\Enums\StockAdjustmentType;
use App\Enums\StockReturnCondition;
use App\Models\Department;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\StockIssue;
use App\Models\Supplier;
use App\Models\User;

class InventoryOptionsService
{
    public function filters(): array
    {
        return [
            'categories' => InventoryCategory::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'locations' => Location::query()->where('is_active', true)->orderBy('name')->get(['id', 'department_id', 'name', 'code']),
            'suppliers' => Supplier::query()->active()->orderBy('supplier_name')->get(['id', 'supplier_name as name', 'supplier_code as code']),
            'batchStatuses' => $this->enumOptions(InventoryBatchStatus::cases()),
        ];
    }

    public function formOptions(): array
    {
        return [
            ...$this->filters(),
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ];
    }

    public function workflowOptions(): array
    {
        return [
            ...$this->formOptions(),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'designation', 'department_id', 'default_location_id']),
            'items' => InventoryItem::query()
                ->with(['category', 'storeLocation', 'batches.storeLocation'])
                ->where('is_active', true)
                ->orderBy('item_name')
                ->get()
                ->map(function (InventoryItem $item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'item_code' => $item->item_code,
                        'unit_of_measure' => $item->unit_of_measure,
                        'current_quantity' => $item->current_quantity,
                        'reorder_level' => $item->reorder_level,
                        'store_location_id' => $item->store_location_id,
                        'store_location_name' => $item->storeLocation?->name,
                        'batches' => $item->batches->map(fn ($batch) => [
                            'id' => $batch->id,
                            'batch_number' => $batch->batch_number,
                            'available_quantity' => $batch->available_quantity,
                            'status' => $batch->status->value,
                            'expiry_date' => $batch->expiry_date?->toDateString(),
                            'store_location_id' => $batch->store_location_id,
                            'store_location_name' => $batch->storeLocation?->name,
                        ])->values()->all(),
                    ];
                })
                ->values()
                ->all(),
            'issueTypes' => $this->enumOptions(InventoryIssueType::cases()),
            'returnConditions' => $this->enumOptions(StockReturnCondition::cases()),
            'adjustmentTypes' => $this->enumOptions(StockAdjustmentType::cases()),
            'sourceIssues' => StockIssue::query()
                ->with(['department', 'location', 'issuedToUser'])
                ->latest('issue_date')
                ->take(200)
                ->get(['id', 'issue_number', 'issue_date', 'department_id', 'location_id', 'issued_to_user_id'])
                ->map(fn (StockIssue $issue) => [
                    'id' => $issue->id,
                    'issue_number' => $issue->issue_number,
                    'issue_date' => $issue->issue_date?->toDateString(),
                    'department_name' => $issue->department?->name,
                    'location_name' => $issue->location?->name,
                    'issued_to_user_name' => $issue->issuedToUser?->name,
                ])
                ->values()
                ->all(),
        ];
    }

    protected function enumOptions(array $cases): array
    {
        return collect($cases)
            ->map(fn ($case) => [
                'value' => $case->value,
                'label' => str($case->value)->replace('_', ' ')->title()->toString(),
            ])
            ->values()
            ->all();
    }
}
