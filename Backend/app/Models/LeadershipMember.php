<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadershipMember extends Model
{
    protected $fillable = ['name', 'position', 'photo', 'bio', 'order'];
}
