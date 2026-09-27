<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Carousel extends Model
{
    protected $fillable = ['image_path', 'is_active'];

    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('carousels_active');
            Cache::forget('carousels_all');
        });

        static::deleted(function () {
            Cache::forget('carousels_active');
            Cache::forget('carousels_all');
        });
    }
}
