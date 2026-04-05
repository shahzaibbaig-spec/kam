<?php

namespace Database\Factories;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\AssetCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Asset>
 */
class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition(): array
    {
        return [
            'asset_uuid' => (string) Str::orderedUuid(),
            'asset_name' => ucfirst(fake()->words(3, true)),
            'asset_code' => strtoupper(fake()->unique()->bothify('AST-TST-######')),
            'asset_category_id' => AssetCategory::factory(),
            'brand' => fake()->company(),
            'model' => strtoupper(fake()->bothify('MDL-###')),
            'serial_number' => strtoupper(fake()->unique()->bothify('SER-#######')),
            'manufacturer' => fake()->company(),
            'purchase_date' => fake()->dateTimeBetween('-2 years', '-1 year'),
            'warranty_start' => fake()->dateTimeBetween('-2 years', '-1 year'),
            'warranty_end' => fake()->dateTimeBetween('now', '+2 years'),
            'purchase_cost' => fake()->randomFloat(2, 10000, 5000000),
            'depreciation_method' => 'straight_line',
            'useful_life_years' => fake()->numberBetween(3, 10),
            'residual_value' => fake()->randomFloat(2, 0, 250000),
            'condition_status' => AssetConditionStatus::Good->value,
            'asset_status' => AssetStatus::Available->value,
        ];
    }
}
