<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\PharmacyDispensingItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PharmacyReportController extends Controller
{
    public function index(Request $request): Response|StreamedResponse
    {
        abort_unless($request->user()?->can('pharmacy-report.view'), 403);

        $period = (string) $request->query('period', 'daily');
        $this->authorizePeriodPermission($request, $period);

        [$dateFrom, $dateTo] = $this->resolveDateWindow($request, $period);
        $filters = [
            'period' => $period,
            'date_from' => $dateFrom->toDateString(),
            'date_to' => $dateTo->toDateString(),
            'medicine' => trim((string) $request->query('medicine', '')),
            'patient' => trim((string) $request->query('patient', '')),
            'doctor' => trim((string) $request->query('doctor', '')),
            'pharmacist' => trim((string) $request->query('pharmacist', '')),
            'department' => trim((string) $request->query('department', '')),
            'batch_number' => trim((string) $request->query('batch_number', '')),
        ];

        $query = PharmacyDispensingItem::query()
            ->with([
                'dispensing.patient',
                'dispensing.pharmacist',
                'dispensing.prescription.visit.doctor',
                'inventoryItem',
                'batch',
            ])
            ->whereHas('dispensing', fn (Builder $builder) => $builder
                ->whereDate('dispensed_at', '>=', $filters['date_from'])
                ->whereDate('dispensed_at', '<=', $filters['date_to']));

        $this->applyFilters($query, $filters);

        $rows = $query->orderByDesc('id')->get();

        $summary = [
            'total_dispensed_quantity' => (float) $rows->sum('dispensed_quantity'),
            'total_records' => $rows->count(),
            'patients_covered' => $rows->pluck('dispensing.patient_id')->filter()->unique()->count(),
            'medicines_covered' => $rows->pluck('inventory_item_id')->filter()->unique()->count(),
        ];

        $medicineUsage = $rows
            ->groupBy(fn ($row) => $row->inventoryItem?->item_name ?: $row->prescriptionItem?->medicine_name ?: 'Unknown')
            ->map(fn ($group, $medicineName) => [
                'medicine_name' => $medicineName,
                'dispensed_quantity' => (float) $group->sum('dispensed_quantity'),
                'dispensing_count' => $group->count(),
            ])
            ->sortByDesc('dispensed_quantity')
            ->values()
            ->all();

        $export = (string) $request->query('export', '');
        if ($export !== '') {
            abort_unless($request->user()?->can('pharmacy-report.export'), 403);

            if ($export === 'csv') {
                return $this->exportCsv($rows, $filters['period']);
            }

            if ($export === 'pdf') {
                return Pdf::loadView('print.pharmacy-report', [
                    'filters' => $filters,
                    'summary' => $summary,
                    'rows' => $rows,
                    'generatedAt' => now(),
                    'generatedBy' => $request->user(),
                ])->download('pharmacy-report-'.$filters['period'].'-'.$filters['date_from'].'-to-'.$filters['date_to'].'.pdf');
            }
        }

        return Inertia::render('Pharmacy/Reports/Index', [
            'filters' => $filters,
            'summary' => $summary,
            'medicineUsage' => $medicineUsage,
            'rows' => $rows->map(fn ($row) => [
                'id' => $row->id,
                'dispensed_at' => $row->dispensing?->dispensed_at?->toDateTimeString(),
                'patient_name' => $row->dispensing?->patient?->full_name,
                'patient_number' => $row->dispensing?->patient?->patient_number,
                'prescription_number' => $row->dispensing?->prescription?->prescription_number,
                'doctor_name' => $row->dispensing?->prescription?->visit?->doctor?->name,
                'pharmacist_name' => $row->dispensing?->pharmacist?->name,
                'medicine_name' => $row->inventoryItem?->item_name ?: $row->prescriptionItem?->medicine_name,
                'batch_number' => $row->batch_number,
                'expiry_date' => $row->expiry_date?->toDateString(),
                'dispensed_quantity' => $row->dispensed_quantity,
                'unit_of_measure' => $row->unit_of_measure,
            ])->values()->all(),
            'can' => [
                'export' => $request->user()?->can('pharmacy-report.export') ?? false,
            ],
        ]);
    }

    protected function authorizePeriodPermission(Request $request, string $period): void
    {
        $permission = match ($period) {
            'weekly' => 'pharmacy-report.weekly',
            'monthly' => 'pharmacy-report.monthly',
            'quarterly' => 'pharmacy-report.quarterly',
            'yearly' => 'pharmacy-report.yearly',
            default => 'pharmacy-report.daily',
        };

        abort_unless($request->user()?->can($permission), 403);
    }

    protected function resolveDateWindow(Request $request, string $period): array
    {
        $defaultFrom = match ($period) {
            'weekly' => now()->startOfWeek(),
            'monthly' => now()->startOfMonth(),
            'quarterly' => now()->startOfQuarter(),
            'yearly' => now()->startOfYear(),
            default => now()->startOfDay(),
        };

        $defaultTo = match ($period) {
            'weekly' => now()->endOfWeek(),
            'monthly' => now()->endOfMonth(),
            'quarterly' => now()->endOfQuarter(),
            'yearly' => now()->endOfYear(),
            default => now()->endOfDay(),
        };

        $dateFrom = $request->filled('date_from') ? Carbon::parse((string) $request->query('date_from'))->startOfDay() : $defaultFrom;
        $dateTo = $request->filled('date_to') ? Carbon::parse((string) $request->query('date_to'))->endOfDay() : $defaultTo;

        return [$dateFrom, $dateTo];
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['medicine'] !== '') {
            $query->where(function (Builder $builder) use ($filters) {
                $builder
                    ->whereHas('inventoryItem', fn (Builder $inventoryQuery) => $inventoryQuery->where('item_name', 'like', '%'.$filters['medicine'].'%'))
                    ->orWhereHas('prescriptionItem', fn (Builder $itemQuery) => $itemQuery->where('medicine_name', 'like', '%'.$filters['medicine'].'%'));
            });
        }

        if ($filters['patient'] !== '') {
            $query->whereHas('dispensing.patient', fn (Builder $builder) => $builder
                ->where('full_name', 'like', '%'.$filters['patient'].'%')
                ->orWhere('patient_number', 'like', '%'.$filters['patient'].'%')
                ->orWhere('cnic', 'like', '%'.$filters['patient'].'%'));
        }

        if ($filters['doctor'] !== '') {
            $query->whereHas('dispensing.prescription.visit.doctor', fn (Builder $builder) => $builder->where('name', 'like', '%'.$filters['doctor'].'%'));
        }

        if ($filters['pharmacist'] !== '') {
            $query->whereHas('dispensing.pharmacist', fn (Builder $builder) => $builder->where('name', 'like', '%'.$filters['pharmacist'].'%'));
        }

        if ($filters['department'] !== '') {
            $query->whereHas('dispensing.prescription.visit.doctor.department', fn (Builder $builder) => $builder->where('name', 'like', '%'.$filters['department'].'%'));
        }

        if ($filters['batch_number'] !== '') {
            $query->where('batch_number', 'like', '%'.$filters['batch_number'].'%');
        }
    }

    protected function exportCsv($rows, string $period): StreamedResponse
    {
        $filename = 'pharmacy-report-'.$period.'-'.now()->format('YmdHis').'.csv';

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Dispensed At',
                'Patient',
                'Patient Number',
                'Prescription',
                'Doctor',
                'Pharmacist',
                'Medicine',
                'Batch',
                'Expiry',
                'Quantity',
                'Unit',
            ]);

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->dispensing?->dispensed_at?->toDateTimeString(),
                    $row->dispensing?->patient?->full_name,
                    $row->dispensing?->patient?->patient_number,
                    $row->dispensing?->prescription?->prescription_number,
                    $row->dispensing?->prescription?->visit?->doctor?->name,
                    $row->dispensing?->pharmacist?->name,
                    $row->inventoryItem?->item_name ?: $row->prescriptionItem?->medicine_name,
                    $row->batch_number,
                    $row->expiry_date?->toDateString(),
                    $row->dispensed_quantity,
                    $row->unit_of_measure,
                ]);
            }

            fclose($handle);
        }, $filename);
    }
}

