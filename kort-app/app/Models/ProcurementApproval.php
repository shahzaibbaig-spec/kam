<?php

namespace App\Models;

use App\Enums\ProcurementApprovalAction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ProcurementApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'approvable_type',
        'approvable_id',
        'approval_level',
        'action',
        'acted_by',
        'acted_at',
        'comments',
    ];

    protected function casts(): array
    {
        return [
            'approval_level' => 'integer',
            'acted_at' => 'datetime',
            'action' => ProcurementApprovalAction::class,
        ];
    }

    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    public function actedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acted_by');
    }
}
