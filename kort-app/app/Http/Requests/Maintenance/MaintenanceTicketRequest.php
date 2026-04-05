<?php

namespace App\Http\Requests\Maintenance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MaintenanceTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return ($this->user()?->can('maintenance.manage') ?? false) || ($this->user()?->can('faults.report') ?? false);
    }

    public function rules(): array
    {
        $ticketId = $this->route('ticket')?->id;

        return [
            'asset_id' => ['required', 'exists:assets,id'],
            'reported_by_id' => ['nullable', 'exists:users,id'],
            'engineer_id' => ['nullable', 'exists:users,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'ticket_number' => ['nullable', 'string', 'max:50', Rule::unique('asset_maintenances', 'ticket_number')->ignore($ticketId)],
            'maintenance_type' => ['required', 'string', Rule::in(['corrective', 'preventive', 'calibration', 'inspection', 'breakdown', 'warranty'])],
            'status' => ['required', 'string', Rule::in(['open', 'assigned', 'in_progress', 'awaiting_parts', 'completed', 'closed'])],
            'fault_report' => ['nullable', 'string'],
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'downtime_minutes' => ['nullable', 'integer', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'spare_parts_used' => ['nullable', 'array'],
            'spare_parts_used.*' => ['nullable', 'string', 'max:255'],
            'resolution_notes' => ['nullable', 'string'],
            'fit_status' => ['nullable', 'string', Rule::in(['fit_for_use', 'unfit_for_use', 'conditional'])],
            'warranty_claim' => ['nullable', 'boolean'],
        ];
    }
}
