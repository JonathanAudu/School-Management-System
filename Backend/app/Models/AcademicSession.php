<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicSession extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'start_date', 'end_date', 'status'];

    public function terms()
    {
        return $this->hasMany(Term::class);
    }

    public function classSubjects()
    {
        return $this->hasMany(ClassSubject::class);
    }
}
