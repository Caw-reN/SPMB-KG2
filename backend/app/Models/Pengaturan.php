<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\Cache;

class Pengaturan extends Model
{
    protected $table = 'pengaturan';
    public $timestamps = false;

    protected $fillable = [
        'nama_sekolah',
        'tahun_ajaran',
        'gelombang',
        'target_siswa',
        'judul',
        'deskripsi',
    ];

    protected function casts(): array
    {
        return [
            'gelombang' => 'integer',
            'target_siswa' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('pengaturan_terbaru');
        });

        static::deleted(function () {
            Cache::forget('pengaturan_terbaru');
        });
    }

    public static function getSettings()
    {
        $cached = Cache::remember('pengaturan_terbaru', now()->addDay(), function () {
            $model = self::orderBy('id', 'desc')->first();
            return $model ? $model->getAttributes() : null;
        });

        if ($cached === null) {
            return null;
        }

        $instance = new self();
        $instance->setRawAttributes($cached, true);
        $instance->exists = true;
        return $instance;
    }
}
