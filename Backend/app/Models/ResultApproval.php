<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResultApproval extends Model
{
    protected $fillable = [
        'academic_session_id',
        'term_id',
        'term_type',
        'school_class_id',
        'form_teacher_status',
        'admin_status'
    ];

    public function academicSession() { return $this->belongsTo(AcademicSession::class); }
    public function term() { return $this->belongsTo(Term::class); }
    public function schoolClass() { return $this->belongsTo(SchoolClass::class); }
}
