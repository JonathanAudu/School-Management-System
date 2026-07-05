<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\Staff;
use App\Models\SchoolClass;
use App\Models\ClassSubject;
use App\Models\StudentSubject;
use App\Models\ResultApproval;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function adminMetrics(Request $request)
    {
        // Get current session and term
        $currentSession = AcademicSession::where('status', 'active')->first();
        $currentTerm = null;
        if ($currentSession) {
            $currentTerm = Term::where('academic_session_id', $currentSession->id)
                               ->where('is_current', true)
                               ->first() ?: Term::where('academic_session_id', $currentSession->id)->first();
        }
        
        $sessionString = 'No Active Session';
        if ($currentSession && $currentTerm) {
            $sessionString = $currentSession->name . ' - ' . $currentTerm->name;
        } elseif ($currentSession) {
            $sessionString = $currentSession->name;
        }

        // Get student metrics
        $total = Student::count();
        $active = Student::where('status', 'Active')->count();
        $male = Student::where('gender', 'Male')->count();
        $female = Student::where('gender', 'Female')->count();

        // Chart Data: Students by Gender
        $genderChart = [
            ['name' => 'Male', 'value' => $male],
            ['name' => 'Female', 'value' => $female],
        ];

        // Chart Data: Students by Class
        $classDistribution = Student::selectRaw('class, count(*) as count')
                                    ->whereNotNull('class')
                                    ->groupBy('class')
                                    ->orderBy('class')
                                    ->get()
                                    ->map(function ($item) {
                                        return [
                                            'name' => $item->class,
                                            'students' => $item->count
                                        ];
                                    });

        return response()->json([
            'session' => $sessionString,
            'metrics' => [
                'total' => $total,
                'active' => $active,
                'male' => $male,
                'female' => $female,
                'inactive' => $total - $active
            ],
            'charts' => [
                'gender' => $genderChart,
                'classDistribution' => $classDistribution
            ]
        ]);
    }

    public function staffMetrics(Request $request)
    {
        $user = $request->user();
        
        $staff = Staff::where('user_id', $user->id)->first();
        if (!$staff) {
            return response()->json(['message' => 'Staff record not found.'], 404);
        }

        $currentSession = AcademicSession::where('status', 'active')->first();
        $currentTerm = null;
        if ($currentSession) {
            $currentTerm = Term::where('academic_session_id', $currentSession->id)
                               ->where('is_current', true)
                               ->first() ?: Term::where('academic_session_id', $currentSession->id)->first();
        }

        $sessionString = 'No Active Session';
        if ($currentSession && $currentTerm) {
            $sessionString = $currentSession->name . ' - ' . $currentTerm->name;
        } elseif ($currentSession) {
            $sessionString = $currentSession->name;
        }

        $formClasses = SchoolClass::where('teacher_id', $staff->id)->get();
        $formClassesData = [];
        $isFormMaster = $formClasses->isNotEmpty();

        foreach ($formClasses as $formClass) {
            $studentCount = Student::where('class', $formClass->level_name)
                ->where('arm', $formClass->arm_name)
                ->where('status', 'Active')
                ->count();

            $pendingRegistrationsCount = 0;
            if ($currentSession) {
                $pendingRegistrationsCount = StudentSubject::where('academic_session_id', $currentSession->id)
                    ->where('status', 'pending')
                    ->whereHas('student', function($q) use ($formClass) {
                        $q->where('class', $formClass->level_name)
                          ->where('arm', $formClass->arm_name)
                          ->where('status', 'Active');
                    })
                    ->count();
            }

            // Get result approvals status
            $midTermApproval = null;
            $endTermApproval = null;
            if ($currentSession && $currentTerm) {
                $midTermApproval = ResultApproval::where([
                    'academic_session_id' => $currentSession->id,
                    'term_id' => $currentTerm->id,
                    'term_type' => 'mid_term',
                    'school_class_id' => $formClass->id,
                ])->first();

                $endTermApproval = ResultApproval::where([
                    'academic_session_id' => $currentSession->id,
                    'term_id' => $currentTerm->id,
                    'term_type' => 'end_of_term',
                    'school_class_id' => $formClass->id,
                ])->first();
            }

            $formClassesData[] = [
                'id' => $formClass->id,
                'level_name' => $formClass->level_name,
                'arm_name' => $formClass->arm_name,
                'full_name' => $formClass->full_name,
                'student_count' => $studentCount,
                'pending_registrations' => $pendingRegistrationsCount,
                'approvals' => [
                    'mid_term' => [
                        'form_teacher_status' => $midTermApproval->form_teacher_status ?? 'pending',
                        'admin_status' => $midTermApproval->admin_status ?? 'pending',
                    ],
                    'end_of_term' => [
                        'form_teacher_status' => $endTermApproval->form_teacher_status ?? 'pending',
                        'admin_status' => $endTermApproval->admin_status ?? 'pending',
                    ],
                ]
            ];
        }

        $subjectsTaught = [];
        if ($currentSession) {
            $classSubjects = ClassSubject::with(['subject', 'schoolClass'])
                ->where('staff_id', $staff->id)
                ->where('academic_session_id', $currentSession->id)
                ->get();

            foreach ($classSubjects as $cs) {
                if (!$cs->schoolClass || !$cs->subject) continue;
                
                $regCount = StudentSubject::where('subject_id', $cs->subject_id)
                    ->where('academic_session_id', $currentSession->id)
                    ->where('status', 'approved')
                    ->whereHas('student', function($q) use ($cs) {
                        $q->where('class', $cs->schoolClass->level_name)
                          ->where('arm', $cs->schoolClass->arm_name)
                          ->where('status', 'Active');
                    })
                    ->count();

                $subjectsTaught[] = [
                    'class_subject_id' => $cs->id,
                    'subject_id' => $cs->subject_id,
                    'subject_name' => $cs->subject->name,
                    'class_id' => $cs->school_class_id,
                    'class_name' => $cs->schoolClass->full_name,
                    'registered_students_count' => $regCount,
                ];
            }
        }

        return response()->json([
            'session' => $sessionString,
            'session_id' => $currentSession->id ?? null,
            'term_id' => $currentTerm->id ?? null,
            'is_form_master' => $isFormMaster,
            'form_classes' => $formClassesData,
            'subjects' => $subjectsTaught,
        ]);
    }
}
