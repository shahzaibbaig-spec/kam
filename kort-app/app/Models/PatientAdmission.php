<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientAdmission extends Model
{
    use Auditable;
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'admission_number',
        'admission_date',
        'admission_time',
        'department_id',
        'ward_id',
        'room_id',
        'bed_id',
        'admitted_by',
        'attending_doctor_id',
        'admission_reason',
        'initial_condition',
        'status',
        'discharge_date',
        'discharge_summary',
    ];

    protected function casts(): array
    {
        return [
            'admission_date' => 'date',
            'discharge_date' => 'date',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'ward_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'room_id');
    }

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'bed_id');
    }

    public function admittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admitted_by');
    }

    public function attendingDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'attending_doctor_id');
    }

    public function visits(): HasMany
    {
        return $this->hasMany(PatientVisit::class, 'admission_id');
    }
}
