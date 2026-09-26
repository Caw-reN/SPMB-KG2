<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePendaftarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nisn' => 'required|digits:10',
            'nik' => 'required|digits:16',
            'nama_lengkap' => 'required_without:nama_siswa|nullable|string|max:255',
            'nama_siswa' => 'required_without:nama_lengkap|nullable|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'agama' => 'required|string|max:20',
            'jurusan1' => 'required_without:jurusan_1|nullable|exists:jurusan,id_jurusan',
            'jurusan_1' => 'required_without:jurusan1|nullable|exists:jurusan,id_jurusan',
            'jurusan2' => 'nullable|different:jurusan1|different:jurusan_1|exists:jurusan,id_jurusan',
            'jurusan_2' => 'nullable|different:jurusan1|different:jurusan_1|exists:jurusan,id_jurusan',
            'asal_smp' => 'required_without:nama_sekolah|nullable|string|max:100',
            'nama_sekolah' => 'required_without:asal_smp|nullable|string|max:100',
            'npsn' => 'nullable|string|max:10',
            'alamat_smp' => 'required|string|max:500',
            'nama_ayah' => 'required|string|max:100',
            'nama_ibu' => 'required|string|max:100',
            'no_ortu_wali' => 'nullable|string|max:20',
            'no_orangtua_wali' => 'nullable|string|max:20',
            'no_ortu-wali' => 'nullable|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'nisn.required' => 'NISN wajib diisi.',
            'nisn.digits' => 'NISN harus berupa 10 digit angka.',
            'nik.required' => 'NIK wajib diisi.',
            'nik.digits' => 'NIK harus berupa 16 digit angka.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'agama.required' => 'Agama wajib dipilih.',
            'npsn.required' => 'NPSN SMP/MTs wajib diisi.',
            'alamat_smp.required' => 'Alamat SMP wajib diisi.',
            'alamat_smp.max' => 'Alamat SMP maksimal 500 karakter.',
            'nama_ayah.required' => 'Nama Ayah wajib diisi.',
            'nama_ibu.required' => 'Nama Ibu wajib diisi.',
        ];
    }
}
