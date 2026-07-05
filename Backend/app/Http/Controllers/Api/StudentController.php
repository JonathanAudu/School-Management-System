<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\AcademicSession;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['academicSession', 'term', 'user']);

        if ($request->class) $query->where('class', $request->class);
        if ($request->arm) $query->where('arm', $request->arm);
        if ($request->gender) $query->where('gender', $request->gender);
        if ($request->status) $query->where('status', $request->status);
        if ($request->session_id) $query->where('academic_session_id', $request->session_id);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('admission_number', 'like', "%{$request->search}%");
            });
        }

        $students = $query->paginate(10);

        // Metrics
        $total = Student::count();
        $active = Student::where('status', 'Active')->count();
        $male = Student::where('gender', 'Male')->count();
        $female = Student::where('gender', 'Female')->count();

        return response()->json([
            'students' => $students,
            'metrics' => [
                'total' => $total,
                'active' => $active,
                'male' => $male,
                'female' => $female,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        
        $validated = $request->validate([
            'first_name' => 'sometimes|string',
            'last_name' => 'sometimes|string',
            'middle_name' => 'nullable|string',
            'class' => 'sometimes|string',
            'arm' => 'sometimes|string',
            'gender' => 'sometimes|string',
            'status' => 'sometimes|string',
            'academic_session_id' => 'sometimes|exists:academic_sessions,id',
            'term_id' => 'sometimes|exists:terms,id',
            'parent_name' => 'nullable|string',
            'parent_email' => 'nullable|email',
            'parent_phone' => 'nullable|string',
        ]);

        $student->update($validated);

        return response()->json(['student' => $student, 'message' => 'Student updated successfully']);
    }

    public function getLookups()
    {
        return response()->json([
            'sessions' => AcademicSession::all(),
            'terms' => Term::all(),
            'classes' => \App\Models\SchoolClass::all(),
        ]);
    }

    private function generateAdmissionNumber($firstName, $lastName)
    {
        $initials = strtoupper(substr($firstName, 0, 1)) . strtoupper(substr($lastName, 0, 1));

        $year = date('Y');
        
        $latestStudent = Student::where('admission_number', 'like', "{$initials}/{$year}/%")
                                ->orderBy('admission_number', 'desc')
                                ->first();

        $sequence = 1;
        if ($latestStudent) {
            $parts = explode('/', $latestStudent->admission_number);
            if (count($parts) === 3) {
                $sequence = (int) $parts[2] + 1;
            }
        }

        return sprintf("%s/%s/%03d", $initials, $year, $sequence);
    }

    private function createUserAndSendOTP($name, $email, $role)
    {
        $user = \App\Models\User::where('email', $email)->first();
        if ($user) return $user;

        $otp = strtoupper(\Illuminate\Support\Str::random(6));
        $user = \App\Models\User::create([
            'name' => $name,
            'email' => $email,
            'password' => $otp,
            'role' => $role,
            'force_password_reset' => true,
        ]);

        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\WelcomeUserMail($user, $otp));

        return $user;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'class' => 'required|string',
            'arm' => 'required|string',
            'gender' => 'required|string',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'student_email' => 'nullable|email|unique:users,email',
            'parent_name' => 'nullable|string',
            'parent_email' => 'nullable|email',
            'parent_phone' => 'nullable|string',
        ]);

        $validated['admission_number'] = $this->generateAdmissionNumber(
            $request->first_name,
            $request->last_name
        );
        $validated['status'] = 'Active';
        $validated['date_admitted'] = date('Y-m-d');

        if (!empty($validated['student_email'])) {
            $studentUser = $this->createUserAndSendOTP("{$validated['first_name']} {$validated['last_name']}", $validated['student_email'], 'student');
            $validated['user_id'] = $studentUser->id;
        }

        if (!empty($validated['parent_email']) && !empty($validated['parent_name'])) {
            $this->createUserAndSendOTP($validated['parent_name'], $validated['parent_email'], 'parent');
        }

        $student = Student::create($validated);

        return response()->json(['student' => $student, 'message' => 'Student added successfully'], 201);
    }

    public function bulkUpload(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'class' => 'required|string',
            'arm' => 'required|string',
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $path = $request->file('file')->getRealPath();
        $data = array_map('str_getcsv', file($path));
        $header = array_shift($data);

        $inserted = 0;
        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                if (count($row) < 2) continue; // Skip empty rows

                $firstName = trim($row[0] ?? '');
                $lastName = trim($row[1] ?? '');
                $middleName = trim($row[2] ?? '');
                $studentEmail = trim($row[3] ?? '');
                $parentName = trim($row[4] ?? '');
                $parentEmail = trim($row[5] ?? '');
                $parentPhone = trim($row[6] ?? '');

                if (empty($firstName) || empty($lastName)) continue;

                $admissionNumber = $this->generateAdmissionNumber($firstName, $lastName);
                $userId = null;

                if (!empty($studentEmail)) {
                    $studentUser = $this->createUserAndSendOTP("{$firstName} {$lastName}", $studentEmail, 'student');
                    $userId = $studentUser->id;
                }

                if (!empty($parentEmail) && !empty($parentName)) {
                    $this->createUserAndSendOTP($parentName, $parentEmail, 'parent');
                }

                Student::create([
                    'user_id' => $userId,
                    'academic_session_id' => $request->academic_session_id,
                    'term_id' => $request->term_id,
                    'class' => $request->class,
                    'arm' => $request->arm,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'middle_name' => $middleName,
                    'student_email' => $studentEmail,
                    'admission_number' => $admissionNumber,
                    'status' => 'Active',
                    'date_admitted' => date('Y-m-d'),
                    'parent_name' => $parentName,
                    'parent_email' => $parentEmail,
                    'parent_phone' => $parentPhone,
                ]);
                
                $inserted++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to process file: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => "Successfully imported {$inserted} students."]);
    }

    public function exportCsv(Request $request)
    {
        $query = Student::with(['academicSession', 'term', 'user']);

        if ($request->class) $query->where('class', $request->class);
        if ($request->arm) $query->where('arm', $request->arm);
        if ($request->gender) $query->where('gender', $request->gender);
        if ($request->status) $query->where('status', $request->status);
        if ($request->session_id) $query->where('academic_session_id', $request->session_id);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('admission_number', 'like', "%{$request->search}%");
            });
        }

        $students = $query->get();

        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=students_export.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = ['Admission Number', 'First Name', 'Middle Name', 'Last Name', 'Class', 'Arm', 'Gender', 'Status', 'Session', 'Term', 'Parent Name', 'Parent Email', 'Parent Phone', 'Date Admitted'];

        $callback = function() use($students, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($students as $student) {
                $row = [
                    $student->admission_number,
                    $student->first_name,
                    $student->middle_name,
                    $student->last_name,
                    $student->class,
                    $student->arm,
                    $student->gender,
                    $student->status,
                    $student->academicSession->name ?? '',
                    $student->term->name ?? '',
                    $student->parent_name,
                    $student->parent_email,
                    $student->parent_phone,
                    $student->date_admitted,
                ];
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function getDashboardNotifications()
    {
        $student = Student::where('user_id', auth()->id())->first();
        if (!$student) {
            return response()->json([]);
        }

        $currentSession = AcademicSession::where('status', 'active')->first() ?: AcademicSession::first();
        $currentTerm = null;
        if ($currentSession) {
            $currentTerm = Term::where('academic_session_id', $currentSession->id)
                               ->where('is_current', true)
                               ->first() ?: Term::where('academic_session_id', $currentSession->id)->first();
        }
        if (!$currentTerm) {
            $currentTerm = Term::first();
        }

        if (!$currentSession || !$currentTerm) {
            return response()->json([]);
        }

        $notifications = [];

        // 1. Welcome / Term Start Info
        $notifications[] = [
            'id' => 'term_info',
            'type' => 'info',
            'title' => 'Academic Term Commencement',
            'message' => "Welcome to {$currentTerm->name} of the {$currentSession->name} academic session.",
        ];

        // 2. Subject Registration alerts
        $registeredSubjects = DB::table('student_subjects')
            ->where('student_id', $student->id)
            ->where('academic_session_id', $currentSession->id)
            ->get();

        if ($registeredSubjects->isEmpty()) {
            $notifications[] = [
                'id' => 'subjects_register',
                'type' => 'warning',
                'title' => 'Subject Selection Required',
                'message' => 'You have not registered for any subjects in the current session. Please select your subjects to continue.',
                'link' => '/student/subjects',
                'action_text' => 'Select Subjects',
            ];
        } else {
            $hasPending = $registeredSubjects->contains('status', 'pending');
            if ($hasPending) {
                $notifications[] = [
                    'id' => 'subjects_pending',
                    'type' => 'info',
                    'title' => 'Subject Selection Pending',
                    'message' => 'Your subject selection has been submitted and is currently awaiting administrator review.',
                    'link' => '/student/subjects',
                    'action_text' => 'View Selection',
                ];
            }
        }

        // 3. Results Publication alerts
        $schoolClass = \App\Models\SchoolClass::where('level_name', $student->class)
            ->where('arm_name', $student->arm)
            ->first();

        if ($schoolClass) {
            $approval = DB::table('result_approvals')
                ->where('academic_session_id', $currentSession->id)
                ->where('term_id', $currentTerm->id)
                ->where('school_class_id', $schoolClass->id)
                ->first();

            if ($approval && $approval->form_teacher_status === 'approved' && $approval->admin_status === 'approved') {
                $notifications[] = [
                    'id' => 'results_approved',
                    'type' => 'success',
                    'title' => 'Term Results Published',
                    'message' => 'Your academic report card for the current term has been approved by the Form Master and Principal.',
                    'link' => '/student/grades',
                    'action_text' => 'View Report Card',
                ];
            }
        }

        return response()->json($notifications);
    }

    public function getMyClassDetails()
    {
        $student = Student::where('user_id', auth()->id())->first();
        if (!$student) {
            return response()->json(['message' => 'Student record not found.'], 404);
        }

        $currentSession = AcademicSession::where('status', 'active')->first() ?: AcademicSession::first();
        if (!$currentSession) {
            return response()->json(['message' => 'Active session not found.'], 404);
        }

        $schoolClass = \App\Models\SchoolClass::with(['teacher.user'])
            ->where('level_name', $student->class)
            ->where('arm_name', $student->arm)
            ->first();

        if (!$schoolClass) {
            return response()->json([
                'class' => [
                    'level_name' => $student->class,
                    'arm_name' => $student->arm,
                    'full_name' => "{$student->class} {$student->arm}",
                    'teacher_name' => 'Not Assigned',
                ],
                'subjects' => [],
            ]);
        }

        // Get class subjects
        $classSubjects = \App\Models\ClassSubject::with(['subject.category', 'staff.user'])
            ->where('school_class_id', $schoolClass->id)
            ->where('academic_session_id', $currentSession->id)
            ->orderBy('order')
            ->get();

        // Get student's registered subject IDs
        $registeredSubjectIds = DB::table('student_subjects')
            ->where('student_id', $student->id)
            ->where('academic_session_id', $currentSession->id)
            ->pluck('subject_id')
            ->toArray();

        $subjects = $classSubjects->map(function ($cs) use ($registeredSubjectIds) {
            $teacherName = 'Not Assigned';
            $teacherEmail = '';
            if ($cs->staff) {
                $teacherName = "{$cs->staff->first_name} {$cs->staff->last_name}";
                $teacherEmail = $cs->staff->email ?? ($cs->staff->user->email ?? '');
            }

            return [
                'id' => $cs->id,
                'subject_id' => $cs->subject_id,
                'name' => $cs->subject->name ?? 'Unknown Subject',
                'code' => $cs->subject->code ?? '',
                'category' => $cs->subject->category->name ?? 'General',
                'teacher_name' => $teacherName,
                'teacher_email' => $teacherEmail,
                'is_compulsory' => (bool)$cs->is_compulsory,
                'is_registered' => in_array($cs->subject_id, $registeredSubjectIds),
            ];
        });

        $teacherName = 'Not Assigned';
        if ($schoolClass->teacher) {
            $teacherName = "{$schoolClass->teacher->first_name} {$schoolClass->teacher->last_name}";
        }

        return response()->json([
            'class' => [
                'id' => $schoolClass->id,
                'level_name' => $schoolClass->level_name,
                'arm_name' => $schoolClass->arm_name,
                'full_name' => $schoolClass->full_name,
                'teacher_name' => $teacherName,
            ],
            'subjects' => $subjects,
        ]);
    }

    public function getMyGrades(Request $request)
    {
        $student = Student::where('user_id', auth()->id())->first();
        if (!$student) {
            return response()->json(['message' => 'Student record not found.'], 404);
        }

        // Available lookups
        $sessions = AcademicSession::orderBy('name', 'desc')->get();
        $terms = Term::all();

        $activeSession = AcademicSession::where('status', 'active')->first() ?: AcademicSession::first();
        $activeTerm = null;
        if ($activeSession) {
            $activeTerm = Term::where('academic_session_id', $activeSession->id)
                               ->where('is_current', true)
                               ->first() ?: Term::where('academic_session_id', $activeSession->id)->first();
        }
        if (!$activeTerm) {
            $activeTerm = Term::first();
        }

        $defaultSessionId = $student->academic_session_id ?? ($activeSession ? $activeSession->id : null);
        $defaultTermId = $student->term_id ?? ($activeTerm ? $activeTerm->id : null);

        $academicSessionId = $request->query('academic_session_id', $defaultSessionId);
        $termId = $request->query('term_id', $defaultTermId);
        $termType = $request->query('term_type', 'end_of_term');

        if (!$academicSessionId || !$termId) {
            return response()->json([
                'sessions' => $sessions,
                'terms' => $terms,
                'default_session_id' => $defaultSessionId,
                'default_term_id' => $defaultTermId,
                'enrolled' => false,
                'released' => false,
                'results' => [],
                'summary' => null,
            ]);
        }

        // Find the class ID for the student in this session
        $enrollment = DB::table('student_enrollments')
            ->where('student_id', $student->id)
            ->where('academic_session_id', $academicSessionId)
            ->first();

        $classId = null;
        if ($enrollment) {
            $classId = $enrollment->school_class_id;
        } else {
            // Fallback 1: check if current student record matches this session
            $schoolClass = \App\Models\SchoolClass::where('level_name', $student->class)
                ->where('arm_name', $student->arm)
                ->first();
            if ($schoolClass && $student->academic_session_id == $academicSessionId) {
                $classId = $schoolClass->id;
            } else {
                // Fallback 2: pluck from student results
                $firstResult = \App\Models\StudentResult::where('student_id', $student->id)
                    ->where('academic_session_id', $academicSessionId)
                    ->first();
                if ($firstResult) {
                    $classId = $firstResult->school_class_id;
                }
            }
        }

        if (!$classId) {
            return response()->json([
                'sessions' => $sessions,
                'terms' => $terms,
                'default_session_id' => $defaultSessionId,
                'default_term_id' => $defaultTermId,
                'enrolled' => false,
                'released' => false,
                'results' => [],
                'summary' => null,
            ]);
        }

        $schoolClass = \App\Models\SchoolClass::find($classId);

        // Check if results are approved by Form Master & Principal
        $approval = DB::table('result_approvals')
            ->where('academic_session_id', $academicSessionId)
            ->where('term_id', $termId)
            ->where('school_class_id', $classId)
            ->first();

        $isReleased = $approval && $approval->form_teacher_status === 'approved' && $approval->admin_status === 'approved';

        if (!$isReleased) {
            return response()->json([
                'student_id' => $student->id,
                'sessions' => $sessions,
                'terms' => $terms,
                'default_session_id' => $defaultSessionId,
                'default_term_id' => $defaultTermId,
                'enrolled' => true,
                'released' => false,
                'results' => [],
                'summary' => null,
                'class' => $schoolClass ? [
                    'id' => $schoolClass->id,
                    'full_name' => $schoolClass->full_name,
                ] : null,
            ]);
        }

        // Fetch student results
        $results = \App\Models\StudentResult::with('subject.category')
            ->where([
                'student_id' => $student->id,
                'academic_session_id' => $academicSessionId,
                'term_id' => $termId,
                'term_type' => $termType,
                'school_class_id' => $classId,
            ])->get();

        $formattedResults = $results->map(function ($res) {
            return [
                'id' => $res->id,
                'subject_name' => $res->subject->name ?? 'Unknown',
                'subject_code' => $res->subject->code ?? 'N/A',
                'category' => $res->subject->category->name ?? 'General',
                'ca1' => $res->ca1,
                'ca2' => $res->ca2,
                'exam' => $res->exam,
                'total_score' => $res->total_score,
                'grade' => $res->grade,
                'remark' => $res->remark,
            ];
        });

        // Compute rankings
        // Get all students enrolled in this class for the session
        $studentIds = DB::table('student_enrollments')
            ->where('academic_session_id', $academicSessionId)
            ->where('school_class_id', $classId)
            ->pluck('student_id')
            ->toArray();

        if (!in_array($student->id, $studentIds)) {
            $studentIds[] = $student->id;
        }

        // Fetch all results for these student IDs
        $allClassResults = \App\Models\StudentResult::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $academicSessionId)
            ->where('term_id', $termId)
            ->where('term_type', $termType)
            ->where('school_class_id', $classId)
            ->get();

        $leaderboard = [];
        foreach ($studentIds as $sId) {
            $studentResults = $allClassResults->where('student_id', $sId)->whereNotNull('total_score');
            $subCount = $studentResults->count();
            if ($subCount > 0) {
                $totScore = $studentResults->sum('total_score');
                $avgScore = $totScore / $subCount;
                $leaderboard[] = [
                    'student_id' => $sId,
                    'total_score' => $totScore,
                    'average_score' => $avgScore,
                ];
            }
        }

        // Sort by average score descending
        usort($leaderboard, function ($a, $b) {
            return $b['average_score'] <=> $a['average_score'];
        });

        // Assign ranks (handling ties)
        $currentRank = 0;
        $prevAverage = -1;
        $rankOffset = 1;
        $studentRank = '-';
        foreach ($leaderboard as $entry) {
            if ($entry['average_score'] != $prevAverage) {
                $currentRank += $rankOffset;
                $rankOffset = 1;
            } else {
                $rankOffset++;
            }
            if ($entry['student_id'] == $student->id) {
                $studentRank = $currentRank;
                break;
            }
            $prevAverage = $entry['average_score'];
        }

        $totalScore = $results->sum('total_score');
        $averageScore = $results->count() > 0 ? round($totalScore / $results->count(), 1) : 0;

        return response()->json([
            'student_id' => $student->id,
            'sessions' => $sessions,
            'terms' => $terms,
            'default_session_id' => $defaultSessionId,
            'default_term_id' => $defaultTermId,
            'enrolled' => true,
            'released' => true,
            'results' => $formattedResults,
            'summary' => [
                'total_score' => $totalScore,
                'average_score' => $averageScore,
                'subjects_count' => $results->count(),
                'class_rank' => is_numeric($studentRank) ? $this->getOrdinal($studentRank) : $studentRank,
                'class_size' => count($leaderboard),
            ],
            'class' => $schoolClass ? [
                'id' => $schoolClass->id,
                'full_name' => $schoolClass->full_name,
            ] : null,
        ]);
    }

    private function getOrdinal($number) {
        if (!is_numeric($number)) return $number;
        $ends = array('th','st','nd','rd','th','th','th','th','th','th');
        if ((($number % 100) >= 11) && (($number % 100) <= 13))
            return $number. 'th';
        else
            return $number. $ends[$number % 10];
    }
}
