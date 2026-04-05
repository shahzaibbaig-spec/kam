<?php

namespace App\Models;

use App\Enums\ProcurementPriority;
use App\Enums\PurchaseRequisitionStatus;
use App\Enums\PurchaseRequisitionType;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseRequisition extends Model
{
    use Auditable;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'requisition_number',
        'requisition_type',
        'department_id',
        'requested_by',
        'request_date',
        'priority',
        'purpose',
        'remarks',
        'total_estimated_amount',
        'status',
        'current_approval_level',
        'final_approved_at',
        'rejected_at',
        'rejected_by',
        'rejection_reason',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'request_date' => 'date',
            'total_estimated_amount' => 'decimal:2',
            'current_approval_level' => 'integer',
            'final_approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'requisition_type' => PurchaseRequisitionType::class,
            'priority' => ProcurementPriority::class,
            'status' => PurchaseRequisitionStatus::class,
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseRequisitionItem::class)->orderBy('id');
    }

    public function approvals(): MorphMany
    {
        return $this->morphMany(ProcurementApproval::class, 'approvable')->latest('acted_at');
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function isEditable(): bool
    {
        return $this->status === PurchaseRequisitionStatus::Draft;
    }

    public function requiresHospitalAdminApproval(): bool
    {
        return (float) $this->total_estimated_amount > (float) config('kort.procurement_manager_approval_threshold', 250000);
    }
}
