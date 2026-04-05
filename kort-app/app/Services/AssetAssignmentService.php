<?php

namespace App\Services;

use App\Enums\AssetAssignmentStatus;
use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssetAssignmentService
{
    public function __construct(
        protected AssetMovementService $movementService,
        protected AssetStatusService $statusService,
    ) {
    }

    public function issue(Asset $asset, array $payload, User $actor): AssetAssignment
    {
        $asset->loadMissing('activeAssignment');

        $currentStatus = $asset->asset_status instanceof AssetStatus ? $asset->asset_status : AssetStatus::from((string) $asset->asset_status);

        if (! $currentStatus->canBeIssued()) {
            throw ValidationException::withMessages([
                'asset' => 'Only assets in available status can be issued.',
            ]);
        }

        return DB::transaction(function () use ($asset, $payload, $actor) {
            $issuedAt = Carbon::parse($payload['issued_at']);
            $snapshot = $this->snapshot($asset);
            $this->closeActiveAssignment($asset, $issuedAt, $actor, AssetAssignmentStatus::ClosedReassigned->value, 'Closed automatically before a new issue.');

            $assignment = $asset->assignments()->create([
                'assignment_type' => $payload['assignment_type'],
                'department_id' => $payload['department_id'] ?? null,
                'location_id' => $payload['location_id'] ?? null,
                'assigned_user_id' => $payload['assigned_user_id'] ?? null,
                'room_or_area' => $payload['room_or_area'] ?? null,
                'custodian_name' => $payload['custodian_name'] ?? null,
                'issued_by' => $actor->id,
                'received_by' => $payload['assignment_type'] === 'staff' ? ($payload['assigned_user_id'] ?? null) : null,
                'assigned_at' => $issuedAt,
                'expected_return_at' => $payload['expected_return_at'] ?? null,
                'status' => AssetAssignmentStatus::Active->value,
                'remarks' => $payload['remarks'] ?? null,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            $asset->forceFill([
                'department_id' => $payload['department_id'] ?? $asset->department_id,
                'location_id' => $payload['location_id'] ?? $asset->location_id,
                'room_or_area' => $payload['room_or_area'] ?? null,
                'assigned_user_id' => $payload['assigned_user_id'] ?? null,
                'assigned_department_id' => $payload['department_id'] ?? null,
                'assigned_location_id' => $payload['location_id'] ?? null,
                'custodian_name' => $payload['custodian_name'] ?? null,
                'last_issued_at' => $issuedAt,
                'updated_by' => $actor->id,
            ])->save();

            $this->statusService->change(
                $asset,
                AssetStatus::InUse,
                null,
                $payload['remarks'] ?? 'Asset issued.',
                $actor,
                false,
            );

            $this->movementService->record($asset, $actor, [
                'movement_type' => 'issued',
                'movement_datetime' => $issuedAt,
                'reference_type' => AssetAssignment::class,
                'reference_id' => $assignment->id,
                'from_department_id' => $snapshot['department_id'],
                'to_department_id' => $payload['department_id'] ?? $snapshot['department_id'],
                'from_location_id' => $snapshot['location_id'],
                'to_location_id' => $payload['location_id'] ?? $snapshot['location_id'],
                'from_user_id' => $snapshot['assigned_user_id'],
                'to_user_id' => $payload['assigned_user_id'] ?? null,
                'from_room_or_area' => $snapshot['room_or_area'],
                'to_room_or_area' => $payload['room_or_area'] ?? null,
                'notes' => $payload['remarks'] ?? null,
            ]);

            activity('assets')
                ->performedOn($asset)
                ->causedBy($actor)
                ->event('issued')
                ->withProperties([
                    'assignment_id' => $assignment->id,
                    'assignment_type' => $assignment->assignment_type->value,
                    'department_id' => $assignment->department_id,
                    'location_id' => $assignment->location_id,
                    'assigned_user_id' => $assignment->assigned_user_id,
                ])
                ->log('Asset issued');

            return $assignment;
        });
    }

    public function return(Asset $asset, array $payload, User $actor): AssetAssignment
    {
        $asset->loadMissing('activeAssignment');
        $activeAssignment = $asset->activeAssignment()->first();

        if (! $activeAssignment) {
            throw ValidationException::withMessages([
                'asset' => 'This asset does not have an active assignment to return.',
            ]);
        }

        return DB::transaction(function () use ($asset, $activeAssignment, $payload, $actor) {
            $returnedAt = Carbon::parse($payload['returned_at']);
            $snapshot = $this->snapshot($asset);

            $activeAssignment->forceFill([
                'returned_at' => $returnedAt,
                'received_by' => $actor->id,
                'status' => AssetAssignmentStatus::Returned->value,
                'remarks' => $payload['remarks'] ?? $activeAssignment->remarks,
                'updated_by' => $actor->id,
            ])->save();

            $asset->forceFill([
                'department_id' => $payload['return_to_department_id'] ?? $asset->department_id,
                'location_id' => $payload['return_to_location_id'] ?? $asset->location_id,
                'room_or_area' => $payload['return_to_room_or_area'] ?? null,
                'assigned_user_id' => null,
                'assigned_department_id' => null,
                'assigned_location_id' => null,
                'custodian_name' => null,
                'last_returned_at' => $returnedAt,
                'updated_by' => $actor->id,
            ])->save();

            $this->statusService->change(
                $asset,
                $payload['post_return_status'] ?? AssetStatus::Available->value,
                $payload['return_condition'] ?? null,
                $payload['remarks'] ?? 'Asset returned.',
                $actor,
                false,
            );

            $this->movementService->record($asset, $actor, [
                'movement_type' => 'returned',
                'movement_datetime' => $returnedAt,
                'reference_type' => AssetAssignment::class,
                'reference_id' => $activeAssignment->id,
                'from_department_id' => $snapshot['department_id'],
                'to_department_id' => $payload['return_to_department_id'] ?? $snapshot['department_id'],
                'from_location_id' => $snapshot['location_id'],
                'to_location_id' => $payload['return_to_location_id'] ?? $snapshot['location_id'],
                'from_user_id' => $snapshot['assigned_user_id'],
                'to_user_id' => null,
                'from_room_or_area' => $snapshot['room_or_area'],
                'to_room_or_area' => $payload['return_to_room_or_area'] ?? null,
                'notes' => $payload['remarks'] ?? null,
            ]);

            activity('assets')
                ->performedOn($asset)
                ->causedBy($actor)
                ->event('returned')
                ->withProperties([
                    'assignment_id' => $activeAssignment->id,
                    'returned_at' => $returnedAt->toDateTimeString(),
                ])
                ->log('Asset returned');

            return $activeAssignment->fresh();
        });
    }

    public function transfer(Asset $asset, array $payload, User $actor): AssetAssignment
    {
        $currentStatus = $asset->asset_status instanceof AssetStatus ? $asset->asset_status->value : (string) $asset->asset_status;

        if (in_array($currentStatus, [AssetStatus::Disposed->value, AssetStatus::Condemned->value, AssetStatus::Lost->value], true)) {
            throw ValidationException::withMessages([
                'asset' => 'Disposed, condemned, or lost assets cannot be transferred.',
            ]);
        }

        return DB::transaction(function () use ($asset, $payload, $actor) {
            $transferredAt = Carbon::parse($payload['transfer_datetime']);
            $snapshot = $this->snapshot($asset);
            $this->closeActiveAssignment($asset, $transferredAt, $actor, AssetAssignmentStatus::Transferred->value, 'Closed automatically during transfer.');

            $assignment = $asset->assignments()->create([
                'assignment_type' => $payload['assignment_type'],
                'department_id' => $payload['department_id'] ?? null,
                'location_id' => $payload['location_id'] ?? null,
                'assigned_user_id' => $payload['assigned_user_id'] ?? null,
                'room_or_area' => $payload['room_or_area'] ?? null,
                'custodian_name' => $payload['custodian_name'] ?? null,
                'issued_by' => $actor->id,
                'received_by' => $payload['assignment_type'] === 'staff' ? ($payload['assigned_user_id'] ?? null) : null,
                'assigned_at' => $transferredAt,
                'status' => AssetAssignmentStatus::Active->value,
                'remarks' => $payload['remarks'] ?? null,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            $asset->forceFill([
                'department_id' => $payload['department_id'] ?? $asset->department_id,
                'location_id' => $payload['location_id'] ?? $asset->location_id,
                'room_or_area' => $payload['room_or_area'] ?? null,
                'assigned_user_id' => $payload['assigned_user_id'] ?? null,
                'assigned_department_id' => $payload['department_id'] ?? null,
                'assigned_location_id' => $payload['location_id'] ?? null,
                'custodian_name' => $payload['custodian_name'] ?? null,
                'updated_by' => $actor->id,
            ])->save();

            $this->movementService->record($asset, $actor, [
                'movement_type' => 'transferred',
                'movement_datetime' => $transferredAt,
                'reference_type' => AssetAssignment::class,
                'reference_id' => $assignment->id,
                'from_department_id' => $snapshot['department_id'],
                'to_department_id' => $payload['department_id'] ?? $snapshot['department_id'],
                'from_location_id' => $snapshot['location_id'],
                'to_location_id' => $payload['location_id'] ?? $snapshot['location_id'],
                'from_user_id' => $snapshot['assigned_user_id'],
                'to_user_id' => $payload['assigned_user_id'] ?? null,
                'from_room_or_area' => $snapshot['room_or_area'],
                'to_room_or_area' => $payload['room_or_area'] ?? null,
                'notes' => $payload['remarks'] ?? null,
            ]);

            activity('assets')
                ->performedOn($asset)
                ->causedBy($actor)
                ->event('transferred')
                ->withProperties([
                    'assignment_id' => $assignment->id,
                    'assignment_type' => $assignment->assignment_type->value,
                    'department_id' => $assignment->department_id,
                    'location_id' => $assignment->location_id,
                    'assigned_user_id' => $assignment->assigned_user_id,
                ])
                ->log('Asset transferred');

            return $assignment;
        });
    }

    protected function closeActiveAssignment(Asset $asset, Carbon $closedAt, User $actor, string $status, string $remark): void
    {
        $activeAssignment = $asset->activeAssignment()->first();

        if (! $activeAssignment) {
            return;
        }

        $activeAssignment->forceFill([
            'returned_at' => $activeAssignment->returned_at ?: $closedAt,
            'received_by' => $activeAssignment->received_by ?: $actor->id,
            'status' => $status,
            'remarks' => trim(($activeAssignment->remarks ? $activeAssignment->remarks.' ' : '').$remark),
            'updated_by' => $actor->id,
        ])->save();
    }

    protected function snapshot(Asset $asset): array
    {
        return [
            'department_id' => $asset->department_id,
            'location_id' => $asset->location_id,
            'assigned_user_id' => $asset->assigned_user_id,
            'room_or_area' => $asset->room_or_area,
        ];
    }
}
