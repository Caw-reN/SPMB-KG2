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

    public static function getSettings()
    {
        return self::orderBy('id', 'desc')->first();
    }
}
