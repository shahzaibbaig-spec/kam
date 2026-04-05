<?php

namespace Database\Factories;

use App\Enums\InventoryBatchStatus;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryBatch>
 */
class InventoryBatchFactory extends Factory
{
    protected $model = InventoryBatch::class;

    public function definition(): array
    {
        $available = fake()->numberBetween(10, 80);

        return [
            'inventory_item_id' => InventoryItem::factory(),
            'batch_number' => strtoupper(fake()->unique()->bothify('BCH-######')),
            'manufacture_date' => fake()->dateTimeBetween('-6 months', '-2 months'),
            'expiry_date' => fake()->dateTimeBetween('+1 month', '+8 months'),
            'unit_cost' => fake()->randomFloat(2, 1, 1500),
            'received_quantity' => $available,
            'available_quantity' => $available,
            'status' => InventoryBatchStatus::Active->value,
        ];
    }
}
