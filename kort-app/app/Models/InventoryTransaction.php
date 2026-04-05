<?php

namespace App\Models;

use App\Enums\InventoryTransactionType;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    use Auditable;
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'inventory_batch_id',
        'transaction_type',
        'quantity',
        'unit_of_measure',
        'before_quantity',
        'after_quantity',
        'before_batch_quantity',
        'after_batch_quantity',
        'from_location_id',
        'to_location_id',
        'from_department_id',
        'to_department_id',
        'issued_to_user_id',
        'received_from_user_id',
        'reference_type',
        'reference_id',
        'reference_number',
        'transaction_datetime',
        'remarks',
        'performed_by',
    ];

    protected function casts(): array
    {
        return [
            'transaction_type' => InventoryTransactionType::class,
            'quantity' => 'decimal:2',
            'before_quantity' => 'decimal:2',
            'after_quantity' => 'decimal:2',
            'before_batch_quantity' => 'decimal:2',
            'after_batch_quantity' => 'decimal:2',
            'transaction_datetime' => 'datetime',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(InventoryBatch::class, 'inventory_batch_id');
    }

    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function toLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }

    public function fromDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'from_department_id');
    }

    public function toDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'to_department_id');
    }

    public function issuedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_to_user_id');
    }

    public function receivedFromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_from_user_id');
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
