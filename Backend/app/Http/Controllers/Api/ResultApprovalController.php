<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResultApproval;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class ResultApprovalController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'term_type' => 'required|in:mid_term,end_of_term'
        ]);

        $classes = SchoolClass::all()->map(function ($cls) use ($request) {
            $approval = ResultApproval::where([
                'academic_session_id' => $request->academic_session_id,
                'term_id' => $request->term_id,
                'term_type' => $request->term_type,
                'school_class_id' => $cls->id,
            ])->first();

            $cls->approval = $approval;
            return $cls;
        });

        return response()->json($classes);
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'term_type' => 'required|in:mid_term,end_of_term',
            'school_class_id' => 'required|exists:school_classes,id',
            'role' => 'required|in:form_teacher,admin',
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $approval = ResultApproval::firstOrCreate(
            [
                'academic_session_id' => $request->academic_session_id,
                'term_id' => $request->term_id,
                'term_type' => $request->term_type,
                'school_class_id' => $request->school_class_id,
            ],
            [
                'form_teacher_status' => 'pending',
                'admin_status' => 'pending'
            ]
        );

        if ($request->role === 'form_teacher') {
            $approval->form_teacher_status = $request->status;
        } else {
            $approval->admin_status = $request->status;
            if ($request->status === 'pending' || $request->status === 'rejected') {
                $approval->form_teacher_status = 'pending';
            }
        }

        $approval->save();

        return response()->json(['message' => 'Status updated successfully', 'approval' => $approval]);
    }
}
