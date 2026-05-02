<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $activeAdmission = $this->relationLoaded('admissions')
            ? $this->admissions->firstWhere('status', 'admitted')
            : null;

        return [
            'id' => $this->id,
            'patient_number' => $this->patient_number,
            'cnic' => $this->cnic,
            'full_name' => $this->full_name,
            'father_name' => $this->father_name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'age' => $this->age,
            'computed_age' => $this->computed_age,
            'phone' => $this->phone,
            'emergency_contact' => $this->emergency_contact,
            'address' => $this->address,
            'blood_group' => $this->blood_group,
            'allergies' => $this->allergies,
            'medical_history' => $this->medical_history,
            'photo_path' => $this->photo_path,
            'assigned_doctor_id' => $this->assigned_doctor_id,
            'assigned_doctor_name' => $this->assignedDoctor?->name,
            'visits_count' => $this->whenCounted('visits'),
            'admissions_count' => $this->whenCounted('admissions'),
            'current_admission_status' => $activeAdmission?->status,
            'active_admission' => $activeAdmission ? [
                'id' => $activeAdmission->id,
                'admission_number' => $activeAdmission->admission_number,
                'admission_date' => $activeAdmission->admission_date?->toDateString(),
                'admission_time' => $activeAdmission->admission_time,
                'department_name' => $activeAdmission->department?->name,
                'ward_name' => $activeAdmission->ward?->name,
                'room_name' => $activeAdmission->room?->name,
                'bed_name' => $activeAdmission->bed?->name,
                'attending_doctor_name' => $activeAdmission->attendingDoctor?->name,
                'admission_reason' => $activeAdmission->admission_reason,
                'initial_condition' => $activeAdmission->initial_condition,
                'status' => $activeAdmission->status,
            ] : null,
            'admissions' => $this->whenLoaded('admissions', fn () => $this->admissions->map(fn ($admission) => [
                'id' => $admission->id,
                'admission_number' => $admission->admission_number,
                'admission_date' => $admission->admission_date?->toDateString(),
                'admission_time' => $admission->admission_time,
                'department_name' => $admission->department?->name,
                'ward_name' => $admission->ward?->name,
                'room_name' => $admission->room?->name,
                'bed_name' => $admission->bed?->name,
                'attending_doctor_name' => $admission->attendingDoctor?->name,
                'status' => $admission->status,
                'discharge_date' => $admission->discharge_date?->toDateString(),
                'discharge_summary' => $admission->discharge_summary,
            ])->values()),
            'visits' => $this->whenLoaded('visits', fn () => PatientVisitResource::collection($this->visits)),
            'diagnoses' => $this->whenLoaded('diagnoses', fn () => $this->diagnoses->map(fn ($diagnosis) => [
                'id' => $diagnosis->id,
                'visit_id' => $diagnosis->visit_id,
                'visit_number' => $diagnosis->visit?->visit_number,
                'visit_date' => $diagnosis->visit?->visit_date?->toDateTimeString(),
                'doctor_name' => $diagnosis->doctor?->name,
                'diagnosis' => $diagnosis->diagnosis,
                'clinical_notes' => $diagnosis->clinical_notes,
                'severity' => $diagnosis->severity,
                'follow_up_date' => $diagnosis->follow_up_date?->toDateString(),
            ])->values()),
            'prescriptions' => $this->whenLoaded('prescriptions', fn () => $this->prescriptions->map(fn ($prescription) => [
                'id' => $prescription->id,
                'visit_id' => $prescription->visit_id,
                'visit_number' => $prescription->visit?->visit_number,
                'prescription_number' => $prescription->prescription_number,
                'prescription_date' => $prescription->prescription_date?->toDateTimeString(),
                'doctor_name' => $prescription->doctor?->name,
                'dispensing_status' => $prescription->dispensing_status,
                'instructions' => $prescription->instructions,
                'printable_notes' => $prescription->printable_notes,
                'items' => $prescription->items->map(fn ($item) => [
                    'id' => $item->id,
                    'medicine_name' => $item->medicine_name,
                    'dosage' => $item->dosage,
                    'frequency' => $item->frequency,
                    'duration' => $item->duration,
                    'instructions' => $item->instructions,
                    'inventory_item_id' => $item->inventory_item_id,
                    'prescribed_quantity' => $item->prescribed_quantity,
                    'dispensed_quantity' => $item->dispensed_quantity,
                    'remaining_quantity' => $item->remaining_quantity,
                    'dispensing_status' => $item->dispensing_status,
                ])->values(),
            ])->values()),
            'documents' => $this->whenLoaded('documents', fn () => $this->documents->map(fn ($document) => [
                'id' => $document->id,
                'visit_id' => $document->visit_id,
                'visit_number' => $document->visit?->visit_number,
                'file_name' => $document->file_name,
                'file_path' => $document->file_path,
                'file_type' => $document->file_type,
                'notes' => $document->notes,
                'uploaded_by_name' => $document->uploadedBy?->name,
                'created_at' => $document->created_at?->toDateTimeString(),
            ])->values()),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
