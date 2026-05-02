<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Patient extends Model
{
    use Auditable;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'patient_number',
        'cnic',
        'full_name',
        'father_name',
        'gender',
        'date_of_birth',
        'age',
        'photo_path',
        'emergency_contact',
        'blood_group',
        'phone',
        'address',
        'allergies',
        'medical_history',
        'created_by',
        'updated_by',
        'assigned_doctor_id',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'age' => 'integer',
        ];
    }

    public function admissions(): HasMany
    {
        return $this->hasMany(PatientAdmission::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(PatientVisit::class);
    }

    public function diagnoses(): HasMany
    {
        return $this->hasMany(PatientDiagnosis::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(PatientPrescription::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PatientDocument::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function assignedDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_doctor_id');
    }

    public function activeAdmission(): ?PatientAdmission
    {
        return $this->admissions()
            ->where('status', 'admitted')
            ->latest('admission_date')
            ->first();
    }

    public function getComputedAgeAttribute(): ?int
    {
        if ($this->age !== null) {
            return $this->age;
        }

        if (! $this->date_of_birth) {
            return null;
        }

        return Carbon::parse($this->date_of_birth)->age;
    }
}
