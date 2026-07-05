<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AcademicSession;
use App\Models\SchoolClass;
use App\Models\ClassSubject;
use App\Models\StudentSubject;
use App\Models\Student;

class StudentSubjectController extends Controller
{
    public function availableSubjects(Request $request)
    {
        $user = $request->user();
        
        if ($request->filled('student_id') && in_array($user->role, ['admin', 'teacher'])) {
            $student = Student::findOrFail($request->student_id);
        } else {
            if ($user->role !== 'student') {
                return response()->json(['message' => 'Only students can access this endpoint'], 403);
            }
            $student = $user->student;
        }

        if (!$student) {
            return response()->json(['message' => 'Student record not found'], 404);
        }

        if ($request->filled('academic_session_id')) {
            $session = AcademicSession::findOrFail($request->academic_session_id);
        } else {
            $session = AcademicSession::where('status', 'active')->first();
        }

        if (!$session) {
            return response()->json(['message' => 'No active academic session found'], 404);
        }

        $schoolClass = SchoolClass::where('level_name', $student->class)
                                  ->where('arm_name', $student->arm)
                                  ->first();

        if (!$schoolClass) {
            return response()->json(['message' => 'Student class mapping not found'], 404);
        }

        $availableSubjects = ClassSubject::with('subject')
            ->where('school_class_id', $schoolClass->id)
            ->where('academic_session_id', $session->id)
            ->get();

        $registeredSubjects = StudentSubject::where('student_id', $student->id)
            ->where('academic_session_id', $session->id)
            ->get();

        return response()->json([
            'session' => $session,
            'available_subjects' => $availableSubjects,
            'registered_subjects' => $registeredSubjects,
        ]);
    }

    public function registerSubjects(Request $request)
    {
        $request->validate([
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,id',
            'student_id' => 'nullable|exists:students,id',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
        ]);

        $user = $request->user();
        
        if ($request->filled('student_id') && in_array($user->role, ['admin', 'teacher'])) {
            $student = Student::findOrFail($request->student_id);
        } else {
            $student = $user->student;
        }

        if (!$student) {
            return response()->json(['message' => 'Student record not found'], 404);
        }

        if ($request->filled('academic_session_id')) {
            $session = AcademicSession::findOrFail($request->academic_session_id);
        } else {
            $session = AcademicSession::where('status', 'active')->first();
        }

        if (!$session) {
            return response()->json(['message' => 'No active academic session found'], 404);
        }

        // Fetch compulsory subjects for the student's class
        $schoolClass = \App\Models\SchoolClass::where('level_name', $student->class)
                                  ->where('arm_name', $student->arm)
                                  ->first();
        
        $compulsorySubjectIds = [];
        if ($schoolClass) {
            $compulsorySubjectIds = \App\Models\ClassSubject::where('school_class_id', $schoolClass->id)
                ->where('is_compulsory', true)
                ->pluck('subject_id')
                ->toArray();
        }

        $newIds = collect($request->subject_ids)->merge($compulsorySubjectIds)->unique();

        // Get currently registered subjects
        $current = StudentSubject::where('student_id', $student->id)
            ->where('academic_session_id', $session->id)
            ->get()
            ->keyBy('subject_id');

        // Delete subjects that are no longer selected
        $current->each(function($model, $subjectId) use ($newIds) {
            if (!$newIds->contains($subjectId)) {
                $model->delete();
            }
        });

        // Add or update subjects
        foreach ($newIds as $subjectId) {
            $isCompulsory = in_array($subjectId, $compulsorySubjectIds);
            
            // If registered by teacher or admin, auto-approve electives as well!
            $targetStatus = (in_array($user->role, ['admin', 'teacher']) || $isCompulsory) ? 'approved' : 'pending';

            $existing = $current->get($subjectId);
            if (!$existing) {
                StudentSubject::create([
                    'student_id' => $student->id,
                    'subject_id' => $subjectId,
                    'academic_session_id' => $session->id,
                    'status' => $targetStatus
                ]);
            } else {
                if ($isCompulsory) {
                    if ($existing->status !== 'approved') {
                        $existing->update(['status' => 'approved']);
                    }
                } else {
                    if (in_array($user->role, ['admin', 'teacher'])) {
                        if ($existing->status !== 'approved') {
                            $existing->update(['status' => 'approved']);
                        }
                    } else {
                        if ($existing->status === 'rejected') {
                            $existing->update(['status' => 'pending']);
                        }
                    }
                }
            }
        }

        $msg = in_array($user->role, ['admin', 'teacher']) 
            ? 'Subject registration saved and approved successfully.'
            : 'Subject registration saved successfully and is pending teacher approval.';

        return response()->json(['message' => $msg]);
    }

    // Teacher/Admin approval endpoints
    public function getRegistrationApprovals(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'class' => 'required|string',
            'arm' => 'required|string',
        ]);

        $query = Student::with(['registeredSubjects' => function($q) use ($request) {
                $q->where('student_subjects.academic_session_id', $request->academic_session_id);
            }])
            ->where('class', $request->class)
            ->where('arm', $request->arm);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('admission_number', 'like', "%{$search}%");
            });
        }

        $students = $query->get();

        return response()->json($students);
    }

    public function getPendingCount(Request $request)
    {
        $session = AcademicSession::where('status', 'active')->first();
        if (!$session) return response()->json(['count' => 0]);

        $count = StudentSubject::where('academic_session_id', $session->id)
            ->where('status', 'pending')
            ->count();
            
        return response()->json(['count' => $count]);
    }

    public function approveSubject(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $studentSubject = StudentSubject::where('student_id', $request->student_id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_session_id', $request->academic_session_id)
            ->firstOrFail();

        $studentSubject->update(['status' => $request->status]);

        return response()->json(['message' => 'Status updated successfully']);
    }
}
