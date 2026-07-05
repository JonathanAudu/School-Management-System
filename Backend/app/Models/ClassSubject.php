<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassSubject extends Model
{
    protected $fillable = [
        'academic_session_id',
        'school_class_id',
        'subject_id',
        'staff_id',
        'is_compulsory',
        'order'
    ];

    protected $casts = [
        'is_compulsory' => 'boolean',
        'order' => 'integer',
    ];

    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
