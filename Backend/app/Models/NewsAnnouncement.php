<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsAnnouncement extends Model
{
    protected $fillable = ['title', 'content', 'category', 'image', 'published_at'];
}
