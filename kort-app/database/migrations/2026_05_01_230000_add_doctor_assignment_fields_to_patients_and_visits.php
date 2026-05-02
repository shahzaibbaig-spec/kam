<?php

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->foreignIdFor(User::class, 'assigned_doctor_id')
                ->nullable()
                ->after('updated_by')
                ->constrained('users')
                ->nullOnDelete();
        });

        Schema::table('patient_visits', function (Blueprint $table) {
            $table->foreignIdFor(Department::class)
                ->nullable()
                ->after('admission_id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('patient_visits', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Department::class);
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_doctor_id');
        });
    }
};
