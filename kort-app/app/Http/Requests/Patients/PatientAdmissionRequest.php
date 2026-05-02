<?php

namespace App\Http\Requests\Patients;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientAdmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admission_date' => ['required', 'date'],
            'admission_time' => ['required', 'date_format:H:i'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'ward_id' => ['nullable', 'exists:locations,id'],
            'room_id' => ['nullable', 'exists:locations,id'],
            'bed_id' => ['nullable', 'exists:locations,id'],
            'attending_doctor_id' => ['nullable', Rule::exists('users', 'id')->where(fn ($query) => $query->where('status', UserStatus::Active->value))],
            'admission_reason' => ['required', 'string', 'max:6000'],
            'initial_condition' => ['nullable', 'string', 'max:6000'],
            'status' => ['nullable', Rule::in(['admitted', 'discharged', 'transferred', 'cancelled'])],
            'discharge_date' => ['nullable', 'date'],
            'discharge_summary' => ['nullable', 'string', 'max:8000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $doctorId = $this->input('attending_doctor_id');
            if (! filled($doctorId)) {
                return;
            }

            $isDoctor = User::query()
                ->whereKey($doctorId)
                ->role('Doctor / Consultant')
                ->exists();

            if (! $isDoctor) {
                $validator->errors()->add('attending_doctor_id', 'Selected user is not an active doctor.');
            }
        });
    }
}
