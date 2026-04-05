<?php

namespace Database\Factories;

use App\Models\AssetCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AssetCategory>
 */
class AssetCategoryFactory extends Factory
{
    protected $model = AssetCategory::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);
        $code = strtoupper(str_replace(' ', '-', fake()->unique()->lexify('CAT-???')));

        return [
            'name' => ucfirst($name),
            'code' => $code,
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
