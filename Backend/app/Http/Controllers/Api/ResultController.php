<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\ClassSubject;
use App\Models\StudentResult;
use App\Models\GradingScale;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    public function getGrid(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'term_type' => 'required|in:mid_term,end_of_term',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $schoolClass = \App\Models\SchoolClass::findOrFail($request->school_class_id);
        $students = Student::where('class', $schoolClass->level_name)
            ->where('arm', $schoolClass->arm_name)
            ->where('status', 'Active')
            ->with(['registeredSubjects' => function($q) use ($request) {
                $q->where('student_subjects.academic_session_id', $request->academic_session_id)
                  ->where('student_subjects.status', 'approved'); // Only show if approved
            }])
            ->get();
            
        $classSubjects = ClassSubject::with('subject')
            ->where('academic_session_id', $request->academic_session_id)
            ->where('school_class_id', $request->school_class_id)
            ->get();

        $results = StudentResult::where([
            'academic_session_id' => $request->academic_session_id,
            'term_id' => $request->term_id,
            'term_type' => $request->term_type,
            'school_class_id' => $request->school_class_id,
        ])->get();

        $approval = \App\Models\ResultApproval::where([
            'academic_session_id' => $request->academic_session_id,
            'term_id' => $request->term_id,
            'term_type' => $request->term_type,
            'school_class_id' => $request->school_class_id,
        ])->first();

        return response()->json([
            'students' => $students,
            'subjects' => $classSubjects,
            'results' => $results,
            'approval' => $approval,
        ]);
    }

    public function saveResults(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'term_type' => 'required|in:mid_term,end_of_term',
            'school_class_id' => 'required|exists:school_classes,id',
            'results' => 'required|array',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.subject_id' => 'required|exists:subjects,id',
            'results.*.ca1' => 'nullable|numeric|min:0|max:100',
            'results.*.ca2' => 'nullable|numeric|min:0|max:100',
            'results.*.exam' => 'nullable|numeric|min:0|max:100',
        ]);

        $approval = \App\Models\ResultApproval::where([
            'academic_session_id' => $request->academic_session_id,
            'term_id' => $request->term_id,
            'term_type' => $request->term_type,
            'school_class_id' => $request->school_class_id,
        ])->first();

        if ($approval && ($approval->form_teacher_status === 'approved' || $approval->admin_status === 'approved')) {
            return response()->json(['message' => 'Results have already been approved and signed off, and cannot be modified.'], 403);
        }

        $scales = GradingScale::orderBy('min_score', 'desc')->get();

        foreach ($request->results as $res) {
            $ca1 = isset($res['ca1']) && $res['ca1'] !== '' ? (float)$res['ca1'] : null;
            $ca2 = isset($res['ca2']) && $res['ca2'] !== '' ? (float)$res['ca2'] : null;
            $exam = isset($res['exam']) && $res['exam'] !== '' ? (float)$res['exam'] : null;

            $total = 0;
            $hasScore = false;
            if ($ca1 !== null) { $total += $ca1; $hasScore = true; }
            if ($ca2 !== null) { $total += $ca2; $hasScore = true; }
            if ($exam !== null) { $total += $exam; $hasScore = true; }

            $grade = null;
            $remark = null;

            if ($hasScore) {
                foreach ($scales as $scale) {
                    if ($total >= $scale->min_score && $total <= $scale->max_score) {
                        $grade = $scale->grade;
                        $remark = $scale->remark;
                        break;
                    }
                }
            }

            StudentResult::updateOrCreate(
                [
                    'student_id' => $res['student_id'],
                    'academic_session_id' => $request->academic_session_id,
                    'term_id' => $request->term_id,
                    'term_type' => $request->term_type,
                    'school_class_id' => $request->school_class_id,
                    'subject_id' => $res['subject_id'],
                ],
                [
                    'ca1' => $ca1,
                    'ca2' => $ca2,
                    'exam' => $exam,
                    'total_score' => $hasScore ? $total : null,
                    'grade' => $grade,
                    'remark' => $remark,
                    'entered_by' => auth()->id() ?? 1, // fallback to 1 if auth fails in local testing without full auth
                ]
            );
        }

        return response()->json(['message' => 'Results saved successfully']);
    }

    public function getPerformanceOverview(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'term_type' => 'required|in:mid_term,end_of_term',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $schoolClass = \App\Models\SchoolClass::findOrFail($request->school_class_id);
        
        $students = Student::where('class', $schoolClass->level_name)
            ->where('arm', $schoolClass->arm_name)
            ->where('status', 'Active')
            ->get();

        $results = StudentResult::where([
            'academic_session_id' => $request->academic_session_id,
            'term_id' => $request->term_id,
            'term_type' => $request->term_type,
            'school_class_id' => $request->school_class_id,
        ])->get();

        // Calculate Class summary metrics
        $totalScoresCount = $results->whereNotNull('total_score')->count();
        $classAverage = $totalScoresCount > 0 ? round($results->avg('total_score'), 1) : 0;
        $highScore = $totalScoresCount > 0 ? $results->max('total_score') : 0;
        $lowScore = $totalScoresCount > 0 ? $results->min('total_score') : 0;
        $passingCount = $results->where('total_score', '>=', 45)->count();
        $passRate = $totalScoresCount > 0 ? round(($passingCount / $totalScoresCount) * 100, 1) : 0;

        // Grade Distribution
        $scales = GradingScale::orderBy('min_score', 'desc')->get();
        if ($scales->isEmpty()) {
            $defaults = [
                ['min_score' => 70, 'max_score' => 100, 'grade' => 'A', 'remark' => 'Excellent'],
                ['min_score' => 60, 'max_score' => 69, 'grade' => 'B', 'remark' => 'Very Good'],
                ['min_score' => 50, 'max_score' => 59, 'grade' => 'C', 'remark' => 'Good'],
                ['min_score' => 45, 'max_score' => 49, 'grade' => 'D', 'remark' => 'Pass'],
                ['min_score' => 0, 'max_score' => 44, 'grade' => 'F', 'remark' => 'Fail'],
            ];
            foreach ($defaults as $default) {
                GradingScale::create($default);
            }
            $scales = GradingScale::orderBy('min_score', 'desc')->get();
        }

        $gradeDistribution = [];
        foreach ($scales as $scale) {
            $gradeDistribution[] = [
                'grade' => $scale->grade,
                'count' => $results->where('grade', $scale->grade)->count()
            ];
        }

        // Subject Performance
        $classSubjects = ClassSubject::with('subject')
            ->where('academic_session_id', $request->academic_session_id)
            ->where('school_class_id', $request->school_class_id)
            ->get();

        $subjectPerformance = [];
        foreach ($classSubjects as $cs) {
            $subjectResults = $results->where('subject_id', $cs->subject_id)->whereNotNull('total_score');
            $subCount = $subjectResults->count();
            
            $subjectPerformance[] = [
                'id' => $cs->subject_id,
                'name' => $cs->subject->name ?? 'Unknown',
                'code' => $cs->subject->code ?? 'N/A',
                'average' => $subCount > 0 ? round($subjectResults->avg('total_score'), 1) : 0,
                'high' => $subCount > 0 ? $subjectResults->max('total_score') : 0,
                'low' => $subCount > 0 ? $subjectResults->min('total_score') : 0,
                'pass_rate' => $subCount > 0 ? round(($subjectResults->where('total_score', '>=', 45)->count() / $subCount) * 100, 1) : 0,
            ];
        }

        // Student Rankings (Leaderboard)
        $leaderboard = [];
        foreach ($students as $student) {
            $studentResults = $results->where('student_id', $student->id)->whereNotNull('total_score');
            $subCount = $studentResults->count();
            $totalScore = $studentResults->sum('total_score');
            $averageScore = $subCount > 0 ? round($totalScore / $subCount, 1) : 0;

            $leaderboard[] = [
                'student_id' => $student->id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'admission_number' => $student->admission_number,
                'total_score' => $totalScore,
                'average_score' => $averageScore,
                'subjects_count' => $subCount,
            ];
        }

        // Sort leaderboard descending by average score
        usort($leaderboard, function ($a, $b) {
            return $b['average_score'] <=> $a['average_score'];
        });

        // Assign ranks (with tie-handling)
        $currentRank = 0;
        $prevAverage = -1;
        $rankOffset = 1;
        foreach ($leaderboard as &$entry) {
            if ($entry['average_score'] == 0 && $entry['subjects_count'] == 0) {
                // If student has no results, don't rank them or give last rank
                $entry['rank'] = '-';
                continue;
            }
            if ($entry['average_score'] != $prevAverage) {
                $currentRank += $rankOffset;
                $rankOffset = 1;
            } else {
                $rankOffset++;
            }
            $entry['rank'] = $currentRank;
            $prevAverage = $entry['average_score'];
        }

        return response()->json([
            'class' => [
                'id' => $schoolClass->id,
                'full_name' => $schoolClass->full_name,
                'level_name' => $schoolClass->level_name,
                'arm_name' => $schoolClass->arm_name,
            ],
            'summary' => [
                'class_average' => $classAverage,
                'high_score' => $highScore,
                'low_score' => $lowScore,
                'pass_rate' => $passRate,
                'total_students' => $students->count(),
                'graded_count' => $totalScoresCount,
            ],
            'grade_distribution' => $gradeDistribution,
            'subject_performance' => $subjectPerformance,
            'leaderboard' => $leaderboard,
        ]);
    }
}
