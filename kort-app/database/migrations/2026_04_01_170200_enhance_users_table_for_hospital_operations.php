<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('default_location_id')->nullable()->after('department_id')->constrained('locations')->nullOnDelete();
            $table->string('employee_id', 40)->nullable()->after('email')->unique();
            $table->string('phone', 30)->nullable()->after('employee_id');
            $table->string('designation', 120)->nullable()->after('phone');
            $table->string('status', 20)->default('active')->after('designation')->index();
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
            $table->timestamp('password_changed_at')->nullable()->after('last_login_at');
            $table->boolean('two_factor_required')->default(false)->after('password_changed_at');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
            $table->dropConstrainedForeignId('default_location_id');
            $table->dropColumn([
                'employee_id',
                'phone',
                'designation',
                'status',
                'last_login_at',
                'password_changed_at',
                'two_factor_required',
                'deleted_at',
            ]);
        });
    }
};
