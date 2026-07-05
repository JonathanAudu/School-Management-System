<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['name', 'code', 'subject_category_id', 'description', 'status'];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(SubjectCategory::class, 'subject_category_id');
    }

    public function classSubjects()
    {
        return $this->hasMany(ClassSubject::class);
    }
}
