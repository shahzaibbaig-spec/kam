<?php

namespace App\Services;

use App\Models\PatientAdmission;
use App\Models\Patient;
use App\Models\PatientPrescription;
use App\Models\PatientVisit;
use Illuminate\Support\Facades\DB;

class PatientNumberService
{
    public function generatePatientNumber(): string
    {
        return DB::transaction(function (): string {
            $year = now()->format('Y');
            $prefix = "KORT-PAT-{$year}-";

            $latest = Patient::query()
                ->where('patient_number', 'like', $prefix.'%')
                ->orderByDesc('id')
                ->lockForUpdate()
                ->value('patient_number');

            $lastSequence = 0;
            if (is_string($latest) && preg_match('/^KORT-PAT-\d{4}-(\d{6})$/', $latest, $matches)) {
                $lastSequence = (int) $matches[1];
            }

            $next = $lastSequence + 1;

            // Sequence intentionally resets each year by design.
            return $prefix.str_pad((string) $next, 6, '0', STR_PAD_LEFT);
        });
    }

    public function generateAdmissionNumber(): string
    {
        $prefix = 'ADM-'.now()->format('Ymd');
        $next = PatientAdmission::query()
            ->where('admission_number', 'like', $prefix.'-%')
            ->count() + 1;

        return $prefix.'-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function generateVisitNumber(): string
    {
        $prefix = 'VIS-'.now()->format('Ymd');
        $next = PatientVisit::query()
            ->where('visit_number', 'like', $prefix.'-%')
            ->count() + 1;

        return $prefix.'-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function generatePrescriptionNumber(): string
    {
        $prefix = 'RX-'.now()->format('Ymd');
        $next = PatientPrescription::query()
            ->where('prescription_number', 'like', $prefix.'-%')
            ->count() + 1;

        return $prefix.'-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
