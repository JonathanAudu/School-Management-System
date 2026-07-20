<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\HeroSlide;
use App\Models\LeadershipMember;
use App\Models\NewsAnnouncement;
use App\Models\PhotoAlbum;
use App\Models\QuickStat;
use App\Models\WebsiteSetting;
use Illuminate\Database\Seeder;

class WebsiteContentSeeder extends Seeder
{
    /**
     * Seeds every website-facing admin section with real Lumina Academy copy
     * (see lumina_academy_complete.md). Only creates rows that don't already
     * exist, so it's safe to re-run without clobbering admin edits.
     */
    public function run(): void
    {
        $this->seedGeneralSettings();
        $this->seedAboutSettings();
        $this->seedAdmissionsSettings();
        $this->seedAcademicsSettings();
        $this->seedContactSettings();
        $this->seedHomepageSettings();
        $this->seedStaffPageSettings();
        $this->seedStudentLifeSettings();

        $this->seedHeroSlide();
        $this->seedQuickStats();
        $this->seedLeadershipMembers();
        $this->seedNews();
        $this->seedEvents();
        $this->seedPhotoAlbums();
    }

    private function setting(string $key, string $value, string $group, string $type = 'text'): void
    {
        WebsiteSetting::firstOrCreate(['key' => $key], ['value' => $value, 'type' => $type, 'group' => $group]);
    }

    private function seedGeneralSettings(): void
    {
        $this->setting('school_name', 'Lumina Academy', 'general');
        $this->setting('school_address', 'Lagos, Nigeria', 'general');
        $this->setting('school_phone', '+234 800 LUMINA ACAD', 'general');
        $this->setting('school_email', 'admissions@lumina.edu.ng', 'general');
    }

    private function seedAboutSettings(): void
    {
        $this->setting('school_history', '<p>Founded in 1998, Lumina Academy began as a visionary project to bridge the gap between traditional values and modern global demands.</p><p>Our journey is marked by a steadfast refusal to compromise on quality. From our early days, we have integrated Nigerian cultural wisdom with the rigor of international curricula, ensuring our students are as comfortable in Lagos as they are in London or New York.</p><p>Every brick on our campus represents a story of success, resilience, and the unwavering belief that Africa\'s greatest resource is the brilliant minds of its youth.</p>', 'about');
        $this->setting('vision_statement', 'To be recognized internationally as a transformative educational institution that celebrates African identity while setting world-class standards in innovation and scholarship.', 'about');
        $this->setting('mission_statement', 'At Lumina, education transcends textbooks. We are dedicated to providing a holistic environment where ethical leadership, intellectual curiosity, and cultural pride converge to form the foundation of every student\'s journey.', 'about');
        $this->setting('core_values', '<ul><li>Character-based leadership training</li><li>Technological integration in every classroom</li><li>Rich cultural immersion programs</li></ul>', 'about');
    }

    private function seedAdmissionsSettings(): void
    {
        $this->setting('admissions_online_enabled', 'true', 'admissions');
        $this->setting('admissions_deadline', now()->addMonths(2)->format('Y-m-d'), 'admissions');
        $this->setting('admissions_process', '<ol><li><strong>Online Inquiry</strong> — Complete the initial inquiry form to receive our digital prospectus and application link.</li><li><strong>Documentation</strong> — Upload transcripts from previous schools, birth certificates, and passport photographs.</li><li><strong>Entrance Exam</strong> — Sit for our comprehensive entrance examination covering English, Mathematics, and Logic.</li><li><strong>Final Interview</strong> — A meeting with the Admissions Board to discuss goals, values, and academic placement.</li></ol>', 'admissions');
        $this->setting('admissions_requirements', '<ul><li><strong>Academic History</strong> — Certified copies of previous school transcripts (last 3 sessions).</li><li><strong>Identification</strong> — State-recognized birth certificate and 4 passport-sized photographs.</li><li><strong>Medical Fitness</strong> — A comprehensive medical report from a recognized hospital.</li></ul><p><em>International students may require additional visa documentation.</em></p>', 'admissions');
        $this->setting('admissions_fees_format', 'richtext', 'admissions');
        $this->setting('admissions_fees', '<p>Flexible payment plans are available. Please contact the Bursary for more information about tuition and fees for the current academic session.</p>', 'admissions');
    }

    private function seedAcademicsSettings(): void
    {
        $this->setting('academics_overview', '<p>Lumina Academy runs a WASSCE-aligned curriculum that blends rigorous international academic standards with the rich tapestry of Nigerian history, languages, and ethics, preparing students for both West African and global examinations.</p>', 'academics');
        $this->setting('academics_classes', '<p>Our academic structure spans Junior Secondary (JSS1–JSS3) and Senior Secondary (SSS1–SSS3), with small class sizes that keep the student/teacher ratio low and instruction personalized.</p>', 'academics');
        $this->setting('academics_subjects', '<ul><li>Core subjects: English Language, Mathematics, Basic/Integrated Science, Civic Education</li><li>Sciences: Physics, Chemistry, Biology, Further Mathematics</li><li>Arts & Humanities: Literature in English, Government, Economics, Fine Arts</li><li>Languages: French, Yoruba/Igbo/Hausa</li></ul>', 'academics');
    }

