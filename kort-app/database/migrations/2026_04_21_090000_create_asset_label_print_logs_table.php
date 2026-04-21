<?php

use App\Models\Asset;
use App\Models\AssetTag;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_label_print_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Asset::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(AssetTag::class)->nullable()->constrained('asset_tags')->nullOnDelete();
            $table->foreignIdFor(User::class, 'printed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reprinted_from_log_id')->nullable()->constrained('asset_label_print_logs')->nullOnDelete();
            $table->string('print_source', 24)->default('single')->index();
            $table->string('output_format', 20)->default('tspl');
            $table->unsignedSmallInteger('copies')->default(1);
            $table->string('printer_model', 120);
            $table->string('printer_language', 24)->default('TSPL');
            $table->unsignedSmallInteger('printer_dpi')->default(203);
            $table->unsignedSmallInteger('label_width_mm')->default(46);
            $table->unsignedSmallInteger('label_height_mm')->default(38);
            $table->unsignedSmallInteger('gap_mm')->default(2);
            $table->unsignedTinyInteger('direction')->default(1);
            $table->string('asset_name_printed', 80);
            $table->string('tag_number_printed', 80);
            $table->string('barcode_value_printed', 120)->nullable();
            $table->string('qr_value_printed', 255)->nullable();
            $table->longText('tspl_payload');
            $table->timestamp('printed_at')->index();
            $table->timestamps();

            $table->index(['asset_id', 'printed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_label_print_logs');
    }
};
