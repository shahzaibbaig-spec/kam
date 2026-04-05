<?php

namespace Database\Factories;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<InventoryItem>
 */
class InventoryItemFactory extends Factory
{
    protected $model = InventoryItem::class;

    public function definition(): array
    {
        return [
            'item_uuid' => (string) Str::orderedUuid(),
            'item_name' => ucfirst(fake()->words(3, true)),
            'item_code' => strtoupper(fake()->unique()->bothify('INV-TST-######')),
            'inventory_category_id' => InventoryCategory::factory(),
            'barcode_value' => strtoupper(fake()->unique()->bothify('BCINV######')),
            'unit_of_measure' => 'pack',
            'reorder_level' => 20,
            'minimum_level' => 10,
            'maximum_level' => 100,
            'is_active' => true,
        ];
    }
}
