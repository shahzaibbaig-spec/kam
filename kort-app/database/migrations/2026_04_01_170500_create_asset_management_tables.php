<?php

use App\Enums\AssetAssignmentStatus;
use App\Enums\AssetAssignmentType;
use App\Enums\AssetConditionStatus;
use App\Enums\AssetMovementType;
use App\Enums\AssetStatus;
use App\Models\Department;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('asset_categories')->nullOnDelete();
            $table->string('name');
            $table->string('code', 30)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->uuid('asset_uuid')->unique();
            $table->string('asset_name');
            $table->string('asset_code', 50)->unique();
            $table->foreignId('asset_category_id')->constrained()->cascadeOnDelete();
            $table->string('tag_number', 80)->nullable()->unique();
            $table->string('barcode_value', 120)->nullable()->unique();
            $table->string('qr_value', 255)->nullable()->unique();
            $table->foreignIdFor(Supplier::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Department::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Location::class)->nullable()->constrained()->nullOnDelete();
            $table->string('room_or_area', 120)->nullable();
            $table->foreignIdFor(User::class, 'assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(Department::class, 'assigned_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignIdFor(Location::class, 'assigned_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('custodian_name', 120)->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable()->unique();
            $table->string('manufacturer')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_start')->nullable();
            $table->date('warranty_end')->nullable()->index();
            $table->decimal('purchase_cost', 14, 2)->nullable();
            $table->string('depreciation_method', 30)->nullable();
            $table->unsignedInteger('useful_life_years')->nullable();
            $table->decimal('residual_value', 14, 2)->nullable();
            $table->string('condition_status', 30)->default(AssetConditionStatus::Good->value)->index();
            $table->string('asset_status', 40)->default(AssetStatus::Available->value)->index();
            $table->timestamp('last_issued_at')->nullable()->index();
            $table->timestamp('last_returned_at')->nullable()->index();
            $table->string('image_path')->nullable();
            $table->text('notes')->nullable();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['asset_category_id', 'asset_status']);
            $table->index(['department_id', 'location_id']);
        });

        Schema::create('asset_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->string('tag_number', 80)->unique();
            $table->string('tag_format', 120);
            $table->string('barcode_value', 120)->unique();
            $table->string('qr_value', 255)->unique();
            $table->unsignedInteger('printed_count')->default(0);
            $table->timestamp('last_printed_at')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('asset_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->string('assignment_type', 30)->default(AssetAssignmentType::Department->value)->index();
            $table->foreignIdFor(Department::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Location::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(User::class, 'assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('room_or_area', 120)->nullable();
            $table->string('custodian_name', 120)->nullable();
            $table->foreignIdFor(User::class, 'issued_by')->constrained('users')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at');
            $table->timestamp('expected_return_at')->nullable()->index();
            $table->timestamp('returned_at')->nullable()->index();
            $table->string('status', 30)->default(AssetAssignmentStatus::Active->value)->index();
            $table->text('remarks')->nullable();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['asset_id', 'status']);
        });

        Schema::create('asset_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('to_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('from_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('to_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('from_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_room_or_area', 120)->nullable();
            $table->string('to_room_or_area', 120)->nullable();
            $table->string('movement_type', 30)->default(AssetMovementType::Created->value)->index();
            $table->timestamp('movement_datetime')->index();
            $table->foreignIdFor(User::class, 'performed_by')->constrained('users')->cascadeOnDelete();
            $table->string('reference_type', 120)->nullable()->index();
            $table->unsignedBigInteger('reference_id')->nullable()->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('asset_maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'reported_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'engineer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(Supplier::class)->nullable()->constrained()->nullOnDelete();
            $table->string('ticket_number', 50)->unique();
            $table->string('maintenance_type', 30)->index();
            $table->string('status', 30)->default('open')->index();
            $table->text('fault_report')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('downtime_minutes')->nullable();
            $table->decimal('cost', 14, 2)->nullable();
            $table->json('spare_parts_used')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->string('fit_status', 30)->nullable()->index();
            $table->boolean('warranty_claim')->default(false);
            $table->timestamps();
        });

        Schema::create('asset_calibrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'performed_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(Supplier::class)->nullable()->constrained()->nullOnDelete();
            $table->string('certificate_number', 80)->nullable();
            $table->timestamp('performed_at')->nullable();
            $table->timestamp('due_at')->nullable()->index();
            $table->string('status', 30)->default('scheduled')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('asset_disposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'approved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'disposed_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('disposal_type', 30)->index();
            $table->date('disposal_date')->index();
            $table->text('reason')->nullable();
            $table->decimal('recovery_amount', 14, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_disposals');
        Schema::dropIfExists('asset_calibrations');
        Schema::dropIfExists('asset_maintenances');
        Schema::dropIfExists('asset_movements');
        Schema::dropIfExists('asset_assignments');
        Schema::dropIfExists('asset_tags');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('asset_categories');
    }
};
