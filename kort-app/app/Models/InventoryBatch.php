<?php

namespace App\Models;

use App\Enums\InventoryBatchStatus;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryBatch extends Model
{
    use Auditable;
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'batch_number',
        'lot_number',
        'manufacture_date',
        'expiry_date',
        'unit_cost',
        'received_quantity',
        'available_quantity',
        'reserved_quantity',
        'issued_quantity',
        'returned_quantity',
        'damaged_quantity',
        'quarantined_quantity',
        'expired_quantity',
        'status',
        'supplier_id',
        'received_at',
        'store_location_id',
        'storage_zone',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'manufacture_date' => 'date',
            'expiry_date' => 'date',
            'unit_cost' => 'decimal:2',
            'received_quantity' => 'decimal:2',
            'available_quantity' => 'decimal:2',
            'reserved_quantity' => 'decimal:2',
            'issued_quantity' => 'decimal:2',
            'returned_quantity' => 'decimal:2',
            'damaged_quantity' => 'decimal:2',
            'quarantined_quantity' => 'decimal:2',
            'expired_quantity' => 'decimal:2',
            'received_at' => 'datetime',
            'status' => InventoryBatchStatus::class,
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
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

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function receiptItems(): HasMany
    {
        return $this->hasMany(StockReceiptItem::class, 'inventory_batch_id');
    }

    public function issueItems(): HasMany
    {
        return $this->hasMany(StockIssueItem::class, 'inventory_batch_id');
    }

    public function returnItems(): HasMany
    {
        return $this->hasMany(StockReturnItem::class, 'inventory_batch_id');
    }

    public function transferItems(): HasMany
    {
        return $this->hasMany(StockTransferItem::class, 'inventory_batch_id');
    }

    public function adjustmentItems(): HasMany
    {
        return $this->hasMany(StockAdjustmentItem::class, 'inventory_batch_id');
    }

    public function isExpired(): bool
    {
        return $this->expiry_date?->isPast() ?? false;
    }

    public function isIssuable(): bool
    {
        $status = $this->status instanceof InventoryBatchStatus ? $this->status : InventoryBatchStatus::from((string) $this->status);

        return ! $this->isExpired()
            && ! in_array($status, [InventoryBatchStatus::Expired, InventoryBatchStatus::Quarantined, InventoryBatchStatus::Damaged, InventoryBatchStatus::Exhausted], true)
            && (float) $this->available_quantity > 0;
    }
}
