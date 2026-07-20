<?php

namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;

class StaffSeeder extends Seeder
{
    /**
     * Sample faculty & staff for Lumina Academy, from lumina_academy_complete.md.
     */
    public function run(): void
    {
        $roster = [
            [
                'first_name' => 'Amara', 'last_name' => 'Okoro', 'gender' => 'Female',
                'position' => 'Principal & Head of School', 'staff_type' => 'Teaching',
                'email' => 'amara.okoro@luminaacademy.edu.ng', 'phone' => '+234 801 234 5601',
                'date_of_birth' => '1975-03-14',
            ],
            [
                'first_name' => 'Chidi', 'last_name' => 'Eze', 'gender' => 'Male',
                'position' => 'Head of Science Department', 'staff_type' => 'Teaching',
                'email' => 'chidi.eze@luminaacademy.edu.ng', 'phone' => '+234 801 234 5602',
                'date_of_birth' => '1982-07-02',
            ],
            [
                'first_name' => 'Sarah', 'last_name' => 'Bello', 'gender' => 'Female',
                'position' => 'Fine Arts & Design Teacher', 'staff_type' => 'Teaching',
                'email' => 'sarah.bello@luminaacademy.edu.ng', 'phone' => '+234 801 234 5603',
                'date_of_birth' => '1988-11-23',
            ],
            [
                'first_name' => 'Samuel', 'last_name' => 'Adenuga', 'gender' => 'Male',
                'position' => 'Advanced Mathematics Teacher', 'staff_type' => 'Teaching',
                'email' => 'samuel.adenuga@luminaacademy.edu.ng', 'phone' => '+234 801 234 5604',
                'date_of_birth' => '1979-05-30',
            ],
            [
                'first_name' => 'Janet', 'last_name' => 'Williams', 'gender' => 'Female',
                'position' => 'English Literature Teacher', 'staff_type' => 'Teaching',
                'email' => 'janet.williams@luminaacademy.edu.ng', 'phone' => '+234 801 234 5605',
                'date_of_birth' => '1985-02-18',
            ],
            [
                'first_name' => 'David', 'last_name' => 'Cole', 'gender' => 'Male',
                'position' => 'Student Counselor', 'staff_type' => 'Non-Teaching',
                'email' => 'david.cole@luminaacademy.edu.ng', 'phone' => '+234 801 234 5606',
                'date_of_birth' => '1980-09-09',
            ],
        ];

        $year = date('Y');
        $sequence = Staff::where('staff_id', 'like', "STF/{$year}/%")->count();

        foreach ($roster as $entry) {
            $role = $entry['staff_type'] === 'Teaching' ? 'teacher' : 'staff';
            $name = "{$entry['first_name']} {$entry['last_name']}";

            $user = User::firstOrCreate(
                ['email' => $entry['email']],
                [
                    'name' => $name,
                    'password' => 'password123',
                    'role' => $role,
                    'force_password_reset' => true,
                ]
            );

            $existing = Staff::where('email', $entry['email'])->first();
            if ($existing) {
                continue;
            }

            $sequence++;

            Staff::create([
                'user_id' => $user->id,
                'staff_id' => sprintf('STF/%s/%03d', $year, $sequence),
                'first_name' => $entry['first_name'],
                'last_name' => $entry['last_name'],
                'gender' => $entry['gender'],
                'phone' => $entry['phone'],
                'email' => $entry['email'],
                'date_of_birth' => $entry['date_of_birth'],
                'position' => $entry['position'],
                'staff_type' => $entry['staff_type'],
                'status' => 'Active',
            ]);
        }
    }
}
