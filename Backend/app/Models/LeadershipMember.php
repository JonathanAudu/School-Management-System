<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Str;

class LeadershipMember extends Model
{
    protected $fillable = ['name', 'position', 'photo', 'bio', 'order'];

    protected function photo(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? (Str::startsWith($value, ['http://', 'https://']) ? $value : url('storage/' . $value)) : null,
        );
    }
}