    private function seedContactSettings(): void
    {
        $this->setting('contact_address', 'Lumina Academy, Lagos, Nigeria', 'contact');
        $this->setting('contact_phone', '+234 800 LUMINA ACAD', 'contact');
        $this->setting('contact_email', 'admissions@lumina.edu.ng', 'contact');
    }

    private function seedHomepageSettings(): void
    {
        $this->setting('welcome_heading', 'Rooted in Tradition, Aiming for the Stars.', 'homepage');
        $this->setting('welcome_body', '<p>At Lumina Academy, we believe that education should be as diverse and vibrant as our culture. Our curriculum seamlessly integrates rigorous international academic standards with the rich tapestry of Nigerian history, languages, and ethics. We foster an environment of intellectual curiosity, character development, and mutual respect. Our goal is to graduate students who are not just globally competitive but also deeply grounded in their heritage.</p>', 'homepage');
        $this->setting('show_news', 'true', 'homepage');
        $this->setting('show_events', 'true', 'homepage');
        $this->setting('items_to_display', '3', 'homepage');
    }

    private function seedStaffPageSettings(): void
    {
        $this->setting('staff_page_enabled', 'true', 'staff_page');
        $this->setting('staff_show_email', 'true', 'staff_page');
    }

    private function seedStudentLifeSettings(): void
    {
        $this->setting('student_life_overview', '<p>At Lumina, education is an adventure. From the high-stakes of the debating podium to the precision of the robotics lab, we nurture every passion. Lumina students are actively engaged in at least two extracurricular societies.</p>', 'student_life');
        $this->setting('student_life_clubs', '<ul><li><strong>Lumina Robotics Club</strong> — Designing the future through engineering and AI, competing globally in FIRST Robotics and VEX competitions.</li><li><strong>Grandmaster Chess</strong> — Strategic thinking and mental fortitude, hosting bi-weekly tournaments for all levels.</li><li><strong>Oratory & Debating Guild</strong> — Developing the voices of tomorrow\'s leaders, ranked #1 in the National Schools Inter-Collegiate circuit.</li></ul>', 'student_life');
        $this->setting('student_life_sports', '<ul><li><strong>Football</strong> — The Titans: 3-time regional champions.</li><li><strong>Basketball</strong> — Precision and pace on the court.</li><li><strong>Track & Field</strong> — Defining the limits of speed and agility.</li></ul>', 'student_life');
        $this->setting('student_life_achievements', '<p><strong>Spotlight Achievement: National Science Olympiad Winners.</strong> Congratulations to our Grade 11 STEM team for securing 1st place in the National Science Olympiad. Their innovative desalination project was praised for its sustainability and scalability.</p>', 'student_life');
    }

    private function seedHeroSlide(): void
    {
        HeroSlide::firstOrCreate(
            ['title' => 'Nurturing Excellence, Inspiring Heritage.'],
            [
                'subtitle' => 'Empowering the next generation of Nigerian leaders through a unique blend of global academic rigor and deep cultural immersion.',
                'button_text' => 'Explore Our Programs',
                'button_link' => '/academics',
                'order' => 0,
                'is_active' => true,
            ]
        );
    }

    private function seedQuickStats(): void
    {
        $stats = [
            ['icon' => '🎓', 'number' => '95', 'suffix' => '%', 'title' => 'WASSCE Pass Rate', 'order' => 0],
            ['icon' => '👥', 'number' => '12', 'suffix' => ':1', 'title' => 'Student/Teacher Ratio', 'order' => 1],
            ['icon' => '🏆', 'number' => '20', 'suffix' => '+', 'title' => 'Extracurricular Clubs', 'order' => 2],
            ['icon' => '⭐', 'number' => '28', 'suffix' => '+', 'title' => 'Years of Excellence', 'order' => 3],
        ];

        foreach ($stats as $stat) {
            QuickStat::firstOrCreate(['title' => $stat['title']], $stat);
        }
    }

    private function seedLeadershipMembers(): void
    {
        $members = [
            ['name' => 'Dr. Amara Okoro', 'position' => 'School Principal', 'bio' => 'We don\'t just teach students; we empower future icons.', 'order' => 0],
            ['name' => 'Chief Olumide Adeyemi', 'position' => 'Chairman, Board of Governors', 'bio' => 'Over 40 years of experience in educational policy and international law.', 'order' => 1],
            ['name' => 'Mrs. Fatima Yusuf', 'position' => 'Governor, Strategic Development', 'bio' => 'Specialist in technology integration and global academic partnerships.', 'order' => 2],
        ];

        foreach ($members as $member) {
            LeadershipMember::firstOrCreate(['name' => $member['name']], $member);
        }
    }

