<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePendaftarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nik' => 'nullable|digits:16',
            'nisn' => 'nullable|digits:10',
            'nama_siswa' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'agama' => 'required|string|max:20',
            'jurusan_1' => 'required|exists:jurusan,id_jurusan',
            'jurusan_2' => 'nullable|different:jurusan_1|exists:jurusan,id_jurusan',
            'nama_sekolah' => 'required|string|max:100',
            'npsn' => 'nullable|string|max:10',
            'alamat_smp' => 'nullable|string|max:500',
            'nama_ayah' => 'nullable|string|max:100',
            'nama_ibu' => 'nullable|string|max:100',
            'no_orangtua_wali' => 'nullable|string|max:20',
            'status_pendaftaran' => 'nullable|string|in:Menunggu,Diterima,Ditolak',
            'gelombang' => 'nullable|integer',
            'formulir_kembali' => 'nullable|integer',
        ];
    }
}
