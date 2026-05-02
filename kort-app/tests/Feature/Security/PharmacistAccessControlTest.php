<?php

namespace Tests\Feature\Security;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Illuminate\Support\Str;
use Tests\TestCase;

class PharmacistAccessControlTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{0: string}>
     */
    public static function blockedRoutesProvider(): array
    {
        return [
            'asset registry index' => ['assets.index'],
            'inventory items index' => ['inventory.items.index'],
            'inventory items create' => ['inventory.items.create'],
            'inventory categories index' => ['inventory.categories.index'],
            'inventory categories create' => ['inventory.categories.create'],
            'inventory ledger index' => ['inventory.ledger.index'],
            'stock receipt create' => ['inventory.receipts.create'],
            'stock issue create' => ['inventory.issues.create'],
            'stock return create' => ['inventory.returns.create'],
            'stock transfer create' => ['inventory.transfers.create'],
            'stock adjustment create' => ['inventory.adjustments.create'],
            'supplier index' => ['procurement.suppliers.index'],
            'supplier create' => ['procurement.suppliers.create'],
            'requisition index' => ['procurement.requisitions.index'],
            'requisition create' => ['procurement.requisitions.create'],
            'purchase order index' => ['procurement.purchase-orders.index'],
            'purchase order create' => ['procurement.purchase-orders.create'],
            'goods receipt index' => ['procurement.goods-receipts.index'],
            'goods receipt create' => ['procurement.goods-receipts.create'],
        ];
    }

    public function test_pharmacist_can_access_pharmacy_lookup(): void
    {
        $this->seed(AccessControlSeeder::class);

        $pharmacist = User::factory()->create();
        $pharmacist->assignRole('Pharmacist / Medical Store Staff');

        $this->actingAs($pharmacist)
            ->get(route('pharmacy.lookup'))
            ->assertOk();
    }

    public function test_pharmacist_can_global_search_medicine_and_see_stock_availability(): void
    {
        $this->seed(AccessControlSeeder::class);

        $pharmacist = User::factory()->create();
        $pharmacist->assignRole('Pharmacist / Medical Store Staff');

        $category = InventoryCategory::query()->create([
            'name' => 'Test Medicines',
            'code' => 'TEST-MED-'.random_int(100, 999),
            'is_active' => true,
        ]);

        InventoryItem::query()->create([
            'item_uuid' => (string) Str::uuid(),
            'inventory_category_id' => $category->id,
            'item_name' => 'Mupirocin Ointment',
            'item_code' => 'MED-MUP-001',
            'unit_of_measure' => 'tube',
            'current_quantity' => 37,
            'reserved_quantity' => 2,
            'is_active' => true,
        ]);

        $this->actingAs($pharmacist)
            ->getJson(route('search.universal', ['q' => 'mupirocin', 'limit' => 5]))
            ->assertOk()
            ->assertJsonPath('results.medicines.0.title', 'Mupirocin Ointment')
            ->assertJsonPath('results.medicines.0.url', route('pharmacy.lookup'))
            ->assertJsonPath('results.medicines.0.subtitle', 'MED-MUP-001 | Available: 35.00 tube | Stock: 37.00 tube');
    }

    public function test_pharmacist_dashboard_shows_only_dispensing_actions(): void
    {
        $this->seed(AccessControlSeeder::class);

        $pharmacist = User::factory()->create();
        $pharmacist->assignRole('Pharmacist / Medical Store Staff');

        $this->actingAs($pharmacist)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertSee('Pharmacy Dashboard')
            ->assertSee('Search Patient Prescription')
            ->assertSee('Search Medicine Stock')
            ->assertDontSee('Low Stock Warnings')
            ->assertDontSee('Near Expiry Batches')
            ->assertDontSee('Medicines Available');
    }

    public function test_pharmacist_can_search_medicine_availability_from_pharmacy_panel(): void
    {
        $this->seed(AccessControlSeeder::class);

        $pharmacist = User::factory()->create();
        $pharmacist->assignRole('Pharmacist / Medical Store Staff');

        $category = InventoryCategory::query()->create([
            'name' => 'Panel Medicines',
            'code' => 'PANEL-MED-'.random_int(100, 999),
            'is_active' => true,
        ]);

        InventoryItem::query()->create([
            'item_uuid' => (string) Str::uuid(),
            'inventory_category_id' => $category->id,
            'item_name' => 'Fusidic Acid Cream',
            'item_code' => 'MED-FUS-001',
            'unit_of_measure' => 'tube',
            'current_quantity' => 12,
            'reserved_quantity' => 2,
            'is_active' => true,
        ]);

        $this->actingAs($pharmacist)
            ->get(route('pharmacy.lookup', ['query' => 'fusidic']))
            ->assertOk()
            ->assertSee('Fusidic Acid Cream')
            ->assertSee('"available_quantity":10', false)
            ->assertSee('"is_available":true', false);
    }

    #[DataProvider('blockedRoutesProvider')]
    public function test_pharmacist_gets_403_on_non_dispensing_routes(string $routeName): void
    {
        $this->seed(AccessControlSeeder::class);

        $pharmacist = User::factory()->create();
        $pharmacist->assignRole('Pharmacist / Medical Store Staff');

        $this->actingAs($pharmacist)
            ->get(route($routeName))
            ->assertForbidden();
    }
}
