<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientPrescriptionItem extends Model
{
    use Auditable;
    use HasFactory;

    protected $fillable = [
        'prescription_id',
        'medicine_name',
        'dosage',
        'frequency',
        'duration',
        'instructions',
        'inventory_item_id',
        'prescribed_quantity',
        'dispensed_quantity',
        'remaining_quantity',
        'dispensing_status',
    ];

    protected function casts(): array
    {
        return [
            'prescribed_quantity' => 'decimal:2',
            'dispensed_quantity' => 'decimal:2',
            'remaining_quantity' => 'decimal:2',
        ];
    }

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(PatientPrescription::class, 'prescription_id');
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function dispensingItems(): HasMany
    {
        return $this->hasMany(PharmacyDispensingItem::class, 'prescription_item_id');
    }
}
