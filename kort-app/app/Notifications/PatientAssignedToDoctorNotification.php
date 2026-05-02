<?php

namespace App\Notifications;

use App\Models\Patient;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PatientAssignedToDoctorNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Patient $patient,
        protected string $assignmentSource,
        protected ?string $assignedByName = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $title = match ($this->assignmentSource) {
            'admission' => 'New admission assigned to you',
            'visit' => 'New visit assigned to you',
            default => 'New patient assigned to you',
        };

        $body = match ($this->assignmentSource) {
            'admission' => $this->patient->full_name.' has been assigned to you as attending doctor.',
            'visit' => $this->patient->full_name.' has been assigned to your clinical queue.',
            default => $this->patient->full_name.' has been assigned to your patient list.',
        };

        return [
            'title' => $title,
            'body' => $body,
            'patient_id' => $this->patient->id,
            'patient_name' => $this->patient->full_name,
            'patient_number' => $this->patient->patient_number,
            'cnic' => $this->patient->cnic,
            'assignment_source' => $this->assignmentSource,
            'assigned_by' => $this->assignedByName,
            'url' => route('patients.show', $this->patient),
        ];
    }
}

