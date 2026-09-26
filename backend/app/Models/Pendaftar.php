<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pendaftar extends Model
{
    use SoftDeletes;

    protected $table = 'pendaftar';
    protected $primaryKey = 'id_pendaftar';
    public $timestamps = false;

    const DELETED_AT = 'deleted_at';

    protected $fillable = [
        'no_pendaftaran',
        'no_kwitansi',
        'nama_siswa',
        'nisn',
        'nik',
        'jenis_kelamin',
        'agama',
        'jurusan_1',
        'jurusan_2',
        'nama_ayah',
        'nama_ibu',
        'no_orangtua_wali',
        'nama_sekolah',
        'alamat_smp',
        'npsn',
        'status_pendaftaran',
        'gelombang',
        'password_cbt',
        'formulir_kembali',
        'tanggal_daftar',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_daftar' => 'date',
            'jurusan_1' => 'integer',
            'jurusan_2' => 'integer',
            'gelombang' => 'integer',
            'formulir_kembali' => 'integer',
        ];
    }

    public function jurusanSatu(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_1', 'id_jurusan');
    }

    public function jurusanDua(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_2', 'id_jurusan');
    }
}
