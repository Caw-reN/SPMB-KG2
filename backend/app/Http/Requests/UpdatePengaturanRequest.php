<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePengaturanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_sekolah' => 'required|string|max:50',
            'tahun_ajaran' => 'required|string|max:20',
            'gelombang' => 'required|integer|in:1,2,3',
            'target_siswa' => 'required|integer|min:1',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ];
    }
}
