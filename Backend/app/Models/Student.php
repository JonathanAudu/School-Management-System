<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    /** @use HasFactory<\Database\Factories\StudentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'academic_session_id',
        'term_id',
        'first_name',
        'last_name',
        'middle_name',
        'admission_number',
        'class',
        'arm',
        'gender',
        'status',
        'date_admitted',
        'parent_name',
        'parent_email',
        'parent_phone',
        'student_email',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function registeredSubjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subjects')
            ->withPivot('academic_session_id', 'status')
            ->withTimestamps();
    }
}
