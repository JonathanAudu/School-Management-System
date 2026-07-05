<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentResult extends Model
{
    protected $fillable = [
        'student_id',
        'academic_session_id',
        'term_id',
        'term_type',
        'school_class_id',
        'subject_id',
        'ca1',
        'ca2',
        'exam',
        'total_score',
        'grade',
        'remark',
        'status',
        'entered_by'
    ];

    public function student() { return $this->belongsTo(Student::class); }
    public function academicSession() { return $this->belongsTo(AcademicSession::class); }
    public function term() { return $this->belongsTo(Term::class); }
    public function schoolClass() { return $this->belongsTo(SchoolClass::class); }
    public function subject() { return $this->belongsTo(Subject::class); }
    public function enteredBy() { return $this->belongsTo(User::class, 'entered_by'); }
}
