<?php

namespace App\Models;

use App\Enums\ProcurementItemType;
use App\Enums\PurchaseRequisitionItemStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequisitionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_requisition_id',
        'item_type',
        'asset_category_id',
        'inventory_item_id',
        'item_description',
        'quantity',
        'unit_of_measure',
        'estimated_unit_cost',
        'estimated_total',
        'preferred_supplier_id',
        'needed_by_date',
        'remarks',
        'ordered_quantity',
        'received_quantity',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'estimated_unit_cost' => 'decimal:2',
            'estimated_total' => 'decimal:2',
            'ordered_quantity' => 'decimal:2',
            'received_quantity' => 'decimal:2',
            'needed_by_date' => 'date',
            'item_type' => ProcurementItemType::class,
            'status' => PurchaseRequisitionItemStatus::class,
        ];
    }

    public function requisition(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequisition::class, 'purchase_requisition_id');
    }

    public function assetCategory(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function preferredSupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'preferred_supplier_id');
    }

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
