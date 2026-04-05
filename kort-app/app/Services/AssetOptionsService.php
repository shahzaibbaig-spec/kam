<?php

namespace App\Services;

use App\Enums\AssetAssignmentType;
use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use App\Models\AssetCategory;
use App\Models\Department;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;

class AssetOptionsService
{
    public function assetFormOptions(): array
    {
        return [
            'categories' => AssetCategory::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'locations' => Location::query()->where('is_active', true)->orderBy('name')->get(['id', 'department_id', 'name', 'code']),
            'users' => User::query()->orderBy('name')->get(['id', 'department_id', 'default_location_id', 'name', 'designation']),
            'suppliers' => Supplier::query()->active()->orderBy('supplier_name')->get(['id', 'supplier_name as name', 'supplier_code as code']),
            'assetStatuses' => $this->enumOptions(AssetStatus::cases()),
            'conditionStatuses' => $this->enumOptions(AssetConditionStatus::cases()),
        ];
    }

    public function workflowOptions(): array
    {
        return [
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'locations' => Location::query()->where('is_active', true)->orderBy('name')->get(['id', 'department_id', 'name', 'code']),
            'users' => User::query()->orderBy('name')->get(['id', 'department_id', 'default_location_id', 'name', 'designation']),
            'assignmentTypes' => $this->enumOptions(AssetAssignmentType::cases()),
            'assetStatuses' => $this->enumOptions(AssetStatus::cases()),
            'conditionStatuses' => $this->enumOptions(AssetConditionStatus::cases()),
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
