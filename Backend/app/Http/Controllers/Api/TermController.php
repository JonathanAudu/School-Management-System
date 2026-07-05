<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TermController extends Controller
{
    public function index()
    {
        return response()->json([
            'terms' => Term::with('academicSession')->orderBy('id', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_current' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            if (!empty($validated['is_current'])) {
                Term::where('is_current', true)->update(['is_current' => false]);
            } else {
                $validated['is_current'] = false;
            }
            $term = Term::create($validated);
            DB::commit();
            $term->load('academicSession');
            return response()->json(['term' => $term, 'message' => 'Term created successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create term', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Term $term)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_current' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            if (!empty($validated['is_current']) && !$term->is_current) {
                Term::where('is_current', true)->where('id', '!=', $term->id)->update(['is_current' => false]);
            } elseif (!isset($validated['is_current'])) {
                $validated['is_current'] = false;
            }
            $term->update($validated);
            DB::commit();
            $term->load('academicSession');
            return response()->json(['term' => $term, 'message' => 'Term updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update term', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Term $term)
    {
        if ($term->is_current) {
            return response()->json(['message' => 'Cannot delete the current term'], 400);
        }
        $term->delete();
        return response()->json(['message' => 'Term deleted successfully']);
    }
}
