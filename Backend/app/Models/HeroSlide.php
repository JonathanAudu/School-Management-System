<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Str;

class HeroSlide extends Model
{
    protected $fillable = ['image', 'title', 'subtitle', 'button_text', 'button_link', 'order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? (Str::startsWith($value, ['http://', 'https://']) ? $value : url('storage/' . $value)) : null,
        );
    }
}

