<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Department;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;

class MaintenanceOptionsService
{
    public function ticketOptions(): array
    {
        return [
            'assets' => Asset::query()
                ->with(['department', 'location'])
                ->orderBy('asset_name')
                ->get()
                ->map(fn (Asset $asset) => [
                    'id' => $asset->id,
                    'name' => $asset->asset_name,
                    'code' => $asset->asset_code,
                    'serial_number' => $asset->serial_number,
                    'department_name' => $asset->department?->name,
                    'location_name' => $asset->location?->name,
                ])
                ->values()
                ->all(),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'designation']),
            'suppliers' => Supplier::query()->active()->orderBy('supplier_name')->get(['id', 'supplier_name as name', 'supplier_code as code']),
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'locations' => Location::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'department_id']),
            'types' => $this->enumOptions(['corrective', 'preventive', 'calibration', 'inspection', 'breakdown', 'warranty']),
            'statuses' => $this->enumOptions(['open', 'assigned', 'in_progress', 'awaiting_parts', 'completed', 'closed']),
            'fitStatuses' => $this->enumOptions(['fit_for_use', 'unfit_for_use', 'conditional']),
        ];
    }

    public function scheduleOptions(): array
    {
        return [
            'statuses' => $this->enumOptions(['scheduled', 'due_soon', 'overdue', 'completed']),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'designation']),
        ];
    }

    protected function enumOptions(array $values): array
    {
        return collect($values)
            ->map(fn (string $value) => [
                'value' => $value,
                'label' => str($value)->replace('_', ' ')->title()->toString(),
            ])
            ->values()
            ->all();
    }
}
