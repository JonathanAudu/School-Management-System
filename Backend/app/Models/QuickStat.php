<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuickStat extends Model
{
    protected $fillable = ['icon', 'number', 'title', 'suffix', 'order'];
}
