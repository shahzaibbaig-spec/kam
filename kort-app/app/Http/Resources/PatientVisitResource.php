<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientVisitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'admission_id' => $this->admission_id,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'visit_number' => $this->visit_number,
            'visit_date' => $this->visit_date?->toDateTimeString(),
            'visit_type' => $this->visit_type,
            'doctor_id' => $this->doctor_id,
            'doctor_name' => $this->doctor?->name,
            'chief_complaint' => $this->chief_complaint,
            'vitals' => $this->vitals,
            'notes' => $this->notes,
            'diagnoses' => $this->whenLoaded('diagnoses', fn () => $this->diagnoses->map(fn ($diagnosis) => [
                'id' => $diagnosis->id,
                'doctor_name' => $diagnosis->doctor?->name,
                'diagnosis' => $diagnosis->diagnosis,
                'clinical_notes' => $diagnosis->clinical_notes,
                'severity' => $diagnosis->severity,
                'follow_up_date' => $diagnosis->follow_up_date?->toDateString(),
            ])->values()),
            'prescriptions' => $this->whenLoaded('prescriptions', fn () => $this->prescriptions->map(fn ($prescription) => [
                'id' => $prescription->id,
                'prescription_number' => $prescription->prescription_number,
                'prescription_date' => $prescription->prescription_date?->toDateTimeString(),
                'doctor_name' => $prescription->doctor?->name,
                'instructions' => $prescription->instructions,
                'printable_notes' => $prescription->printable_notes,
                'items' => $prescription->items->map(fn ($item) => [
                    'id' => $item->id,
                    'medicine_name' => $item->medicine_name,
                    'dosage' => $item->dosage,
                    'frequency' => $item->frequency,
                    'duration' => $item->duration,
                    'instructions' => $item->instructions,
                ])->values(),
            ])->values()),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
