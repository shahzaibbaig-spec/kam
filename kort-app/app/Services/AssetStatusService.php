<?php

namespace App\Services;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\AssetStatusLog;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AssetStatusService
{
    public function __construct(
        protected AssetMovementService $movementService,
    ) {
    }

    public function change(
        Asset $asset,
        AssetStatus|string $newStatus,
        ?string $newCondition,
        ?string $reason,
        User $actor,
        bool $recordMovement = true,
        array $movementContext = [],
    ): ?AssetStatusLog {
        $targetStatus = $newStatus instanceof AssetStatus ? $newStatus->value : $newStatus;
        $currentStatus = $asset->asset_status instanceof AssetStatus ? $asset->asset_status->value : (string) $asset->asset_status;
        $currentCondition = $asset->condition_status?->value ?? (string) $asset->condition_status;
        $targetCondition = $newCondition ?: $currentCondition;

        if ($currentStatus === $targetStatus && $currentCondition === $targetCondition) {
            return null;
        }

        if ($currentStatus !== $targetStatus && ! $this->isAllowedTransition($currentStatus, $targetStatus)) {
            throw ValidationException::withMessages([
                'asset_status' => 'The selected asset status transition is not allowed.',
            ]);
        }

        $asset->forceFill([
            'asset_status' => $targetStatus,
            'condition_status' => $targetCondition,
            'updated_by' => $actor->id,
        ])->save();

        $log = $asset->statusLogs()->create([
            'old_status' => $currentStatus !== '' ? $currentStatus : null,
            'new_status' => $targetStatus,
            'old_condition' => $currentCondition !== '' ? $currentCondition : null,
            'new_condition' => $targetCondition,
            'changed_by' => $actor->id,
            'changed_at' => now(),
            'reason' => $reason,
        ]);

        if ($recordMovement) {
            $this->movementService->record($asset, $actor, [
                'movement_type' => 'status_changed',
                'movement_datetime' => $log->changed_at,
                'reference_type' => AssetStatusLog::class,
                'reference_id' => $log->id,
                'from_department_id' => $movementContext['from_department_id'] ?? $asset->department_id,
                'to_department_id' => $movementContext['to_department_id'] ?? $asset->department_id,
                'from_location_id' => $movementContext['from_location_id'] ?? $asset->location_id,
                'to_location_id' => $movementContext['to_location_id'] ?? $asset->location_id,
                'from_user_id' => $movementContext['from_user_id'] ?? $asset->assigned_user_id,
                'to_user_id' => $movementContext['to_user_id'] ?? $asset->assigned_user_id,
                'from_room_or_area' => $movementContext['from_room_or_area'] ?? $asset->room_or_area,
                'to_room_or_area' => $movementContext['to_room_or_area'] ?? $asset->room_or_area,
                'notes' => $reason,
            ]);
        }

        activity('assets')
            ->performedOn($asset)
            ->causedBy($actor)
            ->event('status-changed')
            ->withProperties([
                'old_status' => $currentStatus,
                'new_status' => $targetStatus,
                'old_condition' => $currentCondition,
                'new_condition' => $targetCondition,
                'reason' => $reason,
            ])
            ->log('Asset status changed');

        return $log;
    }

    protected function isAllowedTransition(string $from, string $to): bool
    {
        if ($from === $to) {
            return true;
        }

        $allowed = [
            AssetStatus::Available->value => [
                AssetStatus::InUse->value,
                AssetStatus::UnderCleaning->value,
                AssetStatus::UnderMaintenance->value,
                AssetStatus::UnderCalibration->value,
                AssetStatus::OutOfOrder->value,
                AssetStatus::Lost->value,
                AssetStatus::Condemned->value,
                AssetStatus::Disposed->value,
            ],
            AssetStatus::InUse->value => [
                AssetStatus::Available->value,
                AssetStatus::UnderCleaning->value,
                AssetStatus::OutOfOrder->value,
                AssetStatus::UnderMaintenance->value,
                AssetStatus::UnderCalibration->value,
                AssetStatus::Lost->value,
            ],
            AssetStatus::UnderCleaning->value => [
                AssetStatus::Available->value,
                AssetStatus::OutOfOrder->value,
            ],
            AssetStatus::UnderMaintenance->value => [
                AssetStatus::Available->value,
                AssetStatus::OutOfOrder->value,
                AssetStatus::Condemned->value,
            ],
            AssetStatus::UnderCalibration->value => [
                AssetStatus::Available->value,
                AssetStatus::OutOfOrder->value,
            ],
            AssetStatus::OutOfOrder->value => [
                AssetStatus::UnderMaintenance->value,
                AssetStatus::UnderCalibration->value,
                AssetStatus::Available->value,
                AssetStatus::Condemned->value,
            ],
            AssetStatus::Lost->value => [
                AssetStatus::Available->value,
                AssetStatus::Condemned->value,
                AssetStatus::Disposed->value,
            ],
            AssetStatus::Condemned->value => [
                AssetStatus::Disposed->value,
            ],
            AssetStatus::Disposed->value => [],
        ];

        return in_array($to, $allowed[$from] ?? [], true);
    }
}
