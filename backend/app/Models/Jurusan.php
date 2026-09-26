<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jurusan extends Model
{
    protected $table = 'jurusan';
    protected $primaryKey = 'id_jurusan';
    public $timestamps = false;

    protected $fillable = [
        'kode_jurusan',
        'nama_jurusan',
    ];

    public function pendaftarJurusan1(): HasMany
    {
        return $this->hasMany(Pendaftar::class, 'jurusan_1', 'id_jurusan');
    }

    public function pendaftarJurusan2(): HasMany
    {
        return $this->hasMany(Pendaftar::class, 'jurusan_2', 'id_jurusan');
    }
}
