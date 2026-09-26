<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengaturan;

class PengaturanSeeder extends Seeder
{
    public function run(): void
    {
        Pengaturan::create([
            'nama_sekolah' => 'SMK Karya Guna 2 Bekasi',
            'tahun_ajaran' => '2026/2027',
            'gelombang' => 1,
            'target_siswa' => 468,
            'judul' => 'Sistem Penerimaan Murid Baru 2025',
            'deskripsi' => "Ayo Bergabunglah bersama kami untuk masa depan yang lebih cerah.\r\nMulai langkah Anda dengan mengisi formulir pendaftaran.",
        ]);
    }
}
