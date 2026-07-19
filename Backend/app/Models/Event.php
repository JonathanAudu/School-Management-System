<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Event extends Model
{
    protected $fillable = ['title', 'description', 'date', 'time', 'venue', 'image'];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? (Str::startsWith($value, ['http://', 'https://']) ? $value : Storage::disk('public')->url($value)) : null,
        );
    }
}

