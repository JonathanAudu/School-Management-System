<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    //
    protected $fillable = [
        'user_id',
        'staff_type',
        'staff_id',
        'first_name',
        'last_name',
        'middle_name',
        'gender',
        'phone',
        'email',
        'date_of_birth',
        'position',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function classes()
    {
        return $this->hasMany(SchoolClass::class, 'teacher_id');
    }

    public function classSubjects()
    {
        return $this->hasMany(ClassSubject::class);
    }
}
