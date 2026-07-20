<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use App\Models\Term;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SchoolDefaultsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sessions = [
            '2025/2026' => 'active',
            '2026/2027' => 'upcoming',
        ];

        $activeSession = null;
        foreach ($sessions as $name => $status) {
            $session = AcademicSession::firstOrCreate(['name' => $name], ['status' => $status]);
            if ($status === 'active') {
                $activeSession = $session;
            }
        }

        if (! $activeSession) {
            return;
        }

        $terms = ['First Term', 'Second Term', 'Third Term'];
        foreach ($terms as $i => $term) {
            Term::firstOrCreate(
                ['name' => $term, 'academic_session_id' => $activeSession->id],
                ['is_current' => $i === 0]
            );
        }
    }
}
