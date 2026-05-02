<?php

use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\Patient;
use App\Models\PatientPrescription;
use App\Models\PatientPrescriptionItem;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacy_dispensings', function (Blueprint $table) {
            $table->id();
            $table->string('dispensing_number', 50)->unique();
            $table->foreignIdFor(Patient::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(PatientPrescription::class, 'prescription_id')->constrained('patient_prescriptions')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'pharmacist_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('dispensed_at')->index();
            $table->string('status', 30)->default('completed')->index();
            $table->text('remarks')->nullable();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('pharmacy_dispensing_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_dispensing_id')->constrained('pharmacy_dispensings')->cascadeOnDelete();
            $table->foreignIdFor(PatientPrescriptionItem::class, 'prescription_item_id')->constrained('patient_prescription_items')->cascadeOnDelete();
            $table->foreignIdFor(InventoryItem::class, 'inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->foreignIdFor(InventoryBatch::class, 'inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
            $table->decimal('prescribed_quantity', 14, 2)->nullable();
            $table->decimal('dispensed_quantity', 14, 2);
            $table->string('unit_of_measure', 25);
            $table->string('batch_number', 80)->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::table('patient_prescriptions', function (Blueprint $table) {
            $table->string('dispensing_status', 30)->default('pending')->index()->after('printable_notes');
        });

        Schema::table('patient_prescription_items', function (Blueprint $table) {
            $table->foreignIdFor(InventoryItem::class, 'inventory_item_id')->nullable()->after('instructions')->constrained('inventory_items')->nullOnDelete();
            $table->decimal('prescribed_quantity', 14, 2)->nullable()->after('inventory_item_id');
            $table->decimal('dispensed_quantity', 14, 2)->default(0)->after('prescribed_quantity');
            $table->decimal('remaining_quantity', 14, 2)->nullable()->after('dispensed_quantity');
            $table->string('dispensing_status', 30)->default('pending')->index()->after('remaining_quantity');
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->foreignIdFor(Patient::class)->nullable()->after('received_from_user_id')->constrained('patients')->nullOnDelete();
            $table->foreignIdFor(PatientPrescription::class, 'prescription_id')->nullable()->after('patient_id')->constrained('patient_prescriptions')->nullOnDelete();
            $table->foreignId('pharmacy_dispensing_id')->nullable()->after('prescription_id')->constrained('pharmacy_dispensings')->nullOnDelete();
            $table->foreignIdFor(User::class, 'pharmacist_id')->nullable()->after('pharmacy_dispensing_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pharmacist_id');
            $table->dropConstrainedForeignId('pharmacy_dispensing_id');
            $table->dropConstrainedForeignId('prescription_id');
            $table->dropConstrainedForeignId('patient_id');
        });

        Schema::table('patient_prescription_items', function (Blueprint $table) {
            $table->dropColumn('dispensing_status');
            $table->dropColumn('remaining_quantity');
            $table->dropColumn('dispensed_quantity');
            $table->dropColumn('prescribed_quantity');
            $table->dropConstrainedForeignId('inventory_item_id');
        });

        Schema::table('patient_prescriptions', function (Blueprint $table) {
            $table->dropColumn('dispensing_status');
        });

        Schema::dropIfExists('pharmacy_dispensing_items');
        Schema::dropIfExists('pharmacy_dispensings');
    }
};

