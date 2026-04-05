<?php

namespace Tests\Feature\Procurement;

use App\Models\AssetCategory;
use App\Models\GoodsReceipt;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequisition;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Database\Seeders\AssetLifecycleSeeder;
use Database\Seeders\ClinicalCatalogSeeder;
use Database\Seeders\HospitalStructureSeeder;
use Database\Seeders\HospitalUserSeeder;
use Database\Seeders\InventoryLifecycleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProcurementLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_procurement_officer_can_create_supplier(): void
    {
        $this->seedBase();

        $response = $this->actingAs($this->procurementOfficer())->post(route('procurement.suppliers.store'), [
            'supplier_code' => '',
            'supplier_name' => 'Fresh Burn Supply Chain',
            'supplier_type' => 'inventory_vendor',
            'contact_person' => 'Areeba Khan',
            'email' => 'areeba@freshburn.example',
            'lead_time_days' => 6,
            'is_active' => true,
        ]);

        $supplier = Supplier::query()->latest('id')->firstOrFail();

        $response->assertRedirect(route('procurement.suppliers.show', $supplier));
        $this->assertNotNull($supplier->supplier_code);
        $this->assertSame('Fresh Burn Supply Chain', $supplier->supplier_name);
    }

    public function test_nurse_supervisor_can_create_draft_requisition_and_submit(): void
    {
        $this->seedBase();

        $user = $this->nurseSupervisor();
        $item = $this->inventoryItem('Silver Sulfadiazine Cream 500g');

        $this->actingAs($user)->post(route('procurement.requisitions.store'), [
            'requisition_type' => 'inventory',
            'department_id' => $user->department_id,
            'requested_by' => $user->id,
            'request_date' => now()->toDateString(),
            'priority' => 'urgent',
            'purpose' => 'Emergency topical medication replenishment.',
            'items' => [[
                'item_type' => 'inventory',
                'inventory_item_id' => $item->id,
                'quantity' => 12,
                'unit_of_measure' => $item->unit_of_measure,
                'estimated_unit_cost' => 940,
                'preferred_supplier_id' => $this->supplier('SUP-MGPD')->id,
            ]],
        ])->assertRedirect();

        $requisition = PurchaseRequisition::query()->latest('id')->firstOrFail();

        $this->actingAs($user)->post(route('procurement.requisitions.submit', $requisition), [
            'comments' => 'Need approval before reserve stock is consumed.',
        ])->assertRedirect(route('procurement.requisitions.show', $requisition));

        $requisition->refresh();

        $this->assertSame('submitted', $requisition->status->value);
        $this->assertDatabaseHas('procurement_approvals', [
            'approvable_type' => PurchaseRequisition::class,
            'approvable_id' => $requisition->id,
            'action' => 'submitted',
        ]);
    }

    public function test_high_value_requisition_requires_manager_then_hospital_admin_approval(): void
    {
        $this->seedBase();

        $requester = $this->storeManager();
        $requisition = $this->createAssetRequisition($requester, 2, 650000);

        $this->submitRequisition($requisition, $requester);

        $this->actingAs($this->manager())->post(route('procurement.requisitions.approval.store', $requisition), [
            'action' => 'approve',
            'comments' => 'Manager approval completed.',
        ])->assertRedirect();

        $requisition->refresh();
        $this->assertSame('under_review', $requisition->status->value);
        $this->assertSame(2, $requisition->current_approval_level);

        $this->actingAs($this->hospitalAdmin())->post(route('procurement.requisitions.approval.store', $requisition), [
            'action' => 'approve',
            'comments' => 'Hospital admin approval completed.',
        ])->assertRedirect();

        $requisition->refresh();
        $this->assertSame('approved', $requisition->status->value);
        $this->assertNotNull($requisition->final_approved_at);
    }

    public function test_procurement_officer_can_create_purchase_order_from_approved_requisition(): void
    {
        $this->seedBase();

        $requisition = $this->createApprovedInventoryRequisition();
        $requisitionItem = $requisition->items()->firstOrFail();
        $supplier = $this->supplier('SUP-HBMS');

        $this->actingAs($this->procurementOfficer())->post(route('procurement.purchase-orders.store'), [
            'purchase_requisition_id' => $requisition->id,
            'supplier_id' => $supplier->id,
            'po_date' => now()->toDateString(),
            'currency' => 'PKR',
            'payment_terms' => '30 days',
            'items' => [[
                'purchase_requisition_item_id' => $requisitionItem->id,
                'item_type' => 'inventory',
                'inventory_item_id' => $requisitionItem->inventory_item_id,
                'item_description' => $requisitionItem->item_description,
                'quantity_ordered' => $requisitionItem->quantity,
                'unit_of_measure' => $requisitionItem->unit_of_measure,
                'unit_price' => 180,
            ]],
        ])->assertRedirect();

        $purchaseOrder = PurchaseOrder::query()->latest('id')->firstOrFail();

        $this->assertSame($requisition->id, $purchaseOrder->purchase_requisition_id);
        $this->assertDatabaseHas('purchase_requisition_items', [
            'id' => $requisitionItem->id,
            'ordered_quantity' => $requisitionItem->quantity,
        ]);
    }

    public function test_purchase_order_can_be_issued(): void
    {
        $this->seedBase();

        $purchaseOrder = $this->createDraftPurchaseOrder();

        $this->actingAs($this->procurementOfficer())->post(route('procurement.purchase-orders.issue', $purchaseOrder), [
            'action' => 'issue',
            'remarks' => 'Issued to supplier.',
        ])->assertRedirect(route('procurement.purchase-orders.show', $purchaseOrder));

        $purchaseOrder->refresh();
        $this->assertSame('issued', $purchaseOrder->status->value);
        $this->assertNotNull($purchaseOrder->issued_at);
    }

    public function test_partial_and_full_goods_receipt_update_po_progress_and_inventory(): void
    {
        $this->seedBase();

        $purchaseOrder = $this->createIssuedPurchaseOrder();
        $purchaseOrderItem = $purchaseOrder->items()->firstOrFail();
        $location = $this->location('LOC-CBST-01');

        $this->actingAs($this->storeManager())->post(route('procurement.goods-receipts.store'), [
            'purchase_order_id' => $purchaseOrder->id,
            'supplier_id' => $purchaseOrder->supplier_id,
            'receipt_date' => now()->toDateString(),
            'received_by' => $this->storeManager()->id,
            'items' => [[
                'purchase_order_item_id' => $purchaseOrderItem->id,
                'item_type' => 'inventory',
                'inventory_item_id' => $purchaseOrderItem->inventory_item_id,
                'item_description' => $purchaseOrderItem->item_description,
                'quantity_received' => 4,
                'quantity_accepted' => 4,
                'quantity_rejected' => 0,
                'batch_number' => 'PROC-TEST-01',
                'manufacture_date' => now()->subMonth()->toDateString(),
                'expiry_date' => now()->addMonths(12)->toDateString(),
                'unit_cost' => 180,
                'storage_location_id' => $location->id,
                'room_or_area' => 'Receipt Shelf A',
            ]],
        ])->assertRedirect();

        $purchaseOrder->refresh();
        $this->assertSame('partially_received', $purchaseOrder->status->value);
        $this->assertDatabaseHas('inventory_batches', [
            'inventory_item_id' => $purchaseOrderItem->inventory_item_id,
            'batch_number' => 'PROC-TEST-01',
        ]);

        $this->actingAs($this->storeManager())->post(route('procurement.goods-receipts.store'), [
            'purchase_order_id' => $purchaseOrder->id,
            'supplier_id' => $purchaseOrder->supplier_id,
            'receipt_date' => now()->toDateString(),
            'received_by' => $this->storeManager()->id,
            'items' => [[
                'purchase_order_item_id' => $purchaseOrderItem->id,
                'item_type' => 'inventory',
                'inventory_item_id' => $purchaseOrderItem->inventory_item_id,
                'item_description' => $purchaseOrderItem->item_description,
                'quantity_received' => 6,
                'quantity_accepted' => 6,
                'quantity_rejected' => 0,
                'batch_number' => 'PROC-TEST-02',
                'manufacture_date' => now()->subMonth()->toDateString(),
                'expiry_date' => now()->addMonths(14)->toDateString(),
                'unit_cost' => 180,
                'storage_location_id' => $location->id,
                'room_or_area' => 'Receipt Shelf B',
            ]],
        ])->assertRedirect();

        $purchaseOrder->refresh();
        $this->assertSame('fully_received', $purchaseOrder->status->value);
        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $purchaseOrderItem->inventory_item_id,
            'transaction_type' => 'received',
        ]);
    }

    public function test_rejected_quantity_flags_goods_receipt(): void
    {
        $this->seedBase();

        $purchaseOrder = $this->createIssuedPurchaseOrder();
        $purchaseOrderItem = $purchaseOrder->items()->firstOrFail();

        $this->actingAs($this->storeManager())->post(route('procurement.goods-receipts.store'), [
            'purchase_order_id' => $purchaseOrder->id,
            'supplier_id' => $purchaseOrder->supplier_id,
            'receipt_date' => now()->toDateString(),
            'received_by' => $this->storeManager()->id,
            'items' => [[
                'purchase_order_item_id' => $purchaseOrderItem->id,
                'item_type' => 'inventory',
                'inventory_item_id' => $purchaseOrderItem->inventory_item_id,
                'item_description' => $purchaseOrderItem->item_description,
                'quantity_received' => 5,
                'quantity_accepted' => 4,
                'quantity_rejected' => 1,
                'rejection_reason' => 'Damaged outer carton.',
                'batch_number' => 'PROC-FLAG-01',
                'manufacture_date' => now()->subMonth()->toDateString(),
                'expiry_date' => now()->addMonths(12)->toDateString(),
                'unit_cost' => 180,
                'storage_location_id' => $this->location('LOC-CBST-01')->id,
                'room_or_area' => 'Inspection Bay',
            ]],
        ])->assertRedirect();

        $goodsReceipt = GoodsReceipt::query()->latest('id')->firstOrFail();

        $this->assertSame('flagged', $goodsReceipt->status->value);
    }

    public function test_staff_nurse_cannot_access_supplier_creation(): void
    {
        $this->seedBase();

        $this->actingAs(User::query()->where('email', 'staff.nurse@kort.local')->firstOrFail())
            ->get(route('procurement.suppliers.create'))
            ->assertForbidden();
    }

    protected function seedBase(): void
    {
        $this->seed([
            AccessControlSeeder::class,
            HospitalStructureSeeder::class,
            ClinicalCatalogSeeder::class,
            HospitalUserSeeder::class,
            AssetLifecycleSeeder::class,
            InventoryLifecycleSeeder::class,
        ]);
    }

    protected function createApprovedInventoryRequisition(): PurchaseRequisition
    {
        $requester = $this->storeManager();
        $item = $this->inventoryItem('Sterile Gauze Pack');

        $this->actingAs($requester)->post(route('procurement.requisitions.store'), [
            'requisition_type' => 'inventory',
            'department_id' => $requester->department_id,
            'requested_by' => $requester->id,
            'request_date' => now()->toDateString(),
            'priority' => 'high',
            'purpose' => 'Sterile gauze procurement.',
            'items' => [[
                'item_type' => 'inventory',
                'inventory_item_id' => $item->id,
                'quantity' => 10,
                'unit_of_measure' => $item->unit_of_measure,
                'estimated_unit_cost' => 180,
                'preferred_supplier_id' => $this->supplier('SUP-HBMS')->id,
            ]],
        ])->assertRedirect();

        $requisition = PurchaseRequisition::query()->latest('id')->firstOrFail();
        $this->submitRequisition($requisition, $requester);

        $this->actingAs($this->manager())->post(route('procurement.requisitions.approval.store', $requisition), [
            'action' => 'approve',
            'comments' => 'Approved.',
        ])->assertRedirect();

        return $requisition->fresh('items');
    }

    protected function createAssetRequisition(User $requester, int $quantity, float $unitCost): PurchaseRequisition
    {
        $category = $this->assetCategory('EQP-INF');

        $this->actingAs($requester)->post(route('procurement.requisitions.store'), [
            'requisition_type' => 'asset',
            'department_id' => $requester->department_id,
            'requested_by' => $requester->id,
            'request_date' => now()->toDateString(),
            'priority' => 'urgent',
            'purpose' => 'Additional infusion support for ICU beds.',
            'items' => [[
                'item_type' => 'asset',
                'asset_category_id' => $category->id,
                'item_description' => 'Baxter infusion pump',
                'quantity' => $quantity,
                'unit_of_measure' => 'unit',
                'estimated_unit_cost' => $unitCost,
                'preferred_supplier_id' => $this->supplier('SUP-CCDL')->id,
            ]],
        ])->assertRedirect();

        return PurchaseRequisition::query()->latest('id')->firstOrFail();
    }

    protected function submitRequisition(PurchaseRequisition $requisition, User $actor): void
    {
        $this->actingAs($actor)->post(route('procurement.requisitions.submit', $requisition), [
            'comments' => 'Submit for approval.',
        ])->assertRedirect();
    }

    protected function createDraftPurchaseOrder(): PurchaseOrder
    {
        $requisition = $this->createApprovedInventoryRequisition();
        $item = $requisition->items()->firstOrFail();

        $this->actingAs($this->procurementOfficer())->post(route('procurement.purchase-orders.store'), [
            'purchase_requisition_id' => $requisition->id,
            'supplier_id' => $this->supplier('SUP-HBMS')->id,
            'po_date' => now()->toDateString(),
            'currency' => 'PKR',
            'payment_terms' => '30 days',
            'items' => [[
                'purchase_requisition_item_id' => $item->id,
                'item_type' => 'inventory',
                'inventory_item_id' => $item->inventory_item_id,
                'item_description' => $item->item_description,
                'quantity_ordered' => 10,
                'unit_of_measure' => $item->unit_of_measure,
                'unit_price' => 180,
            ]],
        ])->assertRedirect();

        return PurchaseOrder::query()->latest('id')->firstOrFail();
    }

    protected function createIssuedPurchaseOrder(): PurchaseOrder
    {
        $purchaseOrder = $this->createDraftPurchaseOrder();

        $this->actingAs($this->procurementOfficer())->post(route('procurement.purchase-orders.issue', $purchaseOrder), [
            'action' => 'issue',
            'remarks' => 'Issued to supplier.',
        ])->assertRedirect();

        return $purchaseOrder->fresh('items');
    }

    protected function procurementOfficer(): User
    {
        return User::query()->where('email', 'procurement@kort.local')->firstOrFail();
    }

    protected function storeManager(): User
    {
        return User::query()->where('email', 'store.manager@kort.local')->firstOrFail();
    }

    protected function manager(): User
    {
        return User::query()->where('email', 'burn.manager@kort.local')->firstOrFail();
    }

    protected function hospitalAdmin(): User
    {
        return User::query()->where('email', 'hospital.admin@kort.local')->firstOrFail();
    }

    protected function nurseSupervisor(): User
    {
        return User::query()->where('email', 'nurse.supervisor@kort.local')->firstOrFail();
    }

    protected function supplier(string $code): Supplier
    {
        return Supplier::query()->where('supplier_code', $code)->firstOrFail();
    }

    protected function inventoryItem(string $name): InventoryItem
    {
        return InventoryItem::query()->where('item_name', $name)->firstOrFail();
    }

    protected function assetCategory(string $code): AssetCategory
    {
        return AssetCategory::query()->where('code', $code)->firstOrFail();
    }

    protected function location(string $code): Location
    {
        return Location::query()->where('code', $code)->firstOrFail();
    }
}
