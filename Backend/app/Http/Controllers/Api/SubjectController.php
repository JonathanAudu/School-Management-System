<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        return response()->json(Subject::with('category')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'subject_category_id' => 'required|exists:subject_categories,id',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);

        $subject = Subject::create($validated);
        return response()->json($subject->load('category'), 201);
    }

    public function show(Subject $subject)
    {
        return response()->json($subject->load('category'));
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'subject_category_id' => 'required|exists:subject_categories,id',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);

        $subject->update($validated);
        return response()->json($subject->load('category'));
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return response()->json(null, 204);
    }
}
