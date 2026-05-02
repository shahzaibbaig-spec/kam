<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientVisit extends Model
{
    use Auditable;
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'admission_id',
        'department_id',
        'visit_number',
        'visit_type',
        'doctor_id',
        'visit_date',
        'chief_complaint',
        'vitals',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function admission(): BelongsTo
    {
        return $this->belongsTo(PatientAdmission::class, 'admission_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function diagnoses(): HasMany
    {
        return $this->hasMany(PatientDiagnosis::class, 'visit_id');
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(PatientPrescription::class, 'visit_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PatientDocument::class, 'visit_id');
    }
}
