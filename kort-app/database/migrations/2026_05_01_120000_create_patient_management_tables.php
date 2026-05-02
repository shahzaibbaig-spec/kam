<?php

use App\Models\Department;
use App\Models\Location;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('patient_number', 30)->unique();
            $table->string('cnic', 15)->nullable()->unique()->index();
            $table->string('full_name', 160)->index();
            $table->string('father_name', 160)->nullable();
            $table->string('gender', 20);
            $table->date('date_of_birth')->nullable()->index();
            $table->unsignedSmallInteger('age')->nullable();
            $table->string('phone', 25)->nullable();
            $table->string('emergency_contact', 120)->nullable();
            $table->text('address')->nullable();
            $table->string('blood_group', 10)->nullable();
            $table->text('allergies')->nullable();
            $table->text('medical_history')->nullable();
            $table->string('photo_path', 255)->nullable();
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('patient_admissions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Patient::class)->constrained()->cascadeOnDelete();
            $table->string('admission_number', 40)->unique();
            $table->date('admission_date')->index();
            $table->time('admission_time');
            $table->foreignIdFor(Department::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Location::class, 'ward_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignIdFor(Location::class, 'room_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignIdFor(Location::class, 'bed_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignIdFor(User::class, 'admitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignIdFor(User::class, 'attending_doctor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admission_reason');
            $table->text('initial_condition')->nullable();
            $table->string('status', 30)->default('admitted')->index();
            $table->date('discharge_date')->nullable();
            $table->text('discharge_summary')->nullable();
            $table->timestamps();
        });

        Schema::create('patient_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Patient::class)->constrained()->cascadeOnDelete();
            $table->foreignId('admission_id')->nullable()->constrained('patient_admissions')->nullOnDelete();
            $table->string('visit_number', 40)->unique();
            $table->dateTime('visit_date')->index();
            $table->string('visit_type', 30)->default('opd')->index();
            $table->foreignIdFor(User::class, 'doctor_id')->constrained('users')->cascadeOnDelete();
            $table->text('chief_complaint');
            $table->text('vitals')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'visit_date']);
        });

        Schema::create('patient_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Patient::class)->constrained()->cascadeOnDelete();
            $table->foreignId('visit_id')->constrained('patient_visits')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'doctor_id')->constrained('users')->cascadeOnDelete();
            $table->text('diagnosis');
            $table->text('clinical_notes')->nullable();
            $table->string('severity', 50)->nullable();
            $table->date('follow_up_date')->nullable();
            $table->timestamps();
        });

        Schema::create('patient_prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Patient::class)->constrained()->cascadeOnDelete();
            $table->foreignId('visit_id')->constrained('patient_visits')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'doctor_id')->constrained('users')->cascadeOnDelete();
            $table->string('prescription_number', 40)->unique();
            $table->dateTime('prescription_date')->index();
            $table->text('instructions')->nullable();
            $table->text('printable_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('patient_prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained('patient_prescriptions')->cascadeOnDelete();
            $table->string('medicine_name', 160);
            $table->string('dosage', 120);
            $table->string('frequency', 120);
            $table->string('duration', 120);
            $table->text('instructions')->nullable();
            $table->timestamps();
        });

        Schema::create('patient_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Patient::class)->constrained()->cascadeOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained('patient_visits')->nullOnDelete();
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->string('file_type', 80);
            $table->foreignIdFor(User::class, 'uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_documents');
        Schema::dropIfExists('patient_prescription_items');
        Schema::dropIfExists('patient_prescriptions');
        Schema::dropIfExists('patient_diagnoses');
        Schema::dropIfExists('patient_visits');
        Schema::dropIfExists('patient_admissions');
        Schema::dropIfExists('patients');
    }
};
