<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PatientPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('patient.view');
    }

    public function view(User $user, Patient $patient): bool
    {
        if (! $user->can('patient.view')) {
            return false;
        }

        if ($user->hasRole('Doctor / Consultant')) {
            return $patient->assigned_doctor_id === $user->id
                || $patient->admissions()->where('attending_doctor_id', $user->id)->exists()
                || $patient->visits()->where('doctor_id', $user->id)->exists();
        }

        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('patient.create');
    }

    public function update(User $user, Patient $patient): bool
    {
        if (! $user->can('patient.edit')) {
            return false;
        }

        if ($user->hasRole('Receptionist')) {
            $checkupStarted = $patient->diagnoses()->exists() || $patient->prescriptions()->exists();

            return ! $checkupStarted;
        }

        return true;
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->can('patient.delete');
    }

    public function search(User $user): bool
    {
        return $user->can('patient.search');
    }

    public function assignDoctor(User $user): bool
    {
        return $user->can('patient.assign-doctor');
    }

    public function changeDoctor(User $user): bool
    {
        return $user->can('patient.change-doctor');
    }
}
