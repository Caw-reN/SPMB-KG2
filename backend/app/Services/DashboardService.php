<?php

namespace App\Services;

use App\Models\Jurusan;
use App\Models\Pendaftar;
use App\Models\Pengaturan;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(): array
    {
        $pengaturan = Pengaturan::getSettings();
        $targetSiswa = $pengaturan ? (int) $pengaturan->target_siswa : 0;

        $statsQuery = Pendaftar::selectRaw("
            COUNT(*) AS total_pendaftar,
            SUM(IF(no_kwitansi IS NULL OR no_kwitansi = '', 1, 0)) AS total_menunggu,
            SUM(IF((no_kwitansi IS NOT NULL AND no_kwitansi != '') AND status_pendaftaran = 'Diterima', 1, 0)) AS total_diterima,
            SUM(IF(no_kwitansi IS NOT NULL AND no_kwitansi != '', 1, 0)) AS total_kwitansi,
            SUM(IF((no_kwitansi IS NOT NULL AND no_kwitansi != '') AND formulir_kembali = 1, 1, 0)) AS gelombang_1,
            SUM(IF((no_kwitansi IS NOT NULL AND no_kwitansi != '') AND formulir_kembali = 2, 1, 0)) AS gelombang_2,
            SUM(IF((no_kwitansi IS NOT NULL AND no_kwitansi != '') AND formulir_kembali = 3, 1, 0)) AS gelombang_3
        ")->first();

        $total = (int) ($statsQuery->total_pendaftar ?? 0);
        $menunggu = (int) ($statsQuery->total_menunggu ?? 0);
        $diterima = (int) ($statsQuery->total_diterima ?? 0);
        $gelombang1 = (int) ($statsQuery->gelombang_1 ?? 0);
        $gelombang2 = (int) ($statsQuery->gelombang_2 ?? 0);
        $gelombang3 = (int) ($statsQuery->gelombang_3 ?? 0);
        $totalFormulirKembali = $gelombang1 + $gelombang2 + $gelombang3;
        $totalKwitansi = (int) ($statsQuery->total_kwitansi ?? 0);

        $persenTarget = $targetSiswa > 0 ? (int) round(($totalKwitansi / $targetSiswa) * 100) : 0;

        // Jurusan counts & Chart data (Combined into single query)
        $jurusanStats = [
            'AK' => 0,
            'MP' => 0,
            'TKR' => 0,
            'TKJ' => 0,
        ];
        
        $chartLabels = [];
        $chartTotals = [];

        $jurusanCounts = Jurusan::leftJoin('pendaftar', function ($join) {
            $join->on('jurusan.id_jurusan', '=', 'pendaftar.jurusan_1')
                ->whereNull('pendaftar.deleted_at')
                ->whereNotNull('pendaftar.no_kwitansi')
                ->where('pendaftar.no_kwitansi', '!=', '');
        })
            ->select('jurusan.kode_jurusan', 'jurusan.nama_jurusan', DB::raw('COUNT(pendaftar.id_pendaftar) as total'))
            ->groupBy('jurusan.kode_jurusan', 'jurusan.nama_jurusan')
            ->get();

        foreach ($jurusanCounts as $row) {
            $totalCount = (int) $row->total;
            
            // Assign to jurusan_counts map
            if (isset($jurusanStats[$row->kode_jurusan])) {
                $jurusanStats[$row->kode_jurusan] = $totalCount;
            }
            
            // Assign to chart (only those with counts, or all - original query used join so it only fetched those with counts, but leftJoin gets all. Let's filter out 0 for chart if needed, or keep all)
            if ($totalCount > 0) {
                $chartLabels[] = $row->nama_jurusan;
                $chartTotals[] = $totalCount;
            }
        }

        // Latest registrants
        $latest = Pendaftar::with(['jurusanSatu', 'jurusanDua'])
            ->whereNotNull('no_kwitansi')
            ->where('no_kwitansi', '!=', '')
            ->orderBy('id_pendaftar', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                return [
                    'id_pendaftar' => $p->id_pendaftar,
                    'no_pendaftaran' => $p->no_pendaftaran,
                    'nama_siswa' => $p->nama_siswa,
                    'nama_jurusan' => $p->jurusanSatu ? $p->jurusanSatu->nama_jurusan : '-',
                    'status_pendaftaran' => $p->status_pendaftaran,
                    'tanggal_daftar' => $p->tanggal_daftar ? $p->tanggal_daftar->format('Y-m-d') : null,
                ];
            });

        return [
            'overview' => [
                'total' => $total,
                'menunggu' => $menunggu,
                'diterima' => $diterima,
                'pembelian_formulir' => $totalKwitansi,
                'total_formulir_kembali' => $totalFormulirKembali,
                'gelombang_1' => $gelombang1,
                'gelombang_2' => $gelombang2,
                'gelombang_3' => $gelombang3,
                'target_siswa' => $targetSiswa,
                'persen_target' => $persenTarget,
            ],
            'jurusan_counts' => $jurusanStats,
            'chart' => [
                'labels' => $chartLabels,
                'totals' => $chartTotals,
            ],
            'latest_pendaftar' => $latest,
        ];
    }
}
