<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSubject;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class ClassSubjectController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $subjects = ClassSubject::with(['subject.category', 'staff.user'])
            ->where('academic_session_id', $request->academic_session_id)
            ->where('school_class_id', $request->school_class_id)
            ->orderBy('order')
            ->get();

        return response()->json($subjects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'subjects' => 'required|array',
            'subjects.*.subject_id' => 'required|exists:subjects,id',
            'subjects.*.staff_id' => 'nullable|exists:staff,id',
            'subjects.*.is_compulsory' => 'boolean',
            'subjects.*.order' => 'integer',
        ]);

        $session_id = $validated['academic_session_id'];
        $class_id = $validated['school_class_id'];

        // Delete existing that are not in the new list, or maybe just replace all?
        // Let's replace all to make it simpler, but keep IDs if possible?
        // Actually, deleting all and recreating is easiest for mass assignment.
        ClassSubject::where('academic_session_id', $session_id)
            ->where('school_class_id', $class_id)
            ->delete();

        $toInsert = collect($validated['subjects'])->map(function ($subject) use ($session_id, $class_id) {
            return [
                'academic_session_id' => $session_id,
                'school_class_id' => $class_id,
                'subject_id' => $subject['subject_id'],
                'staff_id' => $subject['staff_id'] ?? null,
                'is_compulsory' => $subject['is_compulsory'] ?? true,
                'order' => $subject['order'] ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        ClassSubject::insert($toInsert);

        return response()->json(['message' => 'Class subjects updated successfully']);
    }

    public function copy(Request $request)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'from_school_class_id' => 'required|exists:school_classes,id',
            'to_school_class_id' => 'required|exists:school_classes,id',
        ]);

        $session_id = $validated['academic_session_id'];

        $existingSubjects = ClassSubject::where('academic_session_id', $session_id)
            ->where('school_class_id', $validated['from_school_class_id'])
            ->get();

        if ($existingSubjects->isEmpty()) {
            return response()->json(['message' => 'No subjects found to copy.'], 404);
        }

        // Clear target
        ClassSubject::where('academic_session_id', $session_id)
            ->where('school_class_id', $validated['to_school_class_id'])
            ->delete();

        $toInsert = $existingSubjects->map(function ($subject) use ($validated) {
            return [
                'academic_session_id' => $subject->academic_session_id,
                'school_class_id' => $validated['to_school_class_id'],
                'subject_id' => $subject->subject_id,
                'staff_id' => $subject->staff_id,
                'is_compulsory' => $subject->is_compulsory,
                'order' => $subject->order,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        ClassSubject::insert($toInsert);

        return response()->json(['message' => 'Subjects copied successfully']);
    }
}
