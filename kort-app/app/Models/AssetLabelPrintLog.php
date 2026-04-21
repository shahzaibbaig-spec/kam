<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetLabelPrintLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'asset_tag_id',
        'printed_by',
        'reprinted_from_log_id',
        'print_source',
        'output_format',
        'copies',
        'printer_model',
        'printer_language',
        'printer_dpi',
        'label_width_mm',
        'label_height_mm',
        'gap_mm',
        'direction',
        'asset_name_printed',
        'tag_number_printed',
        'barcode_value_printed',
        'qr_value_printed',
        'tspl_payload',
        'printed_at',
    ];

    protected function casts(): array
    {
        return [
            'copies' => 'integer',
            'printer_dpi' => 'integer',
            'label_width_mm' => 'integer',
            'label_height_mm' => 'integer',
            'gap_mm' => 'integer',
            'direction' => 'integer',
            'printed_at' => 'datetime',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function assetTag(): BelongsTo
    {
        return $this->belongsTo(AssetTag::class, 'asset_tag_id');
    }

    public function printedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'printed_by');
    }

    public function reprintedFrom(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reprinted_from_log_id');
    }

    public function reprints(): HasMany
    {
        return $this->hasMany(self::class, 'reprinted_from_log_id');
    }
}
