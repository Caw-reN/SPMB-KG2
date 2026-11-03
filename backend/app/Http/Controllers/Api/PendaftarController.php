<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePendaftarRequest;
use App\Models\Pendaftar;
use App\Models\Pengaturan;
use App\Services\PendaftarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PendaftarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim($request->query('search', ''));
        $limit = (int) $request->query('limit', 10);
        $page = (int) $request->query('page', 1);
        $status = $request->query('status', '');
        $jurusan = $request->query('jurusan', '');

        $query = Pendaftar::with('jurusanSatu')
            ->orderBy('id_pendaftar', 'desc');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_siswa', 'like', "%{$search}%")
                    ->orWhere('no_pendaftaran', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if (!empty($status)) {
            $query->where('status_pendaftaran', $status);
        }

        if (!empty($jurusan)) {
            $query->where('jurusan_1', $jurusan);
        }

        $paginated = $query->paginate($limit, ['*'], 'page', $page);

        $items = collect($paginated->items())->map(function ($item) {
            return [
                'id_pendaftar' => $item->id_pendaftar,
                'no_pendaftaran' => $item->no_pendaftaran,
                'no_kwitansi' => $item->no_kwitansi,
                'nama_siswa' => $item->nama_siswa,
                'nisn' => $item->nisn,
                'nik' => $item->nik,
                'jenis_kelamin' => $item->jenis_kelamin,
                'agama' => $item->agama,
                'jurusan_1' => $item->jurusan_1,
                'jurusan_2' => $item->jurusan_2,
                'jurusan_label' => $item->jurusanSatu ? $item->jurusanSatu->kode_jurusan : '-',
                'nama_ayah' => $item->nama_ayah,
                'nama_ibu' => $item->nama_ibu,
                'no_orangtua_wali' => $item->no_orangtua_wali,
                'nama_sekolah' => $item->nama_sekolah,
                'alamat_smp' => $item->alamat_smp,
                'npsn' => $item->npsn,
                'status_pendaftaran' => $item->status_pendaftaran,
                'gelombang' => $item->gelombang,
                'password_cbt' => $item->password_cbt,
                'formulir_kembali' => $item->formulir_kembali,
                'tanggal_daftar' => $item->tanggal_daftar ? $item->tanggal_daftar->format('Y-m-d') : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $pendaftar = Pendaftar::with(['jurusanSatu', 'jurusanDua'])->find($id);

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftar tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $pendaftar,
        ]);
    }

    public function update(UpdatePendaftarRequest $request, int $id): JsonResponse
    {
        $pendaftar = Pendaftar::find($id);

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftar tidak ditemukan',
            ], 404);
        }

        $data = $request->validated();
        
        if (isset($data['nama_siswa'])) {
            $data['nama_siswa'] = ucwords(strtolower(trim($data['nama_siswa'])));
        }
        if (isset($data['nama_ayah'])) {
            $data['nama_ayah'] = ucwords(strtolower(trim($data['nama_ayah'])));
        }
        if (isset($data['nama_ibu'])) {
            $data['nama_ibu'] = ucwords(strtolower(trim($data['nama_ibu'])));
        }

        $pendaftar->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data pendaftar berhasil diperbarui',
            'data' => $pendaftar,
        ]);
    }

    public function approve(PendaftarService $service, int $id): JsonResponse
    {
        try {
            $pendaftar = $service->approve($id);

            if (!$pendaftar) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data pendaftar tidak ditemukan',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pendaftar berhasil dikonfirmasi dan No. Kwitansi telah dibuat',
                'data' => [
                    'id_pendaftar' => $pendaftar->id_pendaftar,
                    'status_pendaftaran' => $pendaftar->status_pendaftaran,
                    'no_kwitansi' => $pendaftar->no_kwitansi,
                ],
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Error approve pendaftar ID {$id}: " . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal konfirmasi pendaftar: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $pendaftar = Pendaftar::find($id);

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftar tidak ditemukan',
            ], 404);
        }

        $pendaftar->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data pendaftar berhasil dihapus',
        ]);
    }

    public function verifyFormulir(PendaftarService $service, int $id): JsonResponse
    {
        $pendaftar = $service->verifyFormulir($id);

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftar tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Formulir berhasil diverifikasi',
            'data' => [
                'id_pendaftar' => $pendaftar->id_pendaftar,
                'formulir_kembali' => $pendaftar->formulir_kembali,
            ],
        ]);
    }

    public function cetakKartuList(Request $request): JsonResponse
    {
        $search = trim($request->query('search', ''));
        $gelombang = $request->query('gelombang');

        $query = Pendaftar::with('jurusanSatu')
            ->where('status_pendaftaran', 'Diterima')
            ->orderBy('id_pendaftar', 'desc');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_siswa', 'like', "%{$search}%")
                    ->orWhere('no_pendaftaran', 'like', "%{$search}%")
                    ->orWhere('no_kwitansi', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if (!empty($gelombang)) {
            $query->where('gelombang', (int) $gelombang);
        }

        $pendaftars = $query->get()->map(function ($item) {
            return [
                'id_pendaftar' => $item->id_pendaftar,
                'no_pendaftaran' => $item->no_pendaftaran,
                'no_kwitansi' => $item->no_kwitansi,
                'nama_siswa' => $item->nama_siswa,
                'nisn' => $item->nisn,
                'nama_sekolah' => $item->nama_sekolah,
                'nama_jurusan' => $item->jurusanSatu ? $item->jurusanSatu->nama_jurusan : '-',
                'kode_jurusan' => $item->jurusanSatu ? $item->jurusanSatu->kode_jurusan : '-',
                'formulir_kembali' => $item->formulir_kembali,
                'password_cbt' => $item->password_cbt,
                'gelombang' => $item->gelombang,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $pendaftars,
        ]);
    }

    public function kwitansiData(int $id): JsonResponse
    {
        $pendaftar = Pendaftar::with(['jurusanSatu', 'jurusanDua'])->find($id);

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        if ($pendaftar->status_pendaftaran !== 'Diterima' || empty($pendaftar->no_kwitansi)) {
            return response()->json([
                'success' => false,
                'message' => 'Kwitansi belum dapat dicetak karena pendaftar belum menyelesaikan verifikasi pembayaran formulir.',
            ], 422);
        }

        $pengaturan = Pengaturan::getSettings();

        return response()->json([
            'success' => true,
            'data' => [
                'id_pendaftar' => $pendaftar->id_pendaftar,
                'no_kwitansi' => $pendaftar->no_kwitansi,
                'no_pendaftaran' => $pendaftar->no_pendaftaran,
                'nama_siswa' => strtoupper($pendaftar->nama_siswa),
                'nik' => $pendaftar->nik,
                'nisn' => $pendaftar->nisn,
                'nama_sekolah' => $pendaftar->nama_sekolah ?? '-',
                'nama_ayah' => $pendaftar->nama_ayah ?? '-',
                'nama_ibu' => $pendaftar->nama_ibu ?? '-',
                'no_orangtua_wali' => $pendaftar->no_orangtua_wali ?? '-',
                'nama_jurusan_1' => $pendaftar->jurusanSatu ? $pendaftar->jurusanSatu->nama_jurusan : '-',
                'nama_jurusan_2' => $pendaftar->jurusanDua ? $pendaftar->jurusanDua->nama_jurusan : '-',
                'tanggal_daftar' => $pendaftar->tanggal_daftar ? $pendaftar->tanggal_daftar->format('d/m/Y') : date('d/m/Y'),
                'sekolah_nama' => $pengaturan ? $pengaturan->nama_sekolah : 'SMK Karya Guna 2 Bekasi',
                'tahun_ajaran' => $pengaturan ? $pengaturan->tahun_ajaran : '2026/2027',
                'gelombang' => $pendaftar->gelombang ?? 1,
            ],
        ]);
    }

    public function kartuUjianData(int $id): JsonResponse
    {
        $pendaftar = Pendaftar::with('jurusanSatu')->find($id);

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        if ($pendaftar->status_pendaftaran !== 'Diterima' || empty($pendaftar->no_kwitansi)) {
            return response()->json([
                'success' => false,
                'message' => 'Kartu ujian belum dapat dicetak karena pendaftar belum menyelesaikan verifikasi pembayaran formulir.',
            ], 422);
        }

        $username = str_replace('KW-', '', $pendaftar->no_kwitansi ?? '');

        return response()->json([
            'success' => true,
            'data' => [
                'no_pendaftaran' => $pendaftar->no_pendaftaran,
                'no_kwitansi' => $pendaftar->no_kwitansi,
                'nama_siswa' => strtoupper($pendaftar->nama_siswa),
                'nama_sekolah' => $pendaftar->nama_sekolah,
                'kode_jurusan' => $pendaftar->jurusanSatu ? $pendaftar->jurusanSatu->kode_jurusan : '-',
                'nama_jurusan' => $pendaftar->jurusanSatu ? $pendaftar->jurusanSatu->nama_jurusan : '-',
                'username_cbt' => $username,
                'password_cbt' => $pendaftar->password_cbt,
                'gelombang' => $pendaftar->gelombang,
            ],
        ]);
    }
}
