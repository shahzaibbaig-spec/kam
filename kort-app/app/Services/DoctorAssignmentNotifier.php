<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Models\Patient;
use App\Models\User;
use App\Notifications\PatientAssignedToDoctorNotification;

class DoctorAssignmentNotifier
{
    public function notify(
        Patient $patient,
        ?int $doctorId,
        ?User $actor = null,
        string $assignmentSource = 'patient',
    ): void {
        if (! $doctorId) {
            return;
        }

        $doctor = User::query()
            ->whereKey($doctorId)
            ->where('status', UserStatus::Active->value)
            ->role('Doctor / Consultant')
            ->first();

        if (! $doctor) {
            return;
        }

        $doctor->notify(new PatientAssignedToDoctorNotification(
            patient: $patient,
            assignmentSource: $assignmentSource,
            assignedByName: $actor?->name,
        ));
    }
}

