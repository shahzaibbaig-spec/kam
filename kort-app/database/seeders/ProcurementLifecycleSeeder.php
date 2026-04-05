<?php

namespace Database\Seeders;

use App\Models\AssetCategory;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;
use App\Services\GoodsReceiptService;
use App\Services\ProcurementApprovalService;
use App\Services\PurchaseOrderService;
use App\Services\PurchaseRequisitionService;
use Illuminate\Database\Seeder;

class ProcurementLifecycleSeeder extends Seeder
{
    public function run(): void
    {
        $requisitions = app(PurchaseRequisitionService::class);
        $approvals = app(ProcurementApprovalService::class);
        $purchaseOrders = app(PurchaseOrderService::class);
        $goodsReceipts = app(GoodsReceiptService::class);

        $procurementOfficer = User::query()->where('email', 'procurement@kort.local')->firstOrFail();
        $manager = User::query()->where('email', 'burn.manager@kort.local')->firstOrFail();
        $hospitalAdmin = User::query()->where('email', 'hospital.admin@kort.local')->firstOrFail();
        $storeManager = User::query()->where('email', 'store.manager@kort.local')->firstOrFail();
        $nurseSupervisor = User::query()->where('email', 'nurse.supervisor@kort.local')->firstOrFail();

        $suppliers = Supplier::query()->get()->keyBy('supplier_code');
        $locations = Location::query()->get()->keyBy('code');
        $inventory = InventoryItem::query()->get()->keyBy('item_name');
        $assetCategories = AssetCategory::query()->get()->keyBy('code');

        $draftRequisition = $requisitions->create([
            'requisition_type' => 'inventory',
            'department_id' => $storeManager->department_id,
            'requested_by' => $storeManager->id,
            'request_date' => now()->subDays(5)->toDateString(),
            'priority' => 'normal',
            'purpose' => 'Planned reserve build for hydrogel coverage before next dressing load peak.',
            'remarks' => 'Keep in draft until monthly stock review closes.',
            'items' => [[
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['Hydrogel Sheet Large']->id,
                'quantity' => 25,
                'unit_of_measure' => $inventory['Hydrogel Sheet Large']->unit_of_measure,
                'estimated_unit_cost' => 620,
                'preferred_supplier_id' => $suppliers['SUP-HBMS']->id,
                'needed_by_date' => now()->addDays(14)->toDateString(),
            ]],
        ], $storeManager);

        $submittedRequisition = $requisitions->create([
            'requisition_type' => 'inventory',
            'department_id' => $nurseSupervisor->department_id,
            'requested_by' => $nurseSupervisor->id,
            'request_date' => now()->subDays(4)->toDateString(),
            'priority' => 'urgent',
            'purpose' => 'Urgent replenishment of burn cream and antimicrobial stock after surge admissions.',
            'items' => [[
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['Silver Sulfadiazine Cream 500g']->id,
                'quantity' => 18,
                'unit_of_measure' => $inventory['Silver Sulfadiazine Cream 500g']->unit_of_measure,
                'estimated_unit_cost' => 940,
                'preferred_supplier_id' => $suppliers['SUP-MGPD']->id,
            ]],
        ], $nurseSupervisor);
        $requisitions->submit($submittedRequisition, $nurseSupervisor, 'Need manager review before emergency buffer is consumed.');
        $approvals->submit($submittedRequisition, $nurseSupervisor, 'Need manager review before emergency buffer is consumed.');

        $approvedRequisition = $requisitions->create([
            'requisition_type' => 'inventory',
            'department_id' => $storeManager->department_id,
            'requested_by' => $storeManager->id,
            'request_date' => now()->subDays(3)->toDateString(),
            'priority' => 'high',
            'purpose' => 'Rebuild sterile gauze position for procedure room rotation.',
            'items' => [[
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['Sterile Gauze Pack']->id,
                'quantity' => 40,
                'unit_of_measure' => $inventory['Sterile Gauze Pack']->unit_of_measure,
                'estimated_unit_cost' => 180,
                'preferred_supplier_id' => $suppliers['SUP-HBMS']->id,
            ]],
        ], $storeManager);
        $requisitions->submit($approvedRequisition, $storeManager, 'Routine sterile replenishment.');
        $approvals->submit($approvedRequisition, $storeManager, 'Routine sterile replenishment.');
        $approvals->approve($approvedRequisition, $manager, 'Manager approval completed.');

        $rejectedRequisition = $requisitions->create([
            'requisition_type' => 'asset',
            'department_id' => $nurseSupervisor->department_id,
            'requested_by' => $nurseSupervisor->id,
            'request_date' => now()->subDays(2)->toDateString(),
            'priority' => 'normal',
            'purpose' => 'Ward tablet refresh request for non-critical documentation overflow.',
            'items' => [[
                'item_type' => 'asset',
                'asset_category_id' => $assetCategories['ITM-TAB']->id,
                'item_description' => 'Burn ward rugged tablet',
                'quantity' => 2,
                'unit_of_measure' => 'unit',
                'estimated_unit_cost' => 165000,
                'preferred_supplier_id' => $suppliers['SUP-CCDL']->id,
            ]],
        ], $nurseSupervisor);
        $requisitions->submit($rejectedRequisition, $nurseSupervisor, 'Nice-to-have refresh request.');
        $approvals->submit($rejectedRequisition, $nurseSupervisor, 'Nice-to-have refresh request.');
        $approvals->reject($rejectedRequisition, $manager, 'Deferred until clinical demand backlog clears.');

        $partialRequisition = $requisitions->create([
            'requisition_type' => 'inventory',
            'department_id' => $storeManager->department_id,
            'requested_by' => $storeManager->id,
            'request_date' => now()->subDays(8)->toDateString(),
            'priority' => 'high',
            'purpose' => 'Monthly silver dressing procurement for ward and ICU burn dressing cycles.',
            'items' => [[
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['Silver Sulfadiazine Dressing 10x10']->id,
                'quantity' => 120,
                'unit_of_measure' => $inventory['Silver Sulfadiazine Dressing 10x10']->unit_of_measure,
                'estimated_unit_cost' => 520,
                'preferred_supplier_id' => $suppliers['SUP-HBMS']->id,
            ]],
        ], $storeManager);
        $requisitions->submit($partialRequisition, $storeManager, 'Monthly wound care replenishment plan.');
        $approvals->submit($partialRequisition, $storeManager, 'Monthly wound care replenishment plan.');
        $approvals->approve($partialRequisition, $manager, 'Approved for immediate ordering.');

        $partialPo = $purchaseOrders->create([
            'purchase_requisition_id' => $partialRequisition->id,
            'supplier_id' => $suppliers['SUP-HBMS']->id,
            'po_date' => now()->subDays(7)->toDateString(),
            'expected_delivery_date' => now()->addDays(5)->toDateString(),
            'currency' => 'PKR',
            'payment_terms' => '30 days',
            'remarks' => 'Partial supplier allocation against current vendor availability.',
            'items' => [[
                'purchase_requisition_item_id' => $partialRequisition->items()->firstOrFail()->id,
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['Silver Sulfadiazine Dressing 10x10']->id,
                'item_description' => 'Silver Sulfadiazine Dressing 10x10',
                'quantity_ordered' => 80,
                'unit_of_measure' => $inventory['Silver Sulfadiazine Dressing 10x10']->unit_of_measure,
                'unit_price' => 515,
            ]],
        ], $procurementOfficer);
        $purchaseOrders->issue($partialPo, $procurementOfficer, 'Issued to supplier after approval.');

        $goodsReceipts->receive([
            'purchase_order_id' => $partialPo->id,
            'supplier_id' => $suppliers['SUP-HBMS']->id,
            'receipt_date' => now()->subDays(6)->toDateString(),
            'invoice_reference' => 'INV-HBMS-4401',
            'delivery_note_number' => 'DN-HBMS-2201',
            'received_by' => $storeManager->id,
            'inspected_by' => $manager->id,
            'remarks' => 'Partial shipment with minor damaged cartons.',
            'items' => [[
                'purchase_order_item_id' => $partialPo->items()->firstOrFail()->id,
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['Silver Sulfadiazine Dressing 10x10']->id,
                'item_description' => 'Silver Sulfadiazine Dressing 10x10',
                'quantity_received' => 40,
                'quantity_accepted' => 36,
                'quantity_rejected' => 4,
                'rejection_reason' => 'Outer packs damaged and moisture barrier compromised.',
                'batch_number' => 'PROC-SSD-4401',
                'manufacture_date' => now()->subMonths(2)->toDateString(),
                'expiry_date' => now()->addMonths(18)->toDateString(),
                'unit_cost' => 515,
                'storage_location_id' => $locations['LOC-CBST-01']->id,
                'room_or_area' => 'Procurement Intake Shelf A1',
            ]],
        ], $storeManager);

        $fullRequisition = $requisitions->create([
            'requisition_type' => 'asset',
            'department_id' => $manager->department_id,
            'requested_by' => $manager->id,
            'request_date' => now()->subDays(10)->toDateString(),
            'priority' => 'urgent',
            'purpose' => 'Burn ICU expansion requires additional infusion pumps for high-acuity beds.',
            'items' => [[
                'item_type' => 'asset',
                'asset_category_id' => $assetCategories['EQP-INF']->id,
                'item_description' => 'Baxter infusion pump',
                'quantity' => 2,
                'unit_of_measure' => 'unit',
                'estimated_unit_cost' => 650000,
                'preferred_supplier_id' => $suppliers['SUP-CCDL']->id,
            ]],
        ], $manager);
        $requisitions->submit($fullRequisition, $manager, 'Critical expansion request for ICU coverage.');
        $approvals->submit($fullRequisition, $manager, 'Critical expansion request for ICU coverage.');
        $approvals->approve($fullRequisition, $manager, 'Department head approval completed.');
        $approvals->approve($fullRequisition, $hospitalAdmin, 'Approved above threshold for capital spend.');

        $fullPo = $purchaseOrders->create([
            'purchase_requisition_id' => $fullRequisition->id,
            'supplier_id' => $suppliers['SUP-CCDL']->id,
            'po_date' => now()->subDays(9)->toDateString(),
            'expected_delivery_date' => now()->addDays(10)->toDateString(),
            'currency' => 'PKR',
            'payment_terms' => '45 days',
            'remarks' => 'Capital equipment order for ICU expansion.',
            'items' => [[
                'purchase_requisition_item_id' => $fullRequisition->items()->firstOrFail()->id,
                'item_type' => 'asset',
                'asset_category_id' => $assetCategories['EQP-INF']->id,
                'item_description' => 'Baxter infusion pump',
                'quantity_ordered' => 2,
                'unit_of_measure' => 'unit',
                'unit_price' => 645000,
            ]],
        ], $procurementOfficer);
        $purchaseOrders->issue($fullPo, $procurementOfficer, 'Issued to supplier after dual approval.');

        $goodsReceipts->receive([
            'purchase_order_id' => $fullPo->id,
            'supplier_id' => $suppliers['SUP-CCDL']->id,
            'receipt_date' => now()->subDays(4)->toDateString(),
            'invoice_reference' => 'INV-CCDL-8804',
            'delivery_note_number' => 'DN-CCDL-3110',
            'received_by' => $procurementOfficer->id,
            'inspected_by' => $manager->id,
            'remarks' => 'Equipment accepted into receiving hold for asset tagging.',
            'items' => [[
                'purchase_order_item_id' => $fullPo->items()->firstOrFail()->id,
                'item_type' => 'asset',
                'asset_category_id' => $assetCategories['EQP-INF']->id,
                'item_description' => 'Baxter infusion pump',
                'quantity_received' => 2,
                'quantity_accepted' => 2,
                'quantity_rejected' => 0,
                'serial_number' => 'PROC-INF-5001,PROC-INF-5002',
                'unit_cost' => 645000,
                'storage_location_id' => $locations['LOC-CBST-03']->id,
                'room_or_area' => 'Receiving Hold',
            ]],
        ], $procurementOfficer);

        $issuedRequisition = $requisitions->create([
            'requisition_type' => 'inventory',
            'department_id' => $storeManager->department_id,
            'requested_by' => $storeManager->id,
            'request_date' => now()->subDays(6)->toDateString(),
            'priority' => 'normal',
            'purpose' => 'Additional N95 masks for extended infection-control cover.',
            'items' => [[
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['N95 Mask']->id,
                'quantity' => 60,
                'unit_of_measure' => $inventory['N95 Mask']->unit_of_measure,
                'estimated_unit_cost' => 1250,
                'preferred_supplier_id' => $suppliers['SUP-SHT']->id,
            ]],
        ], $storeManager);
        $requisitions->submit($issuedRequisition, $storeManager, 'Routine PPE replenishment.');
        $approvals->submit($issuedRequisition, $storeManager, 'Routine PPE replenishment.');
        $approvals->approve($issuedRequisition, $manager, 'Approved for issue to procurement.');

        $issuedPo = $purchaseOrders->create([
            'purchase_requisition_id' => $issuedRequisition->id,
            'supplier_id' => $suppliers['SUP-SHT']->id,
            'po_date' => now()->subDays(5)->toDateString(),
            'expected_delivery_date' => now()->addDays(4)->toDateString(),
            'currency' => 'PKR',
            'payment_terms' => '30 days',
            'remarks' => 'PPE replenishment awaiting supplier delivery.',
            'items' => [[
                'purchase_requisition_item_id' => $issuedRequisition->items()->firstOrFail()->id,
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['N95 Mask']->id,
                'item_description' => 'N95 Mask',
                'quantity_ordered' => 60,
                'unit_of_measure' => $inventory['N95 Mask']->unit_of_measure,
                'unit_price' => 1210,
            ]],
        ], $procurementOfficer);
        $purchaseOrders->issue($issuedPo, $procurementOfficer, 'Issued to supplier and awaiting delivery.');

        $purchaseOrders->create([
            'supplier_id' => $suppliers['SUP-HBMS']->id,
            'po_date' => now()->subDays(1)->toDateString(),
            'expected_delivery_date' => now()->addDays(12)->toDateString(),
            'currency' => 'PKR',
            'payment_terms' => '30 days',
            'remarks' => 'Standalone draft for emergency trolley consumable restock.',
            'items' => [[
                'item_type' => 'inventory',
                'inventory_item_id' => $inventory['Disinfectant Solution 5L']->id,
                'item_description' => 'Disinfectant Solution 5L',
                'quantity_ordered' => 10,
                'unit_of_measure' => $inventory['Disinfectant Solution 5L']->unit_of_measure,
                'unit_price' => 2100,
            ]],
        ], $procurementOfficer);
    }
}
