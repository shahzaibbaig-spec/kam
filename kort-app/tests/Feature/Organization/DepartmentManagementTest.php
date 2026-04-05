<?php

namespace Tests\Feature\Organization;

use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_a_department(): void
    {
        $this->seed(AccessControlSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        $response = $this->actingAs($user)->post(route('organization.departments.store'), [
            'name' => 'Burn Theatre',
            'code' => 'BTHR',
            'type' => 'burn_clinical',
            'cost_center' => 'CC-BTHR',
            'description' => 'Operating theatre support for burn procedures.',
            'phone' => '+92-300-1111111',
            'email' => 'burn.theatre@kort.local',
            'is_active' => true,
            'is_clinical' => true,
        ]);

        $response->assertRedirect(route('organization.departments.index'));
        $this->assertDatabaseHas('departments', ['code' => 'BTHR']);
    }
}
