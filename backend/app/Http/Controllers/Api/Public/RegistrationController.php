<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePendaftarRequest;
use App\Models\Jurusan;
use App\Models\Pendaftar;
use App\Models\Pengaturan;
use App\Services\PendaftarService;
use Illuminate\Http\JsonResponse;

class RegistrationController extends Controller
{
    public function getPengaturan(): JsonResponse
    {
        $pengaturan = Pengaturan::getSettings();

        return response()->json([
            'success' => true,
            'data' => [
                'nama_sekolah' => $pengaturan ? $pengaturan->nama_sekolah : '',
                'judul' => $pengaturan ? $pengaturan->judul : '',
                'deskripsi' => $pengaturan ? $pengaturan->deskripsi : '',
            ],
        ]);
    }

    public function getJurusan(): JsonResponse
    {
        $jurusans = Jurusan::orderBy('nama_jurusan', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $jurusans,
        ]);
    }

    public function register(StorePendaftarRequest $request, PendaftarService $service): JsonResponse
    {
        $nik = trim($request->nik);

        if ($service->isNikRegistered($nik)) {
            return response()->json([
                'success' => false,
                'message' => "Pendaftaran Gagal! NIK {$nik} sudah terdaftar sebelumnya.",
            ], 422);
        }

        $pendaftar = $service->register($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil',
            'data' => [
                'id_pendaftar' => $pendaftar->id_pendaftar,
                'no_pendaftaran' => $pendaftar->no_pendaftaran,
                'nama_siswa' => $pendaftar->nama_siswa,
                'nisn' => $pendaftar->nisn,
                'tanggal_daftar' => $pendaftar->tanggal_daftar,
            ],
        ], 201);
    }

    public function cekStatus(string $nisn): JsonResponse
    {
        $pendaftar = Pendaftar::with(['jurusanSatu', 'jurusanDua'])
            ->where('nisn', trim($nisn))
            ->first();

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftar tidak ditemukan. Pastikan NISN yang Anda masukkan sudah benar.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'nama_siswa' => $pendaftar->nama_siswa,
                'nisn' => $pendaftar->nisn,
                'nama_sekolah' => $pendaftar->nama_sekolah,
                'no_pendaftaran' => $pendaftar->no_pendaftaran,
                'nama_jurusan_1' => $pendaftar->jurusanSatu ? $pendaftar->jurusanSatu->nama_jurusan : '-',
                'nama_jurusan_2' => $pendaftar->jurusanDua ? $pendaftar->jurusanDua->nama_jurusan : '-',
                'status_pendaftaran' => $pendaftar->status_pendaftaran ?? 'Menunggu',
                'gelombang' => $pendaftar->gelombang,
            ],
        ]);
    }
}
