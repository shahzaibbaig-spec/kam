<?php

namespace App\Http\Requests\Patients;

use Illuminate\Foundation\Http\FormRequest;

class PatientDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'visit_id' => ['nullable', 'exists:patient_visits,id'],
            'file' => ['required', 'file', 'max:10240'],
            'notes' => ['nullable', 'string', 'max:3000'],
        ];
    }
}
