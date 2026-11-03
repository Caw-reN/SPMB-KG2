<?php

namespace App\Services;

use App\Models\Pendaftar;
use App\Models\Pengaturan;
use Illuminate\Support\Str;

class PendaftarService
{
    public function generateNoPendaftaran(): string
    {
        $prefix = 'SPMBKG2-27';
        $prefixLen = strlen($prefix);

        // Cari nomor urut pendaftaran terbesar secara numerik
        $maxNum = Pendaftar::withTrashed()
            ->whereNotNull('no_pendaftaran')
            ->where('no_pendaftaran', 'like', $prefix . '%')
            ->selectRaw("MAX(CAST(SUBSTRING(no_pendaftaran, " . ($prefixLen + 1) . ") AS UNSIGNED)) as max_no")
            ->value('max_no');

        $nextNumber = ($maxNum !== null && $maxNum !== '') ? ((int) $maxNum + 1) : 1;

        // Safety loop anti-collision
        while (Pendaftar::withTrashed()->where('no_pendaftaran', $prefix . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT))->exists()) {
            $nextNumber++;
        }

        return $prefix . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function generatePasswordCbt(): string
    {
        $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $random = '';
        for ($i = 0; $i < 6; $i++) {
            $random .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $random . '*';
    }

    public function generateNoKwitansi(): string
    {
        $prefix = 'KW-SPMB27-';
        $prefixLen = strlen($prefix);

        // Ambil nomor kwitansi terbesar secara numerik (bukan berdasarkan id_pendaftar)
        $maxNum = Pendaftar::withTrashed()
            ->whereNotNull('no_kwitansi')
            ->where('no_kwitansi', 'like', $prefix . '%')
            ->selectRaw("MAX(CAST(SUBSTRING(no_kwitansi, " . ($prefixLen + 1) . ") AS UNSIGNED)) as max_no")
            ->value('max_no');

        $nextNumber = ($maxNum !== null && $maxNum !== '') ? ((int) $maxNum + 1) : 1;

        // Safety loop anti-collision: pastikan nomor baru belum pernah terpakai
        while (Pendaftar::withTrashed()->where('no_kwitansi', $prefix . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT))->exists()) {
            $nextNumber++;
        }

        return $prefix . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function isNikRegistered(string $nik, ?int $excludeId = null): bool
    {
        $query = Pendaftar::withTrashed()->where('nik', trim($nik));
        if ($excludeId) {
            $query->where('id_pendaftar', '!=', $excludeId);
        }
        return $query->exists();
    }

    public function register(array $data): Pendaftar
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            // Kunci tabel pengaturan untuk mencegah pendaftaran serentak di waktu yang persis sama
            $pengaturan = Pengaturan::lockForUpdate()->orderBy('id', 'desc')->first();
            $gelombang = $pengaturan ? $pengaturan->gelombang : 1;

            $noPendaftaran = $this->generateNoPendaftaran();
            $passwordCbt = $this->generatePasswordCbt();

            return Pendaftar::create([
                'no_pendaftaran' => $noPendaftaran,
                'nisn' => trim($data['nisn'] ?? ''),
                'nik' => trim($data['nik'] ?? ''),
                'nama_siswa' => ucwords(strtolower(trim($data['nama_lengkap'] ?? $data['nama_siswa'] ?? ''))),
                'jenis_kelamin' => trim($data['jenis_kelamin'] ?? ''),
                'agama' => trim($data['agama'] ?? ''),
                'nama_sekolah' => trim($data['asal_smp'] ?? $data['nama_sekolah'] ?? ''),
                'alamat_smp' => trim($data['alamat_smp'] ?? ''),
                'npsn' => trim($data['npsn'] ?? ''),
                'jurusan_1' => !empty($data['jurusan1']) ? (int) $data['jurusan1'] : (!empty($data['jurusan_1']) ? (int) $data['jurusan_1'] : null),
                'jurusan_2' => !empty($data['jurusan2']) ? (int) $data['jurusan2'] : (!empty($data['jurusan_2']) ? (int) $data['jurusan_2'] : null),
                'nama_ayah' => ucwords(strtolower(trim($data['nama_ayah'] ?? ''))),
                'nama_ibu' => ucwords(strtolower(trim($data['nama_ibu'] ?? ''))),
                'no_orangtua_wali' => trim($data['no_ortu_wali'] ?? $data['no_orangtua_wali'] ?? $data['no_ortu-wali'] ?? ''),
                'status_pendaftaran' => 'Menunggu',
                'gelombang' => $gelombang,
                'password_cbt' => $passwordCbt,
                'formulir_kembali' => 0,
                'tanggal_daftar' => now()->toDateString(),
            ]);
        });
    }

    public function approve(int $idPendaftar): ?Pendaftar
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($idPendaftar) {
            // Kunci baris pendaftar spesifik untuk mencegah persetujuan ganda secara bersamaan
            $pendaftar = Pendaftar::lockForUpdate()->find($idPendaftar);
            if (!$pendaftar) {
                return null;
            }

            if ($pendaftar->status_pendaftaran !== 'Menunggu') {
                throw new \DomainException("Pendaftar dengan status '{$pendaftar->status_pendaftaran}' tidak dapat disetujui kembali.");
            }

            if (empty($pendaftar->no_kwitansi)) {
                $pendaftar->no_kwitansi = $this->generateNoKwitansi();
            }
            $pendaftar->status_pendaftaran = 'Diterima';
            $pendaftar->save();

            return $pendaftar;
        });
    }

    public function verifyFormulir(int $idPendaftar): ?Pendaftar
    {
        $pendaftar = Pendaftar::find($idPendaftar);
        if (!$pendaftar) {
            return null;
        }

        $pengaturan = Pengaturan::getSettings();
        $gelombang = $pengaturan ? $pengaturan->gelombang : 1;

        $pendaftar->formulir_kembali = $gelombang;
        $pendaftar->save();

        return $pendaftar;
    }
}
