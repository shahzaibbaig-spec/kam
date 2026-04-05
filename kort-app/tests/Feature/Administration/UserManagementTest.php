<?php

namespace Tests\Feature\Administration;

use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_hospital_admin_can_view_user_management(): void
    {
        $this->seed(AccessControlSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('Hospital Admin');

        $response = $this->actingAs($user)->get(route('admin.users.index'));

        $response->assertOk();
    }

    public function test_staff_nurse_cannot_view_user_management(): void
    {
        $this->seed(AccessControlSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('Staff Nurse / Clinical User');

        $response = $this->actingAs($user)->get(route('admin.users.index'));

        $response->assertForbidden();
    }
}
