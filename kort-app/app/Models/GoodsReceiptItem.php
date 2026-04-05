<?php

namespace App\Models;

use App\Enums\ProcurementItemType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'goods_receipt_id',
        'purchase_order_item_id',
        'item_type',
        'asset_category_id',
        'inventory_item_id',
        'item_description',
        'quantity_received',
        'quantity_accepted',
        'quantity_rejected',
        'rejection_reason',
        'batch_number',
        'manufacture_date',
        'expiry_date',
        'serial_number',
        'unit_cost',
        'storage_location_id',
        'room_or_area',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'quantity_received' => 'decimal:2',
            'quantity_accepted' => 'decimal:2',
            'quantity_rejected' => 'decimal:2',
            'manufacture_date' => 'date',
            'expiry_date' => 'date',
            'unit_cost' => 'decimal:2',
            'item_type' => ProcurementItemType::class,
        ];
    }

    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function purchaseOrderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    public function assetCategory(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'storage_location_id');
    }

    public function hasDiscrepancy(): bool
    {
        return (float) $this->quantity_rejected > 0 || (float) $this->quantity_accepted !== (float) $this->quantity_received;
    }
}
