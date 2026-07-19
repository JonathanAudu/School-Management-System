<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PhotoAlbum extends Model
{
    protected $fillable = ['name', 'description', 'cover_image'];

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    protected function coverImage(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? (Str::startsWith($value, ['http://', 'https://']) ? $value : Storage::disk('public')->url($value)) : null,
        );
    }
}

