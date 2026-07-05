<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SchoolClassController extends Controller
{
    public function index()
    {
        return response()->json([
            'school_classes' => SchoolClass::with('teacher')->orderBy('level_name')->orderBy('arm_name')->get()
        ]);
    }

    public function show($id)
    {
        $schoolClass = SchoolClass::with('teacher')->findOrFail($id);
        
        $studentsCount = \App\Models\Student::where('class', $schoolClass->level_name)
                                            ->where('arm', $schoolClass->arm_name)
                                            ->where('status', 'Active')
                                            ->count();

        $schoolClass->students_count = $studentsCount;

        return response()->json([
            'school_class' => $schoolClass
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'level_name' => 'required|string|max:255',
            'arm_name' => 'required|string|max:255',
            'capacity' => 'nullable|integer',
            'teacher_id' => 'nullable|exists:staff,id',
            'room_number' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['full_name'] = $validated['level_name'] . ' ' . $validated['arm_name'];
        if (!isset($validated['is_active'])) $validated['is_active'] = true;

        if (SchoolClass::where('full_name', $validated['full_name'])->exists()) {
            return response()->json(['message' => 'A class with this full name already exists.'], 422);
        }

        $schoolClass = SchoolClass::create($validated);
        $schoolClass->load('teacher');

        return response()->json(['school_class' => $schoolClass, 'message' => 'Class created successfully']);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'level_name' => 'required|string|max:255',
            'arm_names' => 'required|array|min:1',
            'arm_names.*' => 'required|string|max:255',
            'capacity' => 'nullable|integer',
        ]);

        $createdClasses = [];
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($validated['arm_names'] as $armName) {
                $fullName = $validated['level_name'] . ' ' . $armName;
                
                if (SchoolClass::where('full_name', $fullName)->exists()) {
                    $errors[] = "Class '$fullName' already exists.";
                    continue;
                }

                $schoolClass = SchoolClass::create([
                    'level_name' => $validated['level_name'],
                    'arm_name' => $armName,
                    'full_name' => $fullName,
                    'capacity' => $validated['capacity'] ?? 30,
                    'is_active' => true,
                ]);

                $createdClasses[] = $schoolClass;
            }

            DB::commit();

            if (count($createdClasses) === 0 && count($errors) > 0) {
                return response()->json(['message' => 'Failed to create classes', 'errors' => $errors], 422);
            }

            return response()->json([
                'message' => count($createdClasses) . ' classes created successfully.',
                'created' => $createdClasses,
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'An error occurred during bulk creation.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, SchoolClass $schoolClass)
    {
        $validated = $request->validate([
            'level_name' => 'required|string|max:255',
            'arm_name' => 'required|string|max:255',
            'capacity' => 'nullable|integer',
            'teacher_id' => 'nullable|exists:staff,id',
            'room_number' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $fullName = $validated['level_name'] . ' ' . $validated['arm_name'];
        if (SchoolClass::where('full_name', $fullName)->where('id', '!=', $schoolClass->id)->exists()) {
            return response()->json(['message' => 'A class with this full name already exists.'], 422);
        }
        
        $validated['full_name'] = $fullName;

        $schoolClass->update($validated);
        $schoolClass->load('teacher');

        return response()->json(['school_class' => $schoolClass, 'message' => 'Class updated successfully']);
    }

    public function destroy(SchoolClass $schoolClass)
    {
        $schoolClass->delete();
        return response()->json(['message' => 'Class deleted successfully']);
    }
}
