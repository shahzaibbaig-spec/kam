<?php

namespace Database\Seeders;

use App\Enums\UserStatus;
use App\Models\Department;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;

class HospitalUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = 'BurnCenter@123';

        $users = [
            ['name' => 'Amina Siddiqui', 'email' => 'super.admin@kort.local', 'employee_id' => 'KORT-0001', 'designation' => 'System Administrator', 'department' => 'PROC', 'location' => 'LOC-CBST-03', 'role' => 'Super Admin'],
            ['name' => 'Dr. Haris Malik', 'email' => 'hospital.admin@kort.local', 'employee_id' => 'KORT-0002', 'designation' => 'Hospital Administrator', 'department' => 'FIN', 'location' => 'LOC-CBST-03', 'role' => 'Hospital Admin'],
            ['name' => 'Dr. Sana Qureshi', 'email' => 'burn.manager@kort.local', 'employee_id' => 'KORT-0003', 'designation' => 'Burn Center Manager', 'department' => 'BICU', 'location' => 'LOC-BICU-01', 'role' => 'Burn Center Manager / Department Head'],
            ['name' => 'Usman Riaz', 'email' => 'store.manager@kort.local', 'employee_id' => 'KORT-0004', 'designation' => 'Store Manager', 'department' => 'CBST', 'location' => 'LOC-CBST-01', 'role' => 'Store Manager / Inventory Officer'],
            ['name' => 'Engr. Mahnoor Ali', 'email' => 'biomedical@kort.local', 'employee_id' => 'KORT-0005', 'designation' => 'Biomedical Engineer', 'department' => 'BME', 'location' => 'LOC-BME-01', 'role' => 'Biomedical Engineer'],
            ['name' => 'Nadia Rehman', 'email' => 'nurse.supervisor@kort.local', 'employee_id' => 'KORT-0006', 'designation' => 'Nurse Supervisor', 'department' => 'BWRD', 'location' => 'LOC-BWRD-01', 'role' => 'Nurse Supervisor'],
            ['name' => 'Rabia Iftikhar', 'email' => 'staff.nurse@kort.local', 'employee_id' => 'KORT-0007', 'designation' => 'Staff Nurse', 'department' => 'BICU', 'location' => 'LOC-BICU-02', 'role' => 'Staff Nurse / Clinical User'],
            ['name' => 'Farhan Yousaf', 'email' => 'pharmacist@kort.local', 'employee_id' => 'KORT-0008', 'designation' => 'Pharmacist', 'department' => 'BPH', 'location' => 'LOC-BPH-01', 'role' => 'Pharmacist / Medical Store Staff'],
            ['name' => 'Kiran Abbas', 'email' => 'procurement@kort.local', 'employee_id' => 'KORT-0009', 'designation' => 'Procurement Officer', 'department' => 'PROC', 'location' => 'LOC-CBST-03', 'role' => 'Procurement Officer'],
            ['name' => 'Umair Hassan', 'email' => 'finance@kort.local', 'employee_id' => 'KORT-0010', 'designation' => 'Finance Analyst', 'department' => 'FIN', 'location' => 'LOC-CBST-03', 'role' => 'Accounts / Finance'],
            ['name' => 'Hiba Mansoor', 'email' => 'auditor@kort.local', 'employee_id' => 'KORT-0011', 'designation' => 'Internal Auditor', 'department' => 'FIN', 'location' => 'LOC-CBST-03', 'role' => 'Auditor'],
        ];

        foreach ($users as $attributes) {
            $department = Department::query()->where('code', $attributes['department'])->first();
            $location = Location::query()->where('code', $attributes['location'])->first();

            $user = User::query()->updateOrCreate(
                ['email' => $attributes['email']],
                [
                    'department_id' => $department?->id,
                    'default_location_id' => $location?->id,
                    'name' => $attributes['name'],
                    'employee_id' => $attributes['employee_id'],
                    'phone' => '+92-300-0000000',
                    'designation' => $attributes['designation'],
                    'status' => UserStatus::Active,
                    'password' => $password,
                    'password_changed_at' => now(),
                ]
            );

            $user->syncRoles([$attributes['role']]);
        }

        Department::query()->where('code', 'BICU')->update([
            'manager_user_id' => User::query()->where('email', 'burn.manager@kort.local')->value('id'),
        ]);

        Department::query()->where('code', 'CBST')->update([
            'manager_user_id' => User::query()->where('email', 'store.manager@kort.local')->value('id'),
        ]);
    }
}
