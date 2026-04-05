<?php

use App\Models\Department;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Department::class)->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('name');
            $table->string('code', 30)->unique();
            $table->string('building', 100)->nullable();
            $table->string('floor', 50)->nullable();
            $table->string('room', 50)->nullable();
            $table->string('storage_type', 40)->default('general')->index();
            $table->text('description')->nullable();
            $table->string('barcode', 80)->nullable()->unique();
            $table->boolean('is_active')->default(true)->index();
            $table->boolean('is_isolation')->default(false)->index();
            $table->boolean('is_emergency_reserve')->default(false)->index();
            $table->boolean('is_sterile_storage')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
