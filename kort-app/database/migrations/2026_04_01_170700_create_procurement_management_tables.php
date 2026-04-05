<?php

use App\Models\AssetCategory;
use App\Models\Department;
use App\Models\InventoryItem;
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
        Schema::create('purchase_requisitions', function (Blueprint $table) {
            $table->id();
            $table->string('requisition_number', 50)->unique()->index();
            $table->string('requisition_type', 20)->default('inventory')->index();
            $table->foreignIdFor(Department::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(User::class, 'requested_by')->constrained('users')->cascadeOnDelete();
            $table->date('request_date')->index();
            $table->string('priority', 20)->default('normal')->index();
            $table->text('purpose')->nullable();
            $table->text('remarks')->nullable();
            $table->decimal('total_estimated_amount', 14, 2)->nullable();
            $table->string('status', 30)->default('draft')->index();
            $table->unsignedSmallInteger('current_approval_level')->nullable();
            $table->timestamp('final_approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignIdFor(User::class, 'rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_requisition_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_requisition_id')->constrained()->cascadeOnDelete();
            $table->string('item_type', 20)->index();
            $table->foreignIdFor(AssetCategory::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(InventoryItem::class)->nullable()->constrained()->nullOnDelete();
            $table->string('item_description');
            $table->decimal('quantity', 14, 2);
            $table->string('unit_of_measure', 25)->nullable();
            $table->decimal('estimated_unit_cost', 14, 2)->nullable();
            $table->decimal('estimated_total', 14, 2)->nullable();
            $table->foreignIdFor(Supplier::class, 'preferred_supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->date('needed_by_date')->nullable();
            $table->text('remarks')->nullable();
            $table->decimal('ordered_quantity', 14, 2)->default(0);
            $table->decimal('received_quantity', 14, 2)->default(0);
            $table->string('status', 30)->default('pending')->index();
            $table->timestamps();
        });

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number', 50)->unique();
            $table->foreignId('purchase_requisition_id')->nullable()->constrained('purchase_requisitions')->nullOnDelete();
            $table->foreignIdFor(Supplier::class)->constrained()->cascadeOnDelete();
            $table->date('po_date')->index();
            $table->date('expected_delivery_date')->nullable()->index();
            $table->string('currency', 10)->nullable();
            $table->decimal('subtotal', 14, 2)->nullable();
            $table->decimal('tax_amount', 14, 2)->nullable();
            $table->decimal('discount_amount', 14, 2)->nullable();
            $table->decimal('total_amount', 14, 2)->nullable();
            $table->string('payment_terms', 120)->nullable();
            $table->text('remarks')->nullable();
            $table->string('status', 30)->default('draft')->index();
            $table->timestamp('approved_at')->nullable();
            $table->foreignIdFor(User::class, 'approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('issued_at')->nullable();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_requisition_item_id')->nullable()->constrained('purchase_requisition_items')->nullOnDelete();
            $table->string('item_type', 20)->index();
            $table->foreignIdFor(AssetCategory::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(InventoryItem::class)->nullable()->constrained()->nullOnDelete();
            $table->string('item_description');
            $table->decimal('quantity_ordered', 14, 2);
            $table->decimal('quantity_received', 14, 2)->default(0);
            $table->string('unit_of_measure', 25)->nullable();
            $table->decimal('unit_price', 14, 2)->nullable();
            $table->decimal('line_total', 14, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->string('status', 30)->default('pending')->index();
            $table->timestamps();
        });

        Schema::create('goods_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('grn_number', 50)->unique()->index();
            $table->foreignId('purchase_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Supplier::class)->nullable()->constrained()->nullOnDelete();
            $table->date('receipt_date')->index();
            $table->string('invoice_reference')->nullable();
            $table->string('delivery_note_number')->nullable();
            $table->foreignIdFor(User::class, 'received_by')->constrained('users')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'inspected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->string('status', 30)->default('draft')->index();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('goods_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('item_type', 20)->index();
            $table->foreignIdFor(AssetCategory::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(InventoryItem::class)->nullable()->constrained()->nullOnDelete();
            $table->string('item_description');
            $table->decimal('quantity_received', 14, 2);
            $table->decimal('quantity_accepted', 14, 2);
            $table->decimal('quantity_rejected', 14, 2)->default(0);
            $table->text('rejection_reason')->nullable();
            $table->string('batch_number', 80)->nullable();
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('serial_number', 120)->nullable();
            $table->decimal('unit_cost', 14, 2)->nullable();
            $table->foreignIdFor(Location::class, 'storage_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('room_or_area')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('procurement_approvals', function (Blueprint $table) {
            $table->id();
            $table->morphs('approvable');
            $table->unsignedSmallInteger('approval_level')->index();
            $table->string('action', 20)->index();
            $table->foreignIdFor(User::class, 'acted_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('acted_at')->index();
            $table->text('comments')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_approvals');
        Schema::dropIfExists('goods_receipt_items');
        Schema::dropIfExists('goods_receipts');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('purchase_requisition_items');
        Schema::dropIfExists('purchase_requisitions');
    }
};
