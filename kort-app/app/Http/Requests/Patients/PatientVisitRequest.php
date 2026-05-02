<?php

namespace App\Http\Requests\Patients;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admission_id' => ['nullable', 'exists:patient_admissions,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'visit_date' => ['required', 'date'],
            'visit_type' => ['required', 'string', Rule::in(['opd', 'emergency', 'admitted_followup'])],
            'doctor_id' => ['required', Rule::exists('users', 'id')->where(fn ($query) => $query->where('status', UserStatus::Active->value))],
            'chief_complaint' => ['required', 'string', 'max:5000'],
            'vitals' => ['nullable', 'string', 'max:4000'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $doctorId = $this->input('doctor_id');
            if (! filled($doctorId)) {
                return;
            }

            $isDoctor = User::query()
                ->whereKey($doctorId)
                ->role('Doctor / Consultant')
                ->exists();

            if (! $isDoctor) {
                $validator->errors()->add('doctor_id', 'Selected user is not an active doctor.');
            }
        });
    }
}
