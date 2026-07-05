<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentEnrollment extends Model
{
    protected $fillable = [
        'student_id',
        'academic_session_id',
        'school_class_id',
        'status'
    ];

    public function student() { return $this->belongsTo(Student::class); }
    public function academicSession() { return $this->belongsTo(AcademicSession::class); }
    public function schoolClass() { return $this->belongsTo(SchoolClass::class); }
}
