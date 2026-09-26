<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jurusan;

class JurusanSeeder extends Seeder
{
    public function run(): void
    {
        $jurusans = [
            ['id_jurusan' => 10, 'kode_jurusan' => 'AK', 'nama_jurusan' => 'Akuntansi'],
            ['id_jurusan' => 20, 'kode_jurusan' => 'MP', 'nama_jurusan' => 'Manajemen Perkantoran'],
            ['id_jurusan' => 30, 'kode_jurusan' => 'TKR', 'nama_jurusan' => 'Teknik Kendaraan Ringan'],
            ['id_jurusan' => 40, 'kode_jurusan' => 'TKJ', 'nama_jurusan' => 'Teknik Komputer dan Jaringan'],
        ];

        foreach ($jurusans as $jurusan) {
            Jurusan::create($jurusan);
        }
    }
}
