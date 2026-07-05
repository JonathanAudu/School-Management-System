<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentResult;
use App\Models\StudentEnrollment;
use App\Models\SchoolClass;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    public function getPromotionCandidates(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $schoolClass = SchoolClass::findOrFail($request->school_class_id);

        $students = Student::where('class', $schoolClass->level_name)
            ->where('arm', $schoolClass->arm_name)
            ->where('status', 'Active')
            ->get();

        $candidates = [];

        foreach ($students as $student) {
            $results = StudentResult::where([
                'student_id' => $student->id,
                'academic_session_id' => $request->academic_session_id,
            ])->whereNotNull('total_score')->get();

            $subCount = $results->count();
            $average = $subCount > 0 ? round($results->avg('total_score'), 1) : 0;
            
            // Standard recommended logic: promote if average is 45% or above
            $recommendation = $average >= 45 ? 'promote' : 'repeat';

            $candidates[] = [
                'id' => $student->id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'admission_number' => $student->admission_number,
                'session_average' => $average,
                'subjects_count' => $subCount,
                'recommendation' => $recommendation,
            ];
        }

        return response()->json([
            'class' => [
                'id' => $schoolClass->id,
                'full_name' => $schoolClass->full_name,
                'level_name' => $schoolClass->level_name,
                'arm_name' => $schoolClass->arm_name,
            ],
            'candidates' => $candidates,
        ]);
    }

    public function promoteStudents(Request $request)
    {
        $request->validate([
            'source_academic_session_id' => 'required|exists:academic_sessions,id',
            'target_academic_session_id' => 'required|exists:academic_sessions,id',
            'source_school_class_id' => 'required|exists:school_classes,id',
            'promotions' => 'required|array',
            'promotions.*.student_id' => 'required|exists:students,id',
            'promotions.*.action' => 'required|in:promote,repeat',
            'promotions.*.target_school_class_id' => 'required_if:promotions.*.action,promote|nullable|exists:school_classes,id',
        ]);

        DB::beginTransaction();

        try {
            foreach ($request->promotions as $promo) {
                $student = Student::findOrFail($promo['student_id']);
                $action = $promo['action'];

                if ($action === 'promote') {
                    $targetClass = SchoolClass::findOrFail($promo['target_school_class_id']);

                    // Update/Create historical enrollment record
                    StudentEnrollment::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'academic_session_id' => $request->source_academic_session_id,
                            'school_class_id' => $request->source_school_class_id,
                        ],
                        [
                            'status' => 'promoted',
                        ]
                    );

                    // Create new active enrollment record
                    StudentEnrollment::create([
                        'student_id' => $student->id,
                        'academic_session_id' => $request->target_academic_session_id,
                        'school_class_id' => $targetClass->id,
                        'status' => 'active',
                    ]);

                    // Update current status on student
                    $student->update([
                        'class' => $targetClass->level_name,
                        'arm' => $targetClass->arm_name,
                        'academic_session_id' => $request->target_academic_session_id,
                    ]);

                } else { // repeat
                    // Update/Create historical enrollment record
                    StudentEnrollment::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'academic_session_id' => $request->source_academic_session_id,
                            'school_class_id' => $request->source_school_class_id,
                        ],
                        [
                            'status' => 'repeated',
                        ]
                    );

                    // Create new active enrollment record (in the same class, but new session)
                    StudentEnrollment::create([
                        'student_id' => $student->id,
                        'academic_session_id' => $request->target_academic_session_id,
                        'school_class_id' => $request->source_school_class_id,
                        'status' => 'active',
                    ]);

                    // Update current status on student
                    $student->update([
                        'academic_session_id' => $request->target_academic_session_id,
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Bulk promotions processed successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'An error occurred during promotion: ' . $e->getMessage()
            ], 500);
        }
    }
}
