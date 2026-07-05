<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SchoolDefaultsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sessions = ['2025/2026', '2026/2027'];
        foreach ($sessions as $i => $session) {
            \App\Models\AcademicSession::firstOrCreate(
                ['name' => $session],
                ['is_current' => $i === 0]
            );
        }

        $terms = ['First Term', 'Second Term', 'Third Term'];
        foreach ($terms as $i => $term) {
            \App\Models\Term::firstOrCreate(
                ['name' => $term],
                ['is_current' => $i === 0]
            );
        }
    }
}
