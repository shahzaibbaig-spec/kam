<?php

use App\Http\Controllers\Administration\RoleController;
use App\Http\Controllers\Administration\UserController;
use App\Http\Controllers\Assets\AssetCategoryController;
use App\Http\Controllers\Assets\AssetController;
use App\Http\Controllers\Assets\AssetIssueController;
use App\Http\Controllers\Assets\AssetLabelController;
use App\Http\Controllers\Assets\AssetReturnController;
use App\Http\Controllers\Assets\AssetScanController;
use App\Http\Controllers\Assets\AssetStatusController;
use App\Http\Controllers\Assets\AssetTagController;
use App\Http\Controllers\Assets\AssetTransferController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Inventory\InventoryCategoryController;
use App\Http\Controllers\Inventory\InventoryItemController;
use App\Http\Controllers\Inventory\InventoryLedgerController;
use App\Http\Controllers\Inventory\InventoryScanController;
use App\Http\Controllers\Inventory\StockAdjustmentController;
use App\Http\Controllers\Inventory\StockIssueController;
use App\Http\Controllers\Inventory\StockReceiptController;
use App\Http\Controllers\Inventory\StockReturnController;
use App\Http\Controllers\Inventory\StockTransferController;
use App\Http\Controllers\Maintenance\MaintenanceController;
use App\Http\Controllers\Organization\DepartmentController;
use App\Http\Controllers\Organization\LocationController;
use App\Http\Controllers\Pharmacy\DispensingController;
use App\Http\Controllers\Pharmacy\PharmacyReportController;
use App\Http\Controllers\Pharmacy\PrescriptionLookupController;
use App\Http\Controllers\Patients\PatientAdmissionController;
use App\Http\Controllers\Patients\PatientController;
use App\Http\Controllers\Patients\PatientDiagnosisController;
use App\Http\Controllers\Patients\PatientPrescriptionController;
use App\Http\Controllers\Patients\PatientVisitController;
use App\Http\Controllers\Procurement\GoodsReceiptController;
use App\Http\Controllers\Procurement\ProcurementApprovalController;
use App\Http\Controllers\Procurement\PurchaseOrderController;
use App\Http\Controllers\Procurement\PurchaseRequisitionController;
use App\Http\Controllers\Procurement\SupplierController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Search\UniversalSearchController;
use App\Http\Controllers\Security\AuditLogController;
use App\Http\Controllers\Settings\SettingsController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/search/universal', UniversalSearchController::class)->name('search.universal');
    Route::get('/search/medicines', [PatientPrescriptionController::class, 'searchMedicines'])->name('search.medicines');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class)->except('show');
        Route::resource('roles', RoleController::class)->except(['show', 'destroy']);
    });

    Route::prefix('organization')->name('organization.')->group(function () {
        Route::resource('departments', DepartmentController::class)->except('show');
        Route::resource('locations', LocationController::class)->except('show');
    });

    Route::prefix('assets')->name('assets.')->group(function () {
        Route::get('scan', [AssetScanController::class, 'index'])->name('scan.index');
        Route::get('scan/lookup', [AssetScanController::class, 'lookup'])->name('scan.lookup');
        Route::resource('categories', AssetCategoryController::class)->except('show');
        Route::post('tags/bulk-generate', [AssetTagController::class, 'bulkGenerate'])->name('tags.bulk-generate');
        Route::get('labels/bulk-print/browser', [AssetTagController::class, 'bulkPrint'])->name('labels.bulk-print.browser');
        Route::get('labels/bulk-print', [AssetLabelController::class, 'bulkPreview'])->name('labels.bulk-print');
        Route::get('labels/bulk-print/tspl', [AssetLabelController::class, 'bulkTspl'])->name('labels.bulk-print.tspl');
        Route::get('labels/bulk-print/direct', [AssetLabelController::class, 'bulkDirect'])->name('labels.bulk-print.direct');
        Route::get('labels/reprint/{printLog}', [AssetLabelController::class, 'reprint'])->name('labels.reprint');
        Route::get('labels/reprint/{printLog}/direct', [AssetLabelController::class, 'reprintDirect'])->name('labels.reprint.direct');
        Route::get('{asset}/tags/generate', [AssetTagController::class, 'create'])->name('tags.create');
        Route::post('{asset}/tags', [AssetTagController::class, 'store'])->name('tags.store');
        Route::get('{asset}/labels/print/browser', [AssetTagController::class, 'showLabel'])->name('labels.browser-print');
        Route::get('{asset}/labels/print', [AssetLabelController::class, 'show'])->name('labels.show');
        Route::get('{asset}/labels/print/tspl', [AssetLabelController::class, 'tspl'])->name('labels.tspl');
        Route::get('{asset}/labels/print/direct', [AssetLabelController::class, 'direct'])->name('labels.direct');
        Route::get('{asset}/issue', [AssetIssueController::class, 'create'])->name('issue.create');
        Route::post('{asset}/issue', [AssetIssueController::class, 'store'])->name('issue.store');
        Route::get('{asset}/return', [AssetReturnController::class, 'create'])->name('return.create');
        Route::post('{asset}/return', [AssetReturnController::class, 'store'])->name('return.store');
        Route::get('{asset}/transfer', [AssetTransferController::class, 'create'])->name('transfer.create');
        Route::post('{asset}/transfer', [AssetTransferController::class, 'store'])->name('transfer.store');
        Route::get('{asset}/status', [AssetStatusController::class, 'create'])->name('status.create');
        Route::post('{asset}/status', [AssetStatusController::class, 'store'])->name('status.store');
    });

    Route::resource('assets', AssetController::class);

    Route::prefix('patients')->name('patients.')->group(function () {
        Route::get('search', [PatientController::class, 'search'])->name('search');
        Route::get('queue', [PatientController::class, 'queue'])->name('queue');
        Route::get('{patient}/history', [PatientController::class, 'history'])->name('history');
        Route::post('{patient}/documents', [PatientController::class, 'uploadDocument'])->name('documents.store');

        Route::get('{patient}/admissions/create', [PatientAdmissionController::class, 'create'])->name('admissions.create');
        Route::post('{patient}/admissions', [PatientAdmissionController::class, 'store'])->name('admissions.store');
        Route::get('{patient}/admissions/{admission}', [PatientAdmissionController::class, 'show'])->name('admissions.show');
        Route::match(['put', 'patch'], '{patient}/admissions/{admission}', [PatientAdmissionController::class, 'update'])->name('admissions.update');
        Route::post('{patient}/admissions/{admission}/discharge', [PatientAdmissionController::class, 'discharge'])->name('admissions.discharge');
        Route::post('{patient}/admissions/{admission}/change-doctor', [PatientAdmissionController::class, 'changeDoctor'])->name('admissions.change-doctor');

        Route::get('{patient}/diagnoses/create', [PatientDiagnosisController::class, 'create'])->name('diagnoses.create');
        Route::post('{patient}/diagnoses', [PatientDiagnosisController::class, 'store'])->name('diagnoses.store');
        Route::get('{patient}/diagnoses/{diagnosis}/edit', [PatientDiagnosisController::class, 'edit'])->name('diagnoses.edit');
        Route::match(['put', 'patch'], '{patient}/diagnoses/{diagnosis}', [PatientDiagnosisController::class, 'update'])->name('diagnoses.update');

        Route::post('{patient}/visits', [PatientVisitController::class, 'store'])->name('visits.store');
        Route::match(['put', 'patch'], '{patient}/visits/{visit}', [PatientVisitController::class, 'update'])->name('visits.update');
        Route::post('{patient}/visits/{visit}/change-doctor', [PatientVisitController::class, 'changeDoctor'])->name('visits.change-doctor');

        Route::get('{patient}/visits/{visit}/prescriptions/create', [PatientPrescriptionController::class, 'create'])->name('prescriptions.create');
        Route::post('{patient}/visits/{visit}/prescriptions', [PatientPrescriptionController::class, 'store'])->name('prescriptions.store');
        Route::get('{patient}/prescriptions/{prescription}/edit', [PatientPrescriptionController::class, 'edit'])->name('prescriptions.edit');
        Route::match(['put', 'patch'], '{patient}/prescriptions/{prescription}', [PatientPrescriptionController::class, 'update'])->name('prescriptions.update');
        Route::get('{patient}/prescriptions/{prescription}', [PatientPrescriptionController::class, 'show'])->name('prescriptions.show');
        Route::get('{patient}/prescriptions/{prescription}/print', [PatientPrescriptionController::class, 'print'])->name('prescriptions.print');
        Route::get('{patient}/prescriptions/{prescription}/pdf', [PatientPrescriptionController::class, 'pdf'])->name('prescriptions.pdf');
    });

    Route::resource('patients', PatientController::class);

    Route::prefix('pharmacy')->name('pharmacy.')->group(function () {
        Route::get('lookup', PrescriptionLookupController::class)->name('lookup');
        Route::post('prescriptions/{prescription}/dispense', [DispensingController::class, 'store'])->name('dispense.store');
        Route::get('dispensings/{dispensing}/slip', [DispensingController::class, 'printSlip'])->name('dispensings.slip');
        Route::get('reports', [PharmacyReportController::class, 'index'])->name('reports.index');
    });

    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('scan', [InventoryScanController::class, 'index'])->name('scan.index');
        Route::get('scan/lookup', [InventoryScanController::class, 'lookup'])->name('scan.lookup');
        Route::get('ledger', [InventoryLedgerController::class, 'index'])->name('ledger.index');
        Route::resource('categories', InventoryCategoryController::class)->except('show');
        Route::resource('items', InventoryItemController::class);
        Route::get('receipts/create', [StockReceiptController::class, 'create'])->name('receipts.create');
        Route::post('receipts', [StockReceiptController::class, 'store'])->name('receipts.store');
        Route::get('issues/create', [StockIssueController::class, 'create'])->name('issues.create');
        Route::post('issues', [StockIssueController::class, 'store'])->name('issues.store');
        Route::get('returns/create', [StockReturnController::class, 'create'])->name('returns.create');
        Route::post('returns', [StockReturnController::class, 'store'])->name('returns.store');
        Route::get('transfers/create', [StockTransferController::class, 'create'])->name('transfers.create');
        Route::post('transfers', [StockTransferController::class, 'store'])->name('transfers.store');
        Route::get('adjustments/create', [StockAdjustmentController::class, 'create'])->name('adjustments.create');
        Route::post('adjustments', [StockAdjustmentController::class, 'store'])->name('adjustments.store');
    });

    Route::prefix('procurement')->name('procurement.')->group(function () {
        Route::resource('suppliers', SupplierController::class);
        Route::post('requisitions/{requisition}/submit', [PurchaseRequisitionController::class, 'submit'])->name('requisitions.submit');
        Route::post('requisitions/{requisition}/cancel', [PurchaseRequisitionController::class, 'cancel'])->name('requisitions.cancel');
        Route::post('requisitions/{requisition}/approval', [ProcurementApprovalController::class, 'store'])->name('requisitions.approval.store');
        Route::resource('requisitions', PurchaseRequisitionController::class)->except('destroy');
        Route::post('purchase-orders/{purchaseOrder}/issue', [PurchaseOrderController::class, 'issue'])->name('purchase-orders.issue');
        Route::post('purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
        Route::post('purchase-orders/{purchaseOrder}/close', [PurchaseOrderController::class, 'close'])->name('purchase-orders.close');
        Route::resource('purchase-orders', PurchaseOrderController::class)
            ->parameters(['purchase-orders' => 'purchaseOrder'])
            ->except('destroy');
        Route::resource('goods-receipts', GoodsReceiptController::class)
            ->parameters(['goods-receipts' => 'goodsReceipt'])
            ->only(['index', 'create', 'store', 'show']);
    });

    Route::prefix('maintenance')->name('maintenance.')->group(function () {
        Route::get('schedule', [MaintenanceController::class, 'schedule'])->name('schedule');
        Route::get('', [MaintenanceController::class, 'index'])->name('index');
        Route::get('create', [MaintenanceController::class, 'create'])->name('create');
        Route::post('', [MaintenanceController::class, 'store'])->name('store');
        Route::patch('{ticket}/status', [MaintenanceController::class, 'updateStatus'])->name('status.update');
        Route::get('{ticket}', [MaintenanceController::class, 'show'])->name('show');
        Route::get('{ticket}/edit', [MaintenanceController::class, 'edit'])->name('edit');
        Route::match(['put', 'patch'], '{ticket}', [MaintenanceController::class, 'update'])->name('update');
    });

    Route::prefix('security')->name('security.')->group(function () {
        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    });

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('', [SettingsController::class, 'index'])->name('index');
        Route::get('general', [SettingsController::class, 'general'])->name('general');
        Route::put('general', [SettingsController::class, 'updateGeneral'])->name('general.update');
        Route::get('labels', [SettingsController::class, 'labels'])->name('labels');
        Route::put('labels', [SettingsController::class, 'updateLabels'])->name('labels.update');
        Route::get('notifications', [SettingsController::class, 'notifications'])->name('notifications');
        Route::put('notifications', [SettingsController::class, 'updateNotifications'])->name('notifications.update');
    });
});

require __DIR__.'/auth.php';
