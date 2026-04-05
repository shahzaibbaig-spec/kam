<?php

namespace Tests\Feature\Inventory;

use App\Models\InventoryBatch;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;
use App\Services\BatchService;
use Database\Seeders\AccessControlSeeder;
use Database\Seeders\ClinicalCatalogSeeder;
use Database\Seeders\HospitalStructureSeeder;
use Database\Seeders\HospitalUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_manager_can_create_inventory_item(): void
    {
        $this->seedBase();

        $user = $this->storeManager();
        $category = InventoryCategory::factory()->create();
        $supplier = Supplier::query()->firstOrFail();
        $location = Location::query()->where('code', 'LOC-CBST-01')->firstOrFail();

        $response = $this->actingAs($user)->post(route('inventory.items.store'), [
            'item_name' => 'Sterile Burn Cover Test Pack',
            'item_code' => '',
            'inventory_category_id' => $category->id,
            'barcode_value' => 'BCINVTEST001',
            'unit_of_measure' => 'pack',
            'reorder_level' => 10,
            'minimum_level' => 5,
            'maximum_level' => 30,
            'supplier_id' => $supplier->id,
            'store_location_id' => $location->id,
            'temperature_sensitive' => false,
            'sterile_item' => true,
            'high_risk_item' => false,
            'controlled_use' => false,
            'is_active' => true,
        ]);

        $item = InventoryItem::query()->first();

        $response->assertRedirect(route('inventory.items.show', $item));
        $this->assertNotNull($item?->item_uuid);
        $this->assertNotNull($item?->item_code);
    }

    public function test_stock_receipt_creates_batch_and_received_transaction(): void
    {
        $this->seedBase();

        $user = $this->storeManager();
        $item = $this->makeItem();

        $this->actingAs($user)->post(route('inventory.receipts.store'), [
            'supplier_id' => $item->supplier_id,
            'department_id' => $item->storeLocation?->department_id,
            'store_location_id' => $item->store_location_id,
            'receipt_date' => now()->toDateString(),
            'items' => [[
                'inventory_item_id' => $item->id,
                'batch_number' => 'REC-TEST-01',
                'manufacture_date' => now()->subMonths(2)->toDateString(),
                'expiry_date' => now()->addMonths(8)->toDateString(),
                'quantity' => 50,
                'unit_cost' => 125,
            ]],
        ])->assertRedirect(route('inventory.items.show', $item));

        $item->refresh();

        $this->assertDatabaseHas('inventory_batches', [
            'inventory_item_id' => $item->id,
            'batch_number' => 'REC-TEST-01',
        ]);
        $this->assertEquals(50.0, (float) $item->current_quantity);
        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $item->id,
            'transaction_type' => 'received',
        ]);
    }

    public function test_fefo_issue_allocates_earliest_valid_batches_first(): void
    {
        $this->seedBase();

        $user = $this->storeManager();
        $item = $this->makeItem();
        $earlierBatch = $this->makeBatch($item, ['batch_number' => 'FEFO-01', 'available_quantity' => 10, 'received_quantity' => 10, 'expiry_date' => now()->addDays(7)]);
        $laterBatch = $this->makeBatch($item, ['batch_number' => 'FEFO-02', 'available_quantity' => 25, 'received_quantity' => 25, 'expiry_date' => now()->addDays(30)]);

        $this->actingAs($user)->post(route('inventory.issues.store'), [
            'issue_date' => now()->toDateString(),
            'issue_type' => 'department',
            'department_id' => $item->storeLocation?->department_id,
            'items' => [[
                'inventory_item_id' => $item->id,
                'quantity' => 30,
            ]],
        ])->assertRedirect(route('inventory.items.show', $item));

        $this->assertDatabaseHas('stock_issue_items', [
            'inventory_item_id' => $item->id,
            'inventory_batch_id' => $earlierBatch->id,
            'quantity' => 10.00,
        ]);
        $this->assertDatabaseHas('stock_issue_items', [
            'inventory_item_id' => $item->id,
            'inventory_batch_id' => $laterBatch->id,
            'quantity' => 20.00,
        ]);
    }

    public function test_issue_blocks_expired_batch_stock(): void
    {
        $this->seedBase();

        $user = $this->storeManager();
        $item = $this->makeItem();
        $this->makeBatch($item, [
            'batch_number' => 'EXP-01',
            'available_quantity' => 12,
            'received_quantity' => 12,
            'expiry_date' => now()->subDays(3),
            'status' => 'expired',
        ]);

        $this->actingAs($user)->from(route('inventory.issues.create'))->post(route('inventory.issues.store'), [
            'issue_date' => now()->toDateString(),
            'issue_type' => 'department',
            'department_id' => $item->storeLocation?->department_id,
            'items' => [[
                'inventory_item_id' => $item->id,
                'quantity' => 5,
            ]],
        ])->assertSessionHasErrors('items');
    }

    public function test_stock_return_updates_batch_and_transaction(): void
    {
        $this->seedBase();

        $user = $this->storeManager();
        $item = $this->makeItem();
        $batch = $this->makeBatch($item, ['batch_number' => 'RET-01', 'available_quantity' => 20, 'received_quantity' => 20]);

        $this->actingAs($user)->post(route('inventory.issues.store'), [
            'issue_date' => now()->toDateString(),
            'issue_type' => 'department',
            'department_id' => $item->storeLocation?->department_id,
            'items' => [[
                'inventory_item_id' => $item->id,
                'inventory_batch_id' => $batch->id,
                'quantity' => 8,
            ]],
        ])->assertRedirect();

        $issueItem = $item->issueItems()->latest()->firstOrFail();

        $this->actingAs($user)->post(route('inventory.returns.store'), [
            'return_date' => now()->toDateString(),
            'source_issue_id' => $issueItem->issue->id,
            'location_id' => $item->store_location_id,
            'items' => [[
                'inventory_item_id' => $item->id,
                'inventory_batch_id' => $issueItem->inventory_batch_id,
                'quantity' => 3,
                'return_condition' => 'usable',
            ]],
        ])->assertRedirect(route('inventory.items.show', $item));

        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $item->id,
            'transaction_type' => 'returned',
        ]);
    }

    public function test_stock_transfer_moves_batch_quantity_between_locations(): void
    {
        $this->seedBase();

        $user = $this->storeManager();
        $source = Location::query()->where('code', 'LOC-CBST-01')->firstOrFail();
        $target = Location::query()->where('code', 'LOC-CBST-03')->firstOrFail();
        $item = $this->makeItem(['store_location_id' => $source->id]);
        $batch = $this->makeBatch($item, ['batch_number' => 'TRF-01', 'store_location_id' => $source->id, 'available_quantity' => 18, 'received_quantity' => 18]);

        $this->actingAs($user)->post(route('inventory.transfers.store'), [
            'transfer_date' => now()->toDateString(),
            'from_location_id' => $source->id,
            'to_location_id' => $target->id,
            'items' => [[
                'inventory_item_id' => $item->id,
                'inventory_batch_id' => $batch->id,
                'quantity' => 6,
            ]],
        ])->assertRedirect(route('inventory.items.show', $item));

        $this->assertDatabaseHas('inventory_batches', [
            'inventory_item_id' => $item->id,
            'batch_number' => 'TRF-01',
            'store_location_id' => $target->id,
            'available_quantity' => 6.00,
        ]);
        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $item->id,
            'transaction_type' => 'transferred_out',
        ]);
        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $item->id,
            'transaction_type' => 'transferred_in',
        ]);
    }

    public function test_stock_adjustment_supports_quarantine_and_release(): void
    {
        $this->seedBase();

        $user = $this->storeManager();
        $item = $this->makeItem();
        $batch = $this->makeBatch($item, ['batch_number' => 'ADJ-01', 'available_quantity' => 20, 'received_quantity' => 20]);

        $this->actingAs($user)->post(route('inventory.adjustments.store'), [
            'adjustment_date' => now()->toDateString(),
            'adjustment_type' => 'quarantine',
            'reason' => 'Package damage under review.',
            'location_id' => $item->store_location_id,
            'items' => [[
                'inventory_item_id' => $item->id,
                'inventory_batch_id' => $batch->id,
                'system_quantity' => 20,
                'adjustment_quantity' => 5,
            ]],
        ])->assertRedirect(route('inventory.items.show', $item));

        $batch->refresh();
        $this->assertEquals(5.0, (float) $batch->quarantined_quantity);

        $this->actingAs($user)->post(route('inventory.adjustments.store'), [
            'adjustment_date' => now()->toDateString(),
            'adjustment_type' => 'release',
            'reason' => 'Inspection passed.',
            'location_id' => $item->store_location_id,
            'items' => [[
                'inventory_item_id' => $item->id,
                'inventory_batch_id' => $batch->id,
                'system_quantity' => (float) $batch->available_quantity,
                'adjustment_quantity' => 3,
            ]],
        ])->assertRedirect(route('inventory.items.show', $item));

        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $item->id,
            'transaction_type' => 'released_from_quarantine',
        ]);
    }

    public function test_inventory_scan_lookup_redirects_for_single_match(): void
    {
        $this->seedBase();

        $user = $this->storeManager();
        $item = $this->makeItem(['barcode_value' => 'BCINVLOOK001']);

        $this->actingAs($user)
            ->get(route('inventory.scan.lookup', ['query' => $item->barcode_value]))
            ->assertRedirect(route('inventory.items.show', $item));
    }

    public function test_staff_nurse_cannot_access_inventory_item_creation(): void
    {
        $this->seedBase();

        $user = User::query()->where('email', 'staff.nurse@kort.local')->firstOrFail();

        $this->actingAs($user)
            ->get(route('inventory.items.create'))
            ->assertForbidden();
    }

    protected function seedBase(): void
    {
        $this->seed([
            AccessControlSeeder::class,
            HospitalStructureSeeder::class,
            ClinicalCatalogSeeder::class,
            HospitalUserSeeder::class,
        ]);
    }

    protected function storeManager(): User
    {
        return User::query()->where('email', 'store.manager@kort.local')->firstOrFail();
    }

    protected function makeItem(array $overrides = []): InventoryItem
    {
        $category = InventoryCategory::factory()->create();
        $supplier = Supplier::query()->firstOrFail();
        $location = Location::query()->where('code', 'LOC-CBST-01')->firstOrFail();

        return InventoryItem::factory()->create([
            'inventory_category_id' => $category->id,
            'supplier_id' => $supplier->id,
            'store_location_id' => $location->id,
            'temperature_sensitive' => false,
            'sterile_item' => true,
            'high_risk_item' => false,
            'controlled_use' => false,
            'created_by' => $this->storeManager()->id,
            'updated_by' => $this->storeManager()->id,
            ...$overrides,
        ]);
    }

    protected function makeBatch(InventoryItem $item, array $overrides = []): InventoryBatch
    {
        $batch = InventoryBatch::factory()->create([
            'inventory_item_id' => $item->id,
            'store_location_id' => $overrides['store_location_id'] ?? $item->store_location_id,
            'created_by' => $this->storeManager()->id,
            'updated_by' => $this->storeManager()->id,
            ...$overrides,
        ]);

        app(BatchService::class)->refreshStatus($batch);
        app(BatchService::class)->recalculateItem($item, $this->storeManager());

        return $batch->fresh();
    }
}
