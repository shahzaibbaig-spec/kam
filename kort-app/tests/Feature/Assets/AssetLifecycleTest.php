<?php

namespace Tests\Feature\Assets;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Department;
use App\Models\Location;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Database\Seeders\HospitalStructureSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_hospital_admin_can_create_an_asset(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $user = $this->userWithRole('Hospital Admin', [
            'department_id' => $department->id,
            'default_location_id' => $location->id,
        ]);

        $response = $this->actingAs($user)->post(route('assets.store'), [
            'asset_name' => 'Burn ICU Ventilator Test',
            'asset_code' => '',
            'asset_category_id' => $category->id,
            'department_id' => $department->id,
            'location_id' => $location->id,
            'condition_status' => AssetConditionStatus::Excellent->value,
            'asset_status' => AssetStatus::Available->value,
        ]);

        $asset = Asset::query()->first();

        $response->assertRedirect(route('assets.show', $asset));
        $this->assertNotNull($asset?->asset_uuid);
        $this->assertNotNull($asset?->asset_code);
        $this->assertDatabaseHas('asset_movements', [
            'asset_id' => $asset->id,
            'movement_type' => 'created',
        ]);
    }

    public function test_tag_generation_is_unique_for_assets_with_same_prefix(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $user = $this->userWithRole('Biomedical Engineer');

        $firstAsset = $this->makeAsset($category, $department, $location, 'SER-000001');
        $secondAsset = $this->makeAsset($category, $department, $location, 'SER-000002');

        $this->actingAs($user)->post(route('assets.tags.store', $firstAsset), ['force' => false])->assertRedirect();
        $this->actingAs($user)->post(route('assets.tags.store', $secondAsset), ['force' => false])->assertRedirect();

        $tags = Asset::query()->orderBy('id')->pluck('tag_number')->all();

        $this->assertCount(2, array_filter($tags));
        $this->assertNotSame($tags[0], $tags[1]);
    }

    public function test_issue_return_and_transfer_workflows_update_asset_state(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $transferLocation = Location::query()->where('code', 'LOC-BWRD-01')->firstOrFail();
        $actor = $this->userWithRole('Nurse Supervisor');
        $targetUser = $this->userWithRole('Staff Nurse / Clinical User', [
            'department_id' => $department->id,
            'default_location_id' => $location->id,
        ]);

        $asset = $this->makeAsset($category, $department, $location, 'SER-000003');

        $this->actingAs($actor)->post(route('assets.issue.store', $asset), [
            'assignment_type' => 'staff',
            'department_id' => $department->id,
            'location_id' => $location->id,
            'assigned_user_id' => $targetUser->id,
            'room_or_area' => 'Bedside Bay 1',
            'custodian_name' => $targetUser->name,
            'issued_at' => now()->toDateTimeString(),
            'remarks' => 'Issue test',
        ])->assertRedirect(route('assets.show', $asset));

        $asset->refresh();
        $this->assertSame(AssetStatus::InUse->value, $asset->asset_status->value);
        $this->assertDatabaseHas('asset_assignments', [
            'asset_id' => $asset->id,
            'status' => 'active',
        ]);

        $this->actingAs($actor)->post(route('assets.return.store', $asset), [
            'returned_at' => now()->toDateTimeString(),
            'return_condition' => AssetConditionStatus::Good->value,
            'return_to_department_id' => $department->id,
            'return_to_location_id' => $location->id,
            'return_to_room_or_area' => 'Store Rack 2',
            'post_return_status' => AssetStatus::Available->value,
            'remarks' => 'Return test',
        ])->assertRedirect(route('assets.show', $asset));

        $asset->refresh();
        $this->assertSame(AssetStatus::Available->value, $asset->asset_status->value);
        $this->assertNull($asset->assigned_user_id);

        $this->actingAs($actor)->post(route('assets.transfer.store', $asset), [
            'assignment_type' => 'location',
            'department_id' => $transferLocation->department_id,
            'location_id' => $transferLocation->id,
            'room_or_area' => 'Emergency Bay',
            'custodian_name' => 'Ward Team',
            'transfer_datetime' => now()->toDateTimeString(),
            'remarks' => 'Transfer test',
        ])->assertRedirect(route('assets.show', $asset));

        $asset->refresh();
        $this->assertSame($transferLocation->id, $asset->location_id);
        $this->assertDatabaseHas('asset_movements', ['asset_id' => $asset->id, 'movement_type' => 'issued']);
        $this->assertDatabaseHas('asset_movements', ['asset_id' => $asset->id, 'movement_type' => 'returned']);
        $this->assertDatabaseHas('asset_movements', ['asset_id' => $asset->id, 'movement_type' => 'transferred']);
    }

    public function test_status_change_creates_status_log_and_movement_record(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $user = $this->userWithRole('Biomedical Engineer');
        $asset = $this->makeAsset($category, $department, $location, 'SER-000004');

        $this->actingAs($user)->post(route('assets.status.store', $asset), [
            'asset_status' => AssetStatus::OutOfOrder->value,
            'condition_status' => AssetConditionStatus::Damaged->value,
            'reason' => 'Display failed during routine pre-use check.',
        ])->assertRedirect(route('assets.show', $asset));

        $asset->refresh();
        $this->assertSame(AssetStatus::OutOfOrder->value, $asset->asset_status->value);
        $this->assertDatabaseHas('asset_status_logs', [
            'asset_id' => $asset->id,
            'new_status' => AssetStatus::OutOfOrder->value,
        ]);
        $this->assertDatabaseHas('asset_movements', [
            'asset_id' => $asset->id,
            'movement_type' => 'status_changed',
        ]);
    }

    public function test_scan_lookup_redirects_when_tag_matches_single_asset(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $biomedical = $this->userWithRole('Biomedical Engineer');
        $scannerUser = $this->userWithRole('Staff Nurse / Clinical User');
        $asset = $this->makeAsset($category, $department, $location, 'SER-000005');

        $this->actingAs($biomedical)->post(route('assets.tags.store', $asset), ['force' => false])->assertRedirect();
        $asset->refresh();

        $this->actingAs($scannerUser)
            ->get(route('assets.scan.lookup', ['query' => $asset->tag_number]))
            ->assertRedirect(route('assets.show', $asset));
    }

    public function test_staff_nurse_cannot_create_asset_records(): void
    {
        $this->seedBase();

        $user = $this->userWithRole('Staff Nurse / Clinical User');

        $this->actingAs($user)
            ->get(route('assets.create'))
            ->assertForbidden();
    }

    protected function seedBase(): void
    {
        $this->seed([
            AccessControlSeeder::class,
            HospitalStructureSeeder::class,
        ]);
    }

    protected function assetCategory(): AssetCategory
    {
        return AssetCategory::factory()->create([
            'name' => 'Test Ventilators',
            'code' => 'EQP-TST',
        ]);
    }

    protected function makeAsset(AssetCategory $category, Department $department, Location $location, string $serial): Asset
    {
        return Asset::factory()->create([
            'asset_category_id' => $category->id,
            'department_id' => $department->id,
            'location_id' => $location->id,
            'serial_number' => $serial,
        ]);
    }

    protected function userWithRole(string $role, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }
}
