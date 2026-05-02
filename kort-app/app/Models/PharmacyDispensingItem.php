<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PharmacyDispensingItem extends Model
{
    use Auditable;
    use HasFactory;

    protected $fillable = [
        'pharmacy_dispensing_id',
        'prescription_item_id',
        'inventory_item_id',
        'inventory_batch_id',
        'prescribed_quantity',
        'dispensed_quantity',
        'unit_of_measure',
        'batch_number',
        'expiry_date',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'prescribed_quantity' => 'decimal:2',
            'dispensed_quantity' => 'decimal:2',
            'expiry_date' => 'date',
        ];
    }

    public function dispensing(): BelongsTo
    {
        return $this->belongsTo(PharmacyDispensing::class, 'pharmacy_dispensing_id');
    }

    public function prescriptionItem(): BelongsTo
    {
        return $this->belongsTo(PatientPrescriptionItem::class, 'prescription_item_id');
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(InventoryBatch::class, 'inventory_batch_id');
    }
}

