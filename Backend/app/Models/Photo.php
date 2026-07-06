<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Str;

class Photo extends Model
{
    protected $fillable = ['photo_album_id', 'image'];

    public function album()
    {
        return $this->belongsTo(PhotoAlbum::class, 'photo_album_id');
    }

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? (Str::startsWith($value, ['http://', 'https://']) ? $value : url('storage/' . $value)) : null,
        );
    }
}

