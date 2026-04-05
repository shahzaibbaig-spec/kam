<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use Auditable;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'item_uuid',
        'item_code',
        'barcode_value',
        'inventory_category_id',
        'item_name',
        'subcategory',
        'sku',
        'unit_of_measure',
        'pack_size',
        'current_quantity',
        'reserved_quantity',
        'issued_quantity',
        'damaged_quantity',
        'quarantined_quantity',
        'expired_quantity',
        'supplier_id',
        'store_location_id',
        'reorder_level',
        'minimum_level',
        'maximum_level',
        'temperature_sensitive',
        'sterile_item',
        'high_risk_item',
        'controlled_use',
        'storage_zone',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'reorder_level' => 'decimal:2',
            'minimum_level' => 'decimal:2',
            'maximum_level' => 'decimal:2',
            'current_quantity' => 'decimal:2',
            'reserved_quantity' => 'decimal:2',
            'issued_quantity' => 'decimal:2',
            'damaged_quantity' => 'decimal:2',
            'quarantined_quantity' => 'decimal:2',
            'expired_quantity' => 'decimal:2',
            'temperature_sensitive' => 'boolean',
            'sterile_item' => 'boolean',
            'high_risk_item' => 'boolean',
            'controlled_use' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'inventory_category_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function storeLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'store_location_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class)->orderBy('expiry_date')->orderBy('batch_number');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class)->latest('transaction_datetime');
    }

    public function receiptItems(): HasMany
    {
        return $this->hasMany(StockReceiptItem::class);
    }

    public function issueItems(): HasMany
    {
        return $this->hasMany(StockIssueItem::class);
    }

    public function returnItems(): HasMany
    {
        return $this->hasMany(StockReturnItem::class);
    }

    public function transferItems(): HasMany
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public function adjustmentItems(): HasMany
    {
        return $this->hasMany(StockAdjustmentItem::class);
    }

    public function availableBalance(): float
    {
        return max(0, (float) $this->current_quantity - (float) $this->reserved_quantity - (float) $this->damaged_quantity - (float) $this->quarantined_quantity - (float) $this->expired_quantity);
    }

    public function isLowStock(): bool
    {
        return $this->availableBalance() <= (float) $this->reorder_level;
    }
}
