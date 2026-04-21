<?php

namespace Tests\Feature\Assets;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetLabelPrintLog;
use App\Models\Department;
use App\Models\Location;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\AccessControlSeeder;
use Database\Seeders\HospitalStructureSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetLabelPrintingTest extends TestCase
{
    use RefreshDatabase;

    public function test_single_tspl_print_creates_log_and_updates_print_count(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $user = $this->userWithRole('Biomedical Engineer');
        $asset = $this->makeAsset($category, $department, $location, 'SER-LBL-001');

        $this->actingAs($user)->post(route('assets.tags.store', $asset), ['force' => false])->assertRedirect();

        $response = $this->actingAs($user)->get(route('assets.labels.tspl', $asset));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $response->assertSee('SIZE 38 mm, 28 mm');
        $response->assertSee('QRCODE');
        $response->assertSee('BARCODE');

        $this->assertDatabaseHas('asset_label_print_logs', [
            'asset_id' => $asset->id,
            'print_source' => 'single',
            'printer_model' => 'TSC TTP-244 Pro',
            'printer_language' => 'TSPL',
            'label_width_mm' => 38,
            'label_height_mm' => 28,
        ]);

        $asset->refresh()->load('activeTag');
        $this->assertSame(1, $asset->activeTag?->printed_count);
        $this->assertNotNull($asset->activeTag?->last_printed_at);
    }

    public function test_bulk_tspl_print_logs_each_asset_and_increments_print_count(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $user = $this->userWithRole('Biomedical Engineer');
        $first = $this->makeAsset($category, $department, $location, 'SER-LBL-002');
        $second = $this->makeAsset($category, $department, $location, 'SER-LBL-003');

        $this->actingAs($user)->post(route('assets.tags.store', $first), ['force' => false])->assertRedirect();
        $this->actingAs($user)->post(route('assets.tags.store', $second), ['force' => false])->assertRedirect();

        $response = $this->actingAs($user)->get(route('assets.labels.bulk-print.tspl', [
            'assets' => [$first->id, $second->id],
        ]));

        $response->assertOk();
        $response->assertSee('PRINT 1,1');

        $this->assertSame(2, AssetLabelPrintLog::query()->count());
        $this->assertDatabaseHas('asset_label_print_logs', ['asset_id' => $first->id, 'print_source' => 'bulk']);
        $this->assertDatabaseHas('asset_label_print_logs', ['asset_id' => $second->id, 'print_source' => 'bulk']);

        $first->refresh()->load('activeTag');
        $second->refresh()->load('activeTag');

        $this->assertSame(1, $first->activeTag?->printed_count);
        $this->assertSame(1, $second->activeTag?->printed_count);
    }

    public function test_reprint_creates_new_log_link_and_updates_count(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $user = $this->userWithRole('Biomedical Engineer');
        $asset = $this->makeAsset($category, $department, $location, 'SER-LBL-004');

        $this->actingAs($user)->post(route('assets.tags.store', $asset), ['force' => false])->assertRedirect();
        $this->actingAs($user)->get(route('assets.labels.tspl', $asset))->assertOk();

        $original = AssetLabelPrintLog::query()->firstOrFail();

        $response = $this->actingAs($user)->get(route('assets.labels.reprint', $original));

        $response->assertOk();
        $response->assertSee('SIZE 38 mm, 28 mm');

        $this->assertSame(2, AssetLabelPrintLog::query()->count());
        $this->assertDatabaseHas('asset_label_print_logs', [
            'asset_id' => $asset->id,
            'print_source' => 'reprint',
            'reprinted_from_log_id' => $original->id,
        ]);

        $asset->refresh()->load('activeTag');
        $this->assertSame(2, $asset->activeTag?->printed_count);
    }

    public function test_direct_print_without_printer_share_path_redirects_with_error(): void
    {
        $this->seedBase();

        $category = $this->assetCategory();
        $department = Department::query()->where('code', 'BICU')->firstOrFail();
        $location = Location::query()->where('code', 'LOC-BICU-01')->firstOrFail();
        $user = $this->userWithRole('Biomedical Engineer');
        $asset = $this->makeAsset($category, $department, $location, 'SER-LBL-005');

        $this->actingAs($user)->post(route('assets.tags.store', $asset), ['force' => false])->assertRedirect();

        Setting::query()->updateOrCreate(
            ['key' => 'printer_share_path'],
            ['group' => 'labels', 'label' => 'Printer Share Path', 'value' => ''],
        );

        $response = $this
            ->from(route('assets.labels.show', $asset))
            ->actingAs($user)
            ->get(route('assets.labels.direct', $asset));

        $response
            ->assertRedirect(route('assets.labels.show', $asset))
            ->assertSessionHas('error');

        $this->assertSame(0, AssetLabelPrintLog::query()->count());
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
            'name' => 'Label Printing Equipment',
            'code' => 'EQP-LBL',
        ]);
    }

    protected function makeAsset(AssetCategory $category, Department $department, Location $location, string $serial): Asset
    {
        return Asset::factory()->create([
            'asset_name' => 'Patient Monitor Long Name Example Unit',
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
