<?php

namespace App\Services;

use App\Enums\AssetStatus;
use App\Enums\PurchaseRequisitionStatus;
use App\Models\Asset;
use App\Models\Department;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\Patient;
use App\Models\PatientAdmission;
use App\Models\PatientDiagnosis;
use App\Models\PatientVisit;
use App\Models\PurchaseRequisition;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

class DashboardService
{
    public function build(User $user): array
    {
        if ($user->hasRole('Pharmacist / Medical Store Staff')) {
            return [
                'dashboard' => $this->buildPharmacistDashboard($user),
            ];
        }

        if ($user->hasRole('Receptionist')) {
            return [
                'dashboard' => $this->buildReceptionistDashboard($user),
            ];
        }

        if ($user->hasRole('Doctor / Consultant')) {
            return [
                'dashboard' => $this->buildDoctorDashboard($user),
            ];
        }

        return [
            'dashboard' => $this->buildOperationsDashboard($user),
        ];
    }

    protected function buildOperationsDashboard(User $user): array
    {
        $nearExpiryCutoff = now()->addDays((int) config('kort.inventory_near_expiry_days', 60));

        $totalAssets = Asset::query()->count();
        $activeInventoryItems = InventoryItem::query()->where('is_active', true)->count();
        $assetsUnderMaintenance = Asset::query()
            ->where('asset_status', AssetStatus::UnderMaintenance->value)
            ->count();
        $lowStockItems = InventoryItem::query()
            ->whereRaw('(current_quantity - reserved_quantity - damaged_quantity - quarantined_quantity - expired_quantity) <= reorder_level')
            ->count();
        $pendingRequisitions = PurchaseRequisition::query()
            ->whereIn('status', [
                PurchaseRequisitionStatus::Submitted->value,
                PurchaseRequisitionStatus::UnderReview->value,
            ])
            ->count();
        $nearExpiryBatches = InventoryBatch::query()
            ->whereNotNull('expiry_date')
            ->whereDate('expiry_date', '>=', now()->toDateString())
            ->whereDate('expiry_date', '<=', $nearExpiryCutoff->toDateString())
            ->where('available_quantity', '>', 0)
            ->count();

        $permissions = [
            'addAsset' => $user->can('asset.create'),
            'manageInventory' => $user->can('inventory-item.view'),
            'receiveStock' => $user->can('stock-receipt.create'),
            'createRequisition' => $user->can('requisition.create'),
            'receiveGoods' => $user->can('goods-receipt.create'),
            'scanAsset' => $user->can('asset.scan'),
            'viewAuditLogs' => $user->can('audit-logs.view'),
        ];

        return [
            'title' => 'Operations Dashboard',
            'description' => 'A focused overview of assets, inventory readiness, procurement attention points, and recent operational activity for hospital teams.',
            'visibility' => [
                'metrics' => true,
                'quickActions' => true,
                'recentActivity' => true,
                'alerts' => true,
                'chartCards' => true,
                'departmentReadiness' => true,
                'roleCoverage' => true,
            ],
            'metrics' => [
                [
                    'key' => 'totalAssets',
                    'label' => 'Total Assets',
                    'value' => $totalAssets,
                    'description' => 'Registered across the hospital estate',
                    'href' => route('assets.index'),
                    'tone' => 'primary',
                ],
                [
                    'key' => 'activeInventoryItems',
                    'label' => 'Active Inventory Items',
                    'value' => $activeInventoryItems,
                    'description' => 'Available in active stock records',
                    'href' => route('inventory.items.index'),
                    'tone' => 'info',
                ],
                [
                    'key' => 'assetsUnderMaintenance',
                    'label' => 'Under Maintenance',
                    'value' => $assetsUnderMaintenance,
                    'description' => 'Awaiting servicing or inspection',
                    'href' => route('assets.index', ['asset_status' => AssetStatus::UnderMaintenance->value]),
                    'tone' => 'warning',
                ],
                [
                    'key' => 'lowStockItems',
                    'label' => 'Low Stock Items',
                    'value' => $lowStockItems,
                    'description' => 'At or below reorder thresholds',
                    'href' => route('inventory.items.index', ['low_stock' => 'yes']),
                    'tone' => 'warning',
                ],
                [
                    'key' => 'pendingRequisitions',
                    'label' => 'Pending Requisitions',
                    'value' => $pendingRequisitions,
                    'description' => 'Submitted and under review',
                    'href' => route('procurement.requisitions.index', ['status' => PurchaseRequisitionStatus::Submitted->value]),
                    'tone' => 'success',
                ],
            ],
            'quickActions' => collect([
                [
                    'key' => 'addAsset',
                    'label' => 'Add New Asset',
                    'description' => 'Register a newly procured or deployed asset.',
                    'href' => route('assets.create'),
                    'permission' => 'asset.create',
                    'enabled' => $permissions['addAsset'],
                ],
                [
                    'key' => 'manageInventory',
                    'label' => 'Manage Inventory',
                    'description' => 'Review inventory items, levels, and operational stock records.',
                    'href' => route('inventory.items.index'),
                    'permission' => 'inventory-item.view',
                    'enabled' => $permissions['manageInventory'],
                ],
                [
                    'key' => 'receiveStock',
                    'label' => 'Receive Stock',
                    'description' => 'Record newly received inventory quantities and batch details.',
                    'href' => route('inventory.receipts.create'),
                    'permission' => 'stock-receipt.create',
                    'enabled' => $permissions['receiveStock'],
                ],
                [
                    'key' => 'createRequisition',
                    'label' => 'Create Requisition',
                    'description' => 'Open a new requisition for asset or inventory demand.',
                    'href' => route('procurement.requisitions.create'),
                    'permission' => 'requisition.create',
                    'enabled' => $permissions['createRequisition'],
                ],
                [
                    'key' => 'receiveGoods',
                    'label' => 'Receive Goods',
                    'description' => 'Create a goods receipt note for procurement deliveries.',
                    'href' => route('procurement.goods-receipts.create'),
                    'permission' => 'goods-receipt.create',
                    'enabled' => $permissions['receiveGoods'],
                ],
                [
                    'key' => 'scanAsset',
                    'label' => 'Scan Asset',
                    'description' => 'Open barcode or QR search for fast operational lookup.',
                    'href' => route('assets.scan.index'),
                    'permission' => 'asset.scan',
                    'enabled' => $permissions['scanAsset'],
                ],
                [
                    'key' => 'viewAuditLogs',
                    'label' => 'View Audit Logs',
                    'description' => 'Review traceable activity and compliance-oriented updates.',
                    'href' => route('security.audit-logs.index'),
                    'permission' => 'audit-logs.view',
                    'enabled' => $permissions['viewAuditLogs'],
                ],
            ])->filter(fn (array $action) => $action['enabled'])->values()->all(),
            'alerts' => [
                [
                    'key' => 'lowStockItems',
                    'label' => 'Low stock items need replenishment',
                    'count' => $lowStockItems,
                    'description' => 'Inventory lines have reached or dropped below reorder levels.',
                    'href' => route('inventory.items.index', ['low_stock' => 'yes']),
                    'tone' => $lowStockItems > 0 ? 'warning' : 'success',
                    'statusLabel' => $lowStockItems > 0 ? 'Action needed' : 'Stable',
                ],
                [
                    'key' => 'nearExpiryBatches',
                    'label' => 'Batches nearing expiry',
                    'count' => $nearExpiryBatches,
                    'description' => 'Active batches are approaching the configured near-expiry window.',
                    'href' => route('inventory.items.index', ['near_expiry' => 'yes']),
                    'tone' => $nearExpiryBatches > 0 ? 'warning' : 'info',
                    'statusLabel' => $nearExpiryBatches > 0 ? 'Review soon' : 'Clear',
                ],
                [
                    'key' => 'pendingRequisitions',
                    'label' => 'Requisitions awaiting attention',
                    'count' => $pendingRequisitions,
                    'description' => 'Submitted requisitions remain in review or approval queues.',
                    'href' => route('procurement.requisitions.index', ['status' => PurchaseRequisitionStatus::Submitted->value]),
                    'tone' => $pendingRequisitions > 0 ? 'primary' : 'success',
                    'statusLabel' => $pendingRequisitions > 0 ? 'Review queue' : 'Up to date',
                ],
                [
                    'key' => 'assetsUnderMaintenance',
                    'label' => 'Assets under maintenance',
                    'count' => $assetsUnderMaintenance,
                    'description' => 'Equipment currently marked as unavailable for routine operations.',
                    'href' => route('assets.index', ['asset_status' => AssetStatus::UnderMaintenance->value]),
                    'tone' => $assetsUnderMaintenance > 0 ? 'danger' : 'success',
                    'statusLabel' => $assetsUnderMaintenance > 0 ? 'Monitor' : 'Stable',
                ],
            ],
            'recentActivity' => Activity::query()
                ->with('causer')
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (Activity $activity) => [
                    'description' => str($activity->description)->headline()->toString(),
                    'event' => $activity->event,
                    'causerName' => $activity->causer?->name ?? 'System',
                    'createdAt' => $activity->created_at?->toDateTimeString(),
                ])
                ->values()
                ->all(),
            'departments' => Department::query()
                ->withCount(['locations', 'users'])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn (Department $department) => [
                    'name' => $department->name,
                    'code' => $department->code,
                    'usersCount' => $department->users_count,
                    'locationsCount' => $department->locations_count,
                    'isClinical' => $department->is_clinical,
                ])
                ->values()
                ->all(),
            'roleCoverage' => Role::query()
                ->withCount('users')
                ->orderBy('name')
                ->get()
                ->map(fn (Role $role) => [
                    'name' => $role->name,
                    'usersCount' => $role->users_count,
                    'permissionsCount' => $role->permissions()->count(),
                ])
                ->values()
                ->all(),
            'chartCards' => [
                [
                    'key' => 'assetDistribution',
                    'title' => 'Asset distribution',
                    'description' => 'Reserved for category and location-based asset summaries in a later phase.',
                    'emptyTitle' => 'Chart shell ready',
                    'emptyDescription' => 'Phase B prepares this card for live chart data without inventing operational trends.',
                ],
                [
                    'key' => 'procurementTrends',
                    'title' => 'Procurement trends',
                    'description' => 'Reserved for requisition and receipt movement over time once chart series are added.',
                    'emptyTitle' => 'Trend card prepared',
                    'emptyDescription' => 'The layout is ready for future requisition and goods receipt visualizations.',
                ],
            ],
            'permissions' => $permissions,
        ];
    }

    protected function buildDoctorDashboard(User $user): array
    {
        $assignedPatients = Patient::query()->where('assigned_doctor_id', $user->id)->count();
        $pendingVisits = PatientVisit::query()
            ->where('doctor_id', $user->id)
            ->whereDoesntHave('diagnoses')
            ->count();
        $activeAdmissions = PatientAdmission::query()
            ->where('attending_doctor_id', $user->id)
            ->where('status', 'admitted')
            ->count();
        $todayDiagnoses = PatientDiagnosis::query()
            ->where('doctor_id', $user->id)
            ->whereDate('created_at', now()->toDateString())
            ->count();

        return [
            'title' => 'Doctor Dashboard',
            'description' => 'Assigned patients, queue load, and diagnosis workflow updates for your clinical desk.',
            'visibility' => [
                'metrics' => true,
                'quickActions' => true,
                'recentActivity' => true,
                'alerts' => true,
                'chartCards' => false,
                'departmentReadiness' => false,
                'roleCoverage' => false,
            ],
            'metrics' => [
                [
                    'key' => 'assignedPatients',
                    'label' => 'Assigned Patients',
                    'value' => $assignedPatients,
                    'description' => 'Currently mapped to your care',
                    'href' => route('patients.index'),
                    'tone' => 'primary',
                ],
                [
                    'key' => 'pendingVisits',
                    'label' => 'Pending Visits',
                    'value' => $pendingVisits,
                    'description' => 'Visits waiting for diagnosis',
                    'href' => route('patients.queue'),
                    'tone' => 'warning',
                ],
                [
                    'key' => 'activeAdmissions',
                    'label' => 'Active Admissions',
                    'value' => $activeAdmissions,
                    'description' => 'Admitted patients under your care',
                    'href' => route('patients.queue'),
                    'tone' => 'info',
                ],
                [
                    'key' => 'todayDiagnoses',
                    'label' => 'Diagnoses Today',
                    'value' => $todayDiagnoses,
                    'description' => 'Diagnoses recorded in this shift',
                    'href' => route('patients.index'),
                    'tone' => 'success',
                ],
            ],
            'quickActions' => [
                [
                    'key' => 'openDoctorQueue',
                    'label' => 'Open Doctor Queue',
                    'description' => 'Start with patients waiting in your queue.',
                    'href' => route('patients.queue'),
                    'permission' => 'patient-visit.view',
                    'enabled' => true,
                ],
                [
                    'key' => 'openPatientRecords',
                    'label' => 'Open Patient Records',
                    'description' => 'Review assigned patients and previous visits.',
                    'href' => route('patients.index'),
                    'permission' => 'patient.view',
                    'enabled' => true,
                ],
            ],
            'alerts' => [
                [
                    'key' => 'pendingVisits',
                    'label' => 'Visits waiting for assessment',
                    'count' => $pendingVisits,
                    'description' => 'Patients assigned to you are waiting for diagnosis or follow-up notes.',
                    'href' => route('patients.queue'),
                    'tone' => $pendingVisits > 0 ? 'warning' : 'success',
                    'statusLabel' => $pendingVisits > 0 ? 'Review queue' : 'Up to date',
                ],
                [
                    'key' => 'activeAdmissions',
                    'label' => 'Admitted patients under your care',
                    'count' => $activeAdmissions,
                    'description' => 'Monitor admitted cases to keep daily treatment plans current.',
                    'href' => route('patients.queue'),
                    'tone' => $activeAdmissions > 0 ? 'primary' : 'info',
                    'statusLabel' => $activeAdmissions > 0 ? 'Active caseload' : 'No admitted load',
                ],
            ],
            'recentActivity' => Activity::query()
                ->with('causer')
                ->where('log_name', 'patients')
                ->where(function ($query) use ($user) {
                    $query
                        ->where('causer_id', $user->id)
                        ->orWhere('properties', 'like', '%"assigned_doctor_id":'.$user->id.'%')
                        ->orWhere('properties', 'like', '%"new_assigned_doctor_id":'.$user->id.'%')
                        ->orWhere('properties', 'like', '%"new_doctor_id":'.$user->id.'%')
                        ->orWhere('properties', 'like', '%"attending_doctor_id":'.$user->id.'%');
                })
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (Activity $activity) => [
                    'description' => str($activity->description)->headline()->toString(),
                    'event' => $activity->event,
                    'causerName' => $activity->causer?->name ?? 'System',
                    'createdAt' => $activity->created_at?->toDateTimeString(),
                ])
                ->values()
                ->all(),
            'departments' => [],
            'roleCoverage' => [],
            'chartCards' => [],
            'permissions' => [
                'addAsset' => false,
                'manageInventory' => false,
                'receiveStock' => false,
                'createRequisition' => false,
                'receiveGoods' => false,
                'scanAsset' => false,
                'viewAuditLogs' => false,
            ],
        ];
    }

    protected function buildReceptionistDashboard(User $user): array
    {
        return [
            'title' => 'Reception Desk',
            'description' => 'Register new patients, book doctor visits, and print patient reports.',
            'visibility' => [
                'metrics' => false,
                'quickActions' => true,
                'recentActivity' => false,
                'alerts' => false,
                'chartCards' => false,
                'departmentReadiness' => false,
                'roleCoverage' => false,
            ],
            'metrics' => [],
            'quickActions' => [
                [
                    'key' => 'receptionAddPatient',
                    'label' => 'Add New Patient',
                    'description' => 'Register a new patient with demographics and contact details.',
                    'href' => route('patients.create'),
                    'permission' => 'patient.create',
                    'enabled' => $user->can('patient.create'),
                ],
                [
                    'key' => 'receptionBookVisit',
                    'label' => 'Book Doctor Visit',
                    'description' => 'Assign patient checkup type and doctor queue visit.',
                    'href' => route('patients.index'),
                    'permission' => 'patient.assign-doctor',
                    'enabled' => $user->can('patient.assign-doctor'),
                ],
                [
                    'key' => 'receptionPrintReports',
                    'label' => 'Print Patient Reports',
                    'description' => 'Open patient records and print available prescription/report sheets.',
                    'href' => route('patients.index'),
                    'permission' => 'patient-prescription.print',
                    'enabled' => $user->can('patient-prescription.print'),
                ],
            ],
            'alerts' => [],
            'recentActivity' => [],
            'departments' => [],
            'roleCoverage' => [],
            'chartCards' => [],
            'permissions' => [
                'addAsset' => false,
                'manageInventory' => false,
                'receiveStock' => false,
                'createRequisition' => false,
                'receiveGoods' => false,
                'scanAsset' => false,
                'viewAuditLogs' => false,
            ],
        ];
    }

    protected function buildPharmacistDashboard(User $user): array
    {
        return [
            'title' => 'Pharmacy Dashboard',
            'description' => 'Dispense medicines against doctor prescriptions and check medicine stock availability.',
            'visibility' => [
                'metrics' => false,
                'quickActions' => true,
                'recentActivity' => false,
                'alerts' => false,
                'chartCards' => false,
                'departmentReadiness' => false,
                'roleCoverage' => false,
            ],
            'metrics' => [],
            'quickActions' => [
                [
                    'key' => 'pharmacyLookup',
                    'label' => 'Search Patient Prescription',
                    'description' => 'Open pharmacy lookup by CNIC, patient number, or prescription number.',
                    'href' => route('pharmacy.lookup'),
                    'permission' => 'pharmacy.patient-search',
                    'enabled' => true,
                ],
                [
                    'key' => 'pharmacyMedicineSearch',
                    'label' => 'Search Medicine Stock',
                    'description' => 'Check medicine availability by name or code before dispensing.',
                    'href' => route('pharmacy.lookup'),
                    'permission' => 'inventory-medicine.view-available-only',
                    'enabled' => true,
                ],
            ],
            'alerts' => [],
            'recentActivity' => [],
            'departments' => [],
            'roleCoverage' => [],
            'chartCards' => [],
            'permissions' => [
                'addAsset' => false,
                'manageInventory' => false,
                'receiveStock' => false,
                'createRequisition' => false,
                'receiveGoods' => false,
                'scanAsset' => false,
                'viewAuditLogs' => false,
            ],
        ];
    }
}
