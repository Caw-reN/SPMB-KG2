<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pendaftar;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExportController extends Controller
{
    public function exportPendaftar(): Response
    {
        $filename = "Data_Pendaftar_SPMB_" . date('d-m-Y_H-i') . ".xls";

        $pendaftarList = Pendaftar::with(['jurusanSatu', 'jurusanDua'])
            ->orderBy('id_pendaftar', 'desc')
            ->cursor();

        $pengaturan = Pengaturan::getSettings();
        $tahunAjaran = $pengaturan ? $pengaturan->tahun_ajaran : '2026/2027';
        $namaSekolah = $pengaturan ? $pengaturan->nama_sekolah : 'SMK Karya Guna 2 Bekasi';

        ob_start();
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Export Data Pendaftar</title>
        </head>
        <body>
            <center>
                <h3>Data Pendaftar SPMB TP. <?= htmlspecialchars($tahunAjaran); ?></h3>
                <h4><?= htmlspecialchars($namaSekolah); ?></h4>
            </center>
            
            <table border="1" cellpadding="5" cellspacing="0" width="100%">
                <thead>
                    <tr style="background-color: #4CAF50; color: white; font-weight: bold;">
                        <th>No</th>
                        <th>No. Pendaftaran</th>
                        <th>No. Kwitansi</th>
                        <th>Nama Siswa</th>
                        <th>Jenis Kelamin</th> 
                        <th>Agama</th>        
                        <th>NISN</th>
                        <th>NIK</th>
                        <th>Asal Sekolah</th>
                        <th>Jurusan 1</th>
                        <th>Jurusan 2</th>
                        <th>Nama Ayah</th>
                        <th>Nama Ibu</th>
                        <th>No. HP Ortu/Wali</th>
                        <th>Status</th>
                        <th>Tanggal Daftar</th>
                    </tr>
                </thead>
                <tbody>
                    <?php 
                    $no = 1;
                    foreach ($pendaftarList as $row) { 
                        $statusColor = ($row->status_pendaftaran == 'Diterima') ? 'green' : 'orange';
                    ?>
                    <tr>
                        <td align="center"><?= $no++; ?></td>
                        <td style="mso-number-format:'\@';"><?= $row->no_pendaftaran; ?></td>
                        <td style="mso-number-format:'\@';"><?= $row->no_kwitansi; ?></td>
                        <td><?= htmlspecialchars(strtoupper($row->nama_siswa), ENT_QUOTES); ?></td>
                        <td align="center"><?= ($row->jenis_kelamin == 'L') ? 'Laki-laki' : 'Perempuan'; ?></td>
                        <td><?= htmlspecialchars(ucwords($row->agama), ENT_QUOTES); ?></td>
                        <td style="mso-number-format:'\@';"><?= $row->nisn; ?></td>
                        <td style="mso-number-format:'\@';"><?= $row->nik; ?></td>
                        <td><?= htmlspecialchars($row->nama_sekolah, ENT_QUOTES); ?></td>
                        <td><?= $row->jurusanSatu ? $row->jurusanSatu->nama_jurusan : '-'; ?></td>
                        <td><?= $row->jurusanDua ? $row->jurusanDua->nama_jurusan : '-'; ?></td>
                        <td><?= htmlspecialchars($row->nama_ayah, ENT_QUOTES); ?></td>
                        <td><?= htmlspecialchars($row->nama_ibu, ENT_QUOTES); ?></td>
                        <td style="mso-number-format:'\@';"><?= $row->no_orangtua_wali; ?></td>
                        <td style="color: <?= $statusColor ?>; font-weight: bold;">
                            <?= $row->status_pendaftaran; ?>
                        </td>
                        <td><?= $row->tanggal_daftar ? $row->tanggal_daftar->format('Y-m-d') : ''; ?></td>
                    </tr>
                    <?php } ?>
                </tbody>
            </table>
        </body>
        </html>
        <?php
        $content = ob_get_clean();

        return response($content, 200, [
            'Content-Type' => 'application/vnd-ms-excel',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    public function exportCbtLogin(Request $request): Response
    {
        $gelombangDiminta = (int) $request->query('gelombang', 1);
        if (!in_array($gelombangDiminta, [1, 2, 3])) {
            $gelombangDiminta = 1;
        }

        $filename = "Data_Login_CBT_Gelombang_{$gelombangDiminta}_" . date('d-m-Y_H-i') . ".xls";

        $pendaftarList = Pendaftar::with('jurusanSatu')
            ->where('formulir_kembali', $gelombangDiminta)
            ->orderBy('no_kwitansi', 'asc')
            ->cursor();

        $pengaturan = Pengaturan::getSettings();
        $tahunAjaran = $pengaturan ? $pengaturan->tahun_ajaran : '2026/2027';
        $namaSekolah = $pengaturan ? $pengaturan->nama_sekolah : 'SMK Karya Guna 2 Bekasi';

        ob_start();
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Export Data Login CBT</title>
            <style>
                .tabel-excel { border-collapse: collapse; width: 100%; }
                .tabel-excel th, .tabel-excel td { border: 1px solid black; padding: 5px; }
                .header-tabel { background-color: #005f3b; color: white; font-weight: bold; }
            </style>
        </head>
        <body>
            <center>
                <h3>Data Login CBT SPMB TP. <?= htmlspecialchars($tahunAjaran); ?></h3>
                <h4><?= htmlspecialchars($namaSekolah); ?></h4>
                <p><b>GELOMBANG <?= $gelombangDiminta; ?></b></p>
            </center>
            
            <table class="tabel-excel">
                <thead>
                    <tr class="header-tabel">
                        <th>No</th>
                        <th>Nama Siswa</th>
                        <th>Jurusan</th>
                        <th>Username</th>
                        <th>Password</th>
                    </tr>
                </thead>
                <tbody>
                    <?php 
                    $no = 1;
                    $hasData = false;
                    foreach ($pendaftarList as $row) { 
                        $hasData = true;
                        $username = str_replace("KW-", "", $row->no_kwitansi ?? ''); 
                    ?>
                    <tr>
                        <td align="center"><?= $no++; ?></td>
                        <td><?= htmlspecialchars(strtoupper($row->nama_siswa), ENT_QUOTES); ?></td>
                        <td align="center"><?= htmlspecialchars($row->jurusanSatu ? $row->jurusanSatu->kode_jurusan : '-'); ?></td>
                        <td style="mso-number-format:'\@';"><?= htmlspecialchars($username); ?></td>
                        <td style="mso-number-format:'\@';"><?= htmlspecialchars($row->password_cbt); ?></td>
                    </tr>
                    <?php 
                    } 
                    if (!$hasData) {
                        echo "<tr><td colspan='5' align='center'>Belum ada data pendaftar untuk tes Gelombang {$gelombangDiminta}</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </body>
        </html>
        <?php
        $content = ob_get_clean();

        return response($content, 200, [
            'Content-Type' => 'application/vnd-ms-excel',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
