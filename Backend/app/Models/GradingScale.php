<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GradingScale extends Model
{
    protected $fillable = ['min_score', 'max_score', 'grade', 'remark'];
}