    private function seedNews(): void
    {
        $items = [
            [
                'title' => 'Science Fair Winners: Innovative Solutions for Local Challenges',
                'category' => 'Academic',
                'published_at' => '2023-10-12',
                'content' => '<p>Our Grade 11 students showcased incredible engineering feats during this year\'s Science and Innovation Fair, tackling real local challenges with ingenuity and rigor.</p>',
            ],
            [
                'title' => 'Celebrating Nigeria Day: A Tapestry of Languages and Art',
                'category' => 'Social',
                'published_at' => '2023-10-05',
                'content' => '<p>The annual Heritage Festival brought together parents, alumni and staff in a vibrant display of traditional attire, music, and cuisine celebrating our Nigerian heritage.</p>',
            ],
            [
                'title' => 'Heritage Falcons Dominate Regional Basketball Finals',
                'category' => 'Sports',
                'published_at' => '2023-09-28',
                'content' => '<p>Our senior varsity team secured their third consecutive championship trophy this weekend after a thrilling final against our closest regional rivals.</p>',
            ],
            [
                'title' => 'Annual Gala: Celebrating 25 Years of Academic Excellence',
                'category' => 'Social',
                'published_at' => '2023-10-18',
                'content' => '<p>Alumni, staff, and families gathered to celebrate 25 years of Lumina Academy\'s legacy of academic excellence and community.</p>',
            ],
            [
                'title' => 'Innovating the Future: Lumina Unveils New STEM Research Hub',
                'category' => 'Academic',
                'published_at' => '2024-10-24',
                'content' => '<p>The academy has officially launched its state-of-the-art research facility, designed to foster interdisciplinary collaboration between physics, engineering, and digital arts students.</p>',
            ],
            [
                'title' => 'Lumina Lions Secure Regional Championship Victory',
                'category' => 'Sports',
                'published_at' => '2024-10-26',
                'content' => '<p>The Lumina Lions varsity team brought home the regional championship trophy after a decisive win in the finals.</p>',
            ],
        ];

        foreach ($items as $item) {
            NewsAnnouncement::firstOrCreate(['title' => $item['title']], $item);
        }
    }

    private function seedEvents(): void
    {
        $events = [
            [
                'title' => 'Open House & Campus Tour',
                'description' => 'Join us for a guided tour of the Lumina Academy campus and meet our faculty and admissions team.',
                'date' => now()->addDays(7)->format('Y-m-d'),
                'time' => '09:00',
                'venue' => 'Main Auditorium',
            ],
            [
                'title' => 'Annual General Meeting & PTA Summit',
                'description' => 'An evening dedicated to discussing school progress, strategic planning for next year, and voting on the new PTA committee members.',
                'date' => now()->addDays(14)->format('Y-m-d'),
                'time' => '18:00',
                'venue' => 'Main Auditorium',
            ],
            [
                'title' => 'Careers & Tertiary Education Fair',
                'description' => 'Representatives from top local and international universities will be present to guide Year 10–12 students on their next steps.',
                'date' => now()->addDays(21)->format('Y-m-d'),
                'time' => '10:00',
                'venue' => 'Exhibition Hall',
            ],
            [
                'title' => 'Inter-School Science Fair',
                'description' => 'Students showcase original science and engineering projects, hosted this year by Lumina Academy.',
                'date' => now()->addDays(30)->format('Y-m-d'),
                'time' => '11:00',
                'venue' => 'Exhibition Hall',
            ],
            [
                'title' => 'Lumina Winter Concert',
                'description' => 'An evening of music and performance from the Lumina Academy choir, band, and student soloists.',
                'date' => now()->addDays(45)->format('Y-m-d'),
                'time' => '18:30',
                'venue' => 'Center for Arts',
            ],
        ];

        foreach ($events as $event) {
            Event::firstOrCreate(['title' => $event['title']], $event);
        }
    }

    private function seedPhotoAlbums(): void
    {
        $albums = [
            ['name' => 'Sports', 'description' => 'Athletics, matches, and championship moments from across the school year.'],
            ['name' => 'Campus Arts', 'description' => 'Creative works, exhibitions, and performances from our Fine Arts and Design students.'],
            ['name' => 'Events', 'description' => 'Highlights from school events, ceremonies, and celebrations.'],
            ['name' => 'Campus Life', 'description' => 'Everyday moments from life on the Lumina Academy campus.'],
        ];

        foreach ($albums as $album) {
            PhotoAlbum::firstOrCreate(['name' => $album['name']], $album);
        }
    }
}
