<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicSessionController extends Controller
{
    public function index()
    {
        return response()->json([
            'academic_sessions' => AcademicSession::orderBy('name', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:academic_sessions,name',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|in:upcoming,active,completed',
        ]);

        DB::beginTransaction();
        try {
            if ($validated['status'] === 'active') {
                AcademicSession::where('status', 'active')->update(['status' => 'completed']);
            }
            $session = AcademicSession::create($validated);
            DB::commit();
            return response()->json(['academic_session' => $session, 'message' => 'Academic session created successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create academic session', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, AcademicSession $academicSession)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:academic_sessions,name,' . $academicSession->id,
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|in:upcoming,active,completed',
        ]);

        DB::beginTransaction();
        try {
            if ($validated['status'] === 'active' && $academicSession->status !== 'active') {
                AcademicSession::where('status', 'active')->where('id', '!=', $academicSession->id)->update(['status' => 'completed']);
            }
            $academicSession->update($validated);
            DB::commit();
            return response()->json(['academic_session' => $academicSession, 'message' => 'Academic session updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update academic session', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(AcademicSession $academicSession)
    {
        if ($academicSession->status === 'active') {
            return response()->json(['message' => 'Cannot delete an active academic session'], 400);
        }
        $academicSession->delete();
        return response()->json(['message' => 'Academic session deleted successfully']);
    }
}
