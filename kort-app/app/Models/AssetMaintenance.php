<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetMaintenance extends Model
{
    use Auditable;
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'reported_by_id',
        'engineer_id',
        'supplier_id',
        'ticket_number',
        'maintenance_type',
        'status',
        'fault_report',
        'started_at',
        'completed_at',
        'downtime_minutes',
        'cost',
        'spare_parts_used',
        'resolution_notes',
        'fit_status',
        'warranty_claim',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'downtime_minutes' => 'integer',
            'cost' => 'decimal:2',
            'spare_parts_used' => 'array',
            'warranty_claim' => 'boolean',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by_id');
    }

    public function engineer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'engineer_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
