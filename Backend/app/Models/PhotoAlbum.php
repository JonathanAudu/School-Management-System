<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhotoAlbum extends Model
{
    protected $fillable = ['name', 'description', 'cover_image'];

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }
}
