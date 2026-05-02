<?php

namespace App\Http\Requests\Patients;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $patientId = $this->route('patient')?->id;

        return [
            'patient_number' => ['prohibited'],
            'cnic' => ['nullable', 'string', 'regex:/^(\d{5}-\d{7}-\d{1}|\d{13})$/', Rule::unique('patients', 'cnic')->ignore($patientId)],
            'full_name' => ['required', 'string', 'max:160'],
            'father_name' => ['nullable', 'string', 'max:160'],
            'gender' => ['required', 'string', Rule::in(['male', 'female', 'other'])],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'age' => ['nullable', 'integer', 'min:0', 'max:140'],
            'phone' => ['nullable', 'string', 'max:25'],
            'emergency_contact' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:5000'],
            'blood_group' => ['nullable', 'string', 'max:10'],
            'allergies' => ['nullable', 'string', 'max:5000'],
            'medical_history' => ['nullable', 'string', 'max:15000'],
            'photo' => ['nullable', 'image', 'max:4096', 'mimes:jpg,jpeg,png,webp'],
            'assigned_doctor_id' => [
                'nullable',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('status', UserStatus::Active->value)),
            ],
            'department_id' => ['nullable', 'exists:departments,id'],
            'checkup_type' => ['nullable', 'string', Rule::in(['opd', 'emergency', 'admitted_followup'])],
            'chief_complaint' => ['nullable', 'string', 'max:5000'],
            'visit_date' => ['nullable', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $assignedDoctorId = $this->input('assigned_doctor_id');
            $checkupType = $this->input('checkup_type');
            $chiefComplaint = trim((string) $this->input('chief_complaint', ''));

            if (filled($checkupType) && ! filled($assignedDoctorId)) {
                $validator->errors()->add('assigned_doctor_id', 'Select a doctor for the selected checkup type.');
            }

            if (filled($assignedDoctorId) && blank($checkupType)) {
                $validator->errors()->add('checkup_type', 'Select checkup type when assigning a doctor.');
            }

            if (filled($assignedDoctorId) && $chiefComplaint === '') {
                $validator->errors()->add('chief_complaint', 'Chief complaint is required when assigning doctor.');
            }

            if (! filled($assignedDoctorId)) {
                return;
            }

            $isDoctor = User::query()
                ->whereKey($assignedDoctorId)
                ->role('Doctor / Consultant')
                ->exists();

            if (! $isDoctor) {
                $validator->errors()->add('assigned_doctor_id', 'Selected user is not an active doctor.');
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $cnic = trim((string) $this->input('cnic', ''));
        if ($cnic !== '') {
            $digits = preg_replace('/\D+/', '', $cnic);
            if (strlen((string) $digits) === 13) {
                $cnic = substr($digits, 0, 5).'-'.substr($digits, 5, 7).'-'.substr($digits, 12, 1);
            }
        } else {
            $cnic = null;
        }

        $this->merge([
            'cnic' => $cnic,
            'assigned_doctor_id' => $this->filled('assigned_doctor_id') ? (int) $this->input('assigned_doctor_id') : null,
            'department_id' => $this->filled('department_id') ? (int) $this->input('department_id') : null,
            'checkup_type' => $this->filled('checkup_type') ? (string) $this->input('checkup_type') : null,
            'chief_complaint' => $this->filled('chief_complaint') ? (string) $this->input('chief_complaint') : null,
            'visit_date' => $this->filled('visit_date') ? (string) $this->input('visit_date') : null,
        ]);
    }
}
