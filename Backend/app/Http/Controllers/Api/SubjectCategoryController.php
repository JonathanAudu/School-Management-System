<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubjectCategory;
use Illuminate\Http\Request;

class SubjectCategoryController extends Controller
{
    public function index()
    {
        return response()->json(SubjectCategory::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:subject_categories',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);

        $category = SubjectCategory::create($validated);
        return response()->json($category, 201);
    }

    public function show(SubjectCategory $subjectCategory)
    {
        return response()->json($subjectCategory);
    }

    public function update(Request $request, SubjectCategory $subjectCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:subject_categories,name,' . $subjectCategory->id,
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);

        $subjectCategory->update($validated);
        return response()->json($subjectCategory);
    }

    public function destroy(SubjectCategory $subjectCategory)
    {
        $subjectCategory->delete();
        return response()->json(null, 204);
    }
}
