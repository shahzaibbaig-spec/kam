<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientPrescription extends Model
{
    use Auditable;
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'visit_id',
        'doctor_id',
        'prescription_number',
        'prescription_date',
        'instructions',
        'printable_notes',
        'dispensing_status',
    ];

    protected function casts(): array
    {
        return [
            'prescription_date' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(PatientVisit::class, 'visit_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PatientPrescriptionItem::class, 'prescription_id');
    }

    public function dispensings(): HasMany
    {
        return $this->hasMany(PharmacyDispensing::class, 'prescription_id');
    }
}
