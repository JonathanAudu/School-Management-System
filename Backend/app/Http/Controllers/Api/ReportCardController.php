<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentResult;
use App\Models\SchoolClass;
use App\Models\AcademicSession;
use App\Models\Term;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportCardController extends Controller
{
    public function generateStudentReport(Request $request, $studentId)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'term_type' => 'required|in:mid_term,end_of_term',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $student = Student::findOrFail($studentId);
        $schoolClass = SchoolClass::findOrFail($request->school_class_id);
        $session = AcademicSession::findOrFail($request->academic_session_id);
        $term = Term::findOrFail($request->term_id);

        $results = StudentResult::with('subject')
            ->where([
                'student_id' => $student->id,
                'academic_session_id' => $session->id,
                'term_id' => $term->id,
                'term_type' => $request->term_type,
                'school_class_id' => $schoolClass->id,
            ])->get();

        $totalScore = $results->sum('total_score');
        $average = $results->count() > 0 ? $totalScore / $results->count() : 0;

        $principalSignatureSetting = \App\Models\WebsiteSetting::where('key', 'principal_signature')->first();
        $principalSignature = $principalSignatureSetting ? $principalSignatureSetting->value : null;

        $formMasterSignature = null;
        if ($schoolClass->teacher && $schoolClass->teacher->user) {
            $formMasterSignature = $schoolClass->teacher->user->signature;
        }

        $data = [
            'student' => $student,
            'schoolClass' => $schoolClass,
            'session' => $session,
            'term' => $term,
            'term_type' => $request->term_type,
            'results' => $results,
            'totalScore' => $totalScore,
            'average' => $average,
            'principalSignature' => $principalSignature,
            'formMasterSignature' => $formMasterSignature,
        ];

        $pdf = Pdf::loadView('pdf.report_card', $data);
        return $pdf->download("report_card_{$student->student_id}.pdf");
    }
}
