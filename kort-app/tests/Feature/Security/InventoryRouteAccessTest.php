<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class InventoryRouteAccessTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{0: string}>
     */
    public static function blockedInventoryRoutesProvider(): array
    {
        return [
            'inventory items index' => ['inventory.items.index'],
            'inventory categories index' => ['inventory.categories.index'],
            'inventory ledger index' => ['inventory.ledger.index'],
            'inventory scan index' => ['inventory.scan.index'],
            'stock receipt create' => ['inventory.receipts.create'],
            'stock issue create' => ['inventory.issues.create'],
            'stock return create' => ['inventory.returns.create'],
            'stock transfer create' => ['inventory.transfers.create'],
            'stock adjustment create' => ['inventory.adjustments.create'],
        ];
    }

    #[DataProvider('blockedInventoryRoutesProvider')]
    public function test_receptionist_gets_403_on_direct_inventory_routes(string $routeName): void
    {
        $this->seed(AccessControlSeeder::class);

        $receptionist = User::factory()->create();
        $receptionist->assignRole('Receptionist');

        $this->actingAs($receptionist)
            ->get(route($routeName))
            ->assertForbidden();
    }

    #[DataProvider('blockedInventoryRoutesProvider')]
    public function test_doctor_gets_403_on_direct_inventory_routes(string $routeName): void
    {
        $this->seed(AccessControlSeeder::class);

        $doctor = User::factory()->create();
        $doctor->assignRole('Doctor / Consultant');

        $this->actingAs($doctor)
            ->get(route($routeName))
            ->assertForbidden();
    }
}
