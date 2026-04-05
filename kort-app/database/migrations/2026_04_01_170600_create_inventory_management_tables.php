<?php

use App\Enums\InventoryBatchStatus;
use App\Enums\InventoryRecordStatus;
use App\Enums\InventoryTransactionType;
use App\Enums\StockAdjustmentType;
use App\Enums\StockReturnCondition;
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
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('inventory_categories')->nullOnDelete();
            $table->string('name');
            $table->string('code', 30)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('item_uuid')->unique();
            $table->string('item_name');
            $table->string('item_code', 40)->unique();
            $table->foreignId('inventory_category_id')->constrained()->cascadeOnDelete();
            $table->string('subcategory')->nullable();
            $table->string('barcode_value', 120)->nullable()->unique();
            $table->string('sku', 80)->nullable();
            $table->string('unit_of_measure', 25);
            $table->string('pack_size', 50)->nullable();
            $table->decimal('reorder_level', 14, 2)->default(0)->index();
            $table->decimal('minimum_level', 14, 2)->default(0);
            $table->decimal('maximum_level', 14, 2)->nullable();
            $table->decimal('current_quantity', 14, 2)->default(0)->index();
            $table->decimal('reserved_quantity', 14, 2)->default(0);
            $table->decimal('issued_quantity', 14, 2)->default(0);
            $table->decimal('damaged_quantity', 14, 2)->default(0);
            $table->decimal('quarantined_quantity', 14, 2)->default(0);
            $table->decimal('expired_quantity', 14, 2)->default(0);
            $table->foreignIdFor(Supplier::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Location::class, 'store_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('storage_zone', 100)->nullable();
            $table->boolean('temperature_sensitive')->default(false)->index();
            $table->boolean('sterile_item')->default(false)->index();
            $table->boolean('high_risk_item')->default(false)->index();
            $table->boolean('controlled_use')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->text('notes')->nullable();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['inventory_category_id', 'store_location_id']);
        });

        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->string('batch_number', 80)->index();
            $table->string('lot_number', 80)->nullable();
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable()->index();
            $table->decimal('unit_cost', 14, 2)->nullable();
            $table->decimal('received_quantity', 14, 2)->default(0);
            $table->decimal('available_quantity', 14, 2)->default(0);
            $table->decimal('reserved_quantity', 14, 2)->default(0);
            $table->decimal('issued_quantity', 14, 2)->default(0);
            $table->decimal('returned_quantity', 14, 2)->default(0);
            $table->decimal('damaged_quantity', 14, 2)->default(0);
            $table->decimal('quarantined_quantity', 14, 2)->default(0);
            $table->decimal('expired_quantity', 14, 2)->default(0);
            $table->string('status', 30)->default(InventoryBatchStatus::Active->value)->index();
            $table->foreignIdFor(Supplier::class)->nullable()->constrained()->nullOnDelete();
            $table->timestamp('received_at')->nullable();
            $table->foreignIdFor(Location::class, 'store_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('storage_zone', 100)->nullable();
            $table->text('notes')->nullable();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['inventory_item_id', 'batch_number', 'store_location_id'], 'inventory_batches_item_batch_location_unique');
            $table->index(['inventory_item_id', 'status']);
            $table->index(['store_location_id', 'expiry_date']);
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
            $table->string('transaction_type', 40)->default(InventoryTransactionType::Received->value)->index();
            $table->decimal('quantity', 14, 2);
            $table->string('unit_of_measure', 25);
            $table->decimal('before_quantity', 14, 2);
            $table->decimal('after_quantity', 14, 2);
            $table->decimal('before_batch_quantity', 14, 2)->nullable();
            $table->decimal('after_batch_quantity', 14, 2)->nullable();
            $table->foreignId('from_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('to_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('from_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('to_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignIdFor(User::class, 'issued_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'received_from_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_number', 60)->nullable()->index();
            $table->timestamp('transaction_datetime')->index();
            $table->text('remarks')->nullable();
            $table->foreignIdFor(User::class, 'performed_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['inventory_item_id', 'transaction_type']);
        });

        Schema::create('stock_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number', 50)->unique();
            $table->foreignIdFor(Supplier::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Department::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Location::class, 'store_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->date('receipt_date')->index();
            $table->string('invoice_reference', 100)->nullable();
            $table->string('delivery_note_number', 100)->nullable();
            $table->foreignIdFor(User::class, 'received_by')->constrained('users')->cascadeOnDelete();
            $table->text('remarks')->nullable();
            $table->string('status', 30)->default(InventoryRecordStatus::Posted->value)->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('stock_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_receipt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
            $table->string('batch_number', 80);
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->decimal('quantity', 14, 2);
            $table->decimal('unit_cost', 14, 2)->nullable();
            $table->decimal('line_total', 14, 2)->nullable();
            $table->string('storage_zone', 100)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_issues', function (Blueprint $table) {
            $table->id();
            $table->string('issue_number', 50)->unique();
            $table->date('issue_date')->index();
            $table->string('issue_type', 30)->index();
            $table->foreignIdFor(Department::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Location::class)->nullable()->constrained()->nullOnDelete();
            $table->string('room_or_area', 120)->nullable();
            $table->foreignIdFor(User::class, 'issued_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'issued_by')->constrained('users')->cascadeOnDelete();
            $table->text('remarks')->nullable();
            $table->string('status', 30)->default(InventoryRecordStatus::Posted->value)->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('stock_issue_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_issue_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
            $table->decimal('quantity', 14, 2);
            $table->string('unit_of_measure', 25);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number', 50)->unique();
            $table->date('return_date')->index();
            $table->foreignId('source_issue_id')->nullable()->constrained('stock_issues')->nullOnDelete();
            $table->foreignIdFor(User::class, 'returned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'received_by')->constrained('users')->cascadeOnDelete();
            $table->foreignIdFor(Department::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Location::class)->nullable()->constrained()->nullOnDelete();
            $table->string('room_or_area', 120)->nullable();
            $table->text('remarks')->nullable();
            $table->string('status', 30)->default(InventoryRecordStatus::Posted->value)->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('stock_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_return_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
            $table->decimal('quantity', 14, 2);
            $table->string('return_condition', 30)->default(StockReturnCondition::Usable->value)->index();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number', 50)->unique();
            $table->date('transfer_date')->index();
            $table->foreignId('from_location_id')->constrained('locations')->cascadeOnDelete();
            $table->foreignId('to_location_id')->constrained('locations')->cascadeOnDelete();
            $table->foreignId('from_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('to_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->string('status', 30)->default(InventoryRecordStatus::Posted->value)->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'performed_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('stock_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_transfer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
            $table->decimal('quantity', 14, 2);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('adjustment_number', 50)->unique();
            $table->date('adjustment_date')->index();
            $table->string('adjustment_type', 30)->default(StockAdjustmentType::Increase->value)->index();
            $table->text('reason');
            $table->foreignIdFor(Location::class)->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignIdFor(Department::class)->nullable()->constrained()->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->foreignIdFor(User::class, 'performed_by')->constrained('users')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 30)->default(InventoryRecordStatus::Posted->value)->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('stock_adjustment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_adjustment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
            $table->decimal('system_quantity', 14, 2);
            $table->decimal('physical_quantity', 14, 2)->nullable();
            $table->decimal('adjustment_quantity', 14, 2);
            $table->string('unit_of_measure', 25);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_adjustment_items');
        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('stock_transfer_items');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('stock_return_items');
        Schema::dropIfExists('stock_returns');
        Schema::dropIfExists('stock_issue_items');
        Schema::dropIfExists('stock_issues');
        Schema::dropIfExists('stock_receipt_items');
        Schema::dropIfExists('stock_receipts');
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_batches');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('inventory_categories');
    }
};
