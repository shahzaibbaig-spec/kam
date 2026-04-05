<?php

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RequisitionApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return ($this->user()?->can('requisition.approve') ?? false)
            || ($this->user()?->can('requisition.reject') ?? false);
    }

    public function rules(): array
    {
        return [
            'action' => ['required', Rule::in(['approve', 'reject'])],
            'comments' => ['nullable', 'string', 'max:5000'],
            'reason' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->input('action') === 'reject' && blank($this->input('reason'))) {
                $validator->errors()->add('reason', 'A rejection reason is required.');
            }
        });
    }
}
