<?php

namespace App\Models;

use App\Enums\AssetConditionStatus;
use App\Enums\AssetStatus;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use Auditable;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'asset_uuid',
        'asset_name',
        'asset_code',
        'tag_number',
        'barcode_value',
        'qr_value',
        'asset_category_id',
        'supplier_id',
        'department_id',
        'location_id',
        'room_or_area',
        'assigned_user_id',
        'assigned_department_id',
        'assigned_location_id',
        'custodian_name',
        'brand',
        'model',
        'serial_number',
        'manufacturer',
        'purchase_date',
        'warranty_start',
        'warranty_end',
        'purchase_cost',
        'depreciation_method',
        'useful_life_years',
        'residual_value',
        'condition_status',
        'asset_status',
        'image_path',
        'notes',
        'last_issued_at',
        'last_returned_at',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'warranty_start' => 'date',
            'warranty_end' => 'date',
            'purchase_cost' => 'decimal:2',
            'residual_value' => 'decimal:2',
            'last_issued_at' => 'datetime',
            'last_returned_at' => 'datetime',
            'asset_status' => AssetStatus::class,
            'condition_status' => AssetConditionStatus::class,
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function assignedDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'assigned_department_id');
    }

    public function assignedLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'assigned_location_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(AssetTag::class);
    }

    public function activeTag(): HasOne
    {
        return $this->hasOne(AssetTag::class)->where('is_active', true)->latestOfMany();
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(AssetAssignment::class)->latest('assigned_at');
    }

    public function activeAssignment(): HasOne
    {
        return $this->hasOne(AssetAssignment::class)
            ->where('status', 'active')
            ->latestOfMany('assigned_at');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(AssetMovement::class)->latest('movement_datetime');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(AssetStatusLog::class)->latest('changed_at');
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(AssetMaintenance::class)->latest();
    }

    public function calibrations(): HasMany
    {
        return $this->hasMany(AssetCalibration::class)->latest('due_at');
    }
}
