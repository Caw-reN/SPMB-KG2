# Hasil Audit Sistem SPMB LATEST (Frontend & Backend)

Berdasarkan pengecekan menyeluruh pada direktori kode, kerangka kerja Laravel (Backend), dan React Vite (Frontend), berikut adalah temuan audit terkait kerentanan, kinerja server, kueri database (N+1), dan area krusial lainnya.

---

## 1. Kerentanan Keamanan & Integritas Data (Kritis)

### Race Condition pada Generator Nomor (Pendaftaran & Kwitansi)
**Lokasi:** `app/Services/PendaftarService.php` (`generateNoPendaftaran` & `generateNoKwitansi`)
- **Masalah:** Fungsi pembuatan nomor mengandalkan pengecekan `count()` dan mengambil data terakhir (`first()`). Jika ada **dua atau lebih pendaftar yang mengklik "Daftar" di detik/milidetik yang persis sama** (Concurrency), mereka berpotensi besar mendapatkan `no_pendaftaran` atau `no_kwitansi` yang **sama/ganda**.
- **Solusi:** Wajib dibungkus dalam `DB::transaction()` dengan menggunakan teknik penguncian `lockForUpdate()` pada tabel counter khusus, atau lebih amannya menggunakan Trigger/Sequence generator yang atomik.

### Tidak Adanya Konstrain `UNIQUE` Pada Field Kunci Database
**Lokasi:** `database/migrations/`
- **Masalah:** File migrasi untuk tabel `pendaftar` hanya mendaftarkan `index()` untuk field `no_pendaftaran`, `nik`, dan `no_kwitansi`, tetapi **TIDAK MENGGUNAKAN `unique()`**. Hal ini memperparah celah *Race Condition* di atas karena *database* tidak akan menolak jika ada data duplikat yang dipaksakan masuk.
- **Solusi:** Segera tambahkan migrasi baru untuk melakukan `ALTER TABLE pendaftar ADD UNIQUE(no_pendaftaran)` dan `UNIQUE(nik)`.

---

## 2. Kinerja & Potensi Beban Server (Performance Issues)

### Endpoint `/admin/cetak-kartu` Melakukan "Load All" Tanpa Batas (Heavy Query)
**Lokasi:** `PendaftarController::cetakKartuList` & Frontend `CetakKartuUjian.jsx`
- **Masalah:** Fungsi API ini menggunakan `->get()` tanpa paginasi (`paginate`). Jika sekolah Anda memiliki ribuan pendaftar yang diterima (misal: 3000 data), maka *backend* akan menarik **seluruh 3000 baris ke dalam memori RAM server sekaligus** dan mengirimkan ratusan kilobyte JSON mentah dalam sekali *request*. Hal ini bisa memicu *Out of Memory (OOM)* pada *server* dan *lag* yang signifikan pada *browser* pengguna.
- **Solusi:** Ubah agar Endpoint menggunakan Pagination, dan komponen *frontend* melakukan *lazy loading* atau *server-side search* yang benar tanpa meminta seluruh data di awal.

---

## 3. Audit N+1 Query & Optimasi Kueri (Sangat Baik)

Secara umum, manajemen kueri pada aplikasi ini **SANGAT TEROPTIMASI**. Anda (dan developer Anda) pantas mendapatkan apresiasi untuk area ini.

- **N+1 Query Issue: AMAN (TIDAK ADA)** 
  Seluruh fungsi *Controller* (`PendaftarController`, `DashboardController`, `ExportController`) telah rajin memanggil relasi *eager loading* (Contoh: `Pendaftar::with(['jurusanSatu'])`). Tidak ada *query* di dalam perulangan `for` maupun `foreach`.
- **Query Ekstraksi Data (Export): AMAN**
  Pada file `ExportController.php`, sistem berhasil menggunakan metode `.cursor()` Laravel. Ini adalah praktik terbaik (Best Practice) karena data diekspor baris per baris tanpa membebani RAM server (*memory-efficient*).
- **Dashboard Aggregation: AMAN**
  Alih-alih melakukan hitungan `Pendaftar::where(...)->count()` secara berulang, `DashboardService.php` menggunakan kueri SQL cerdas berupa `selectRaw` dengan `SUM(IF(...))` untuk mendapatkan semua jenis hitungan statistik *(Total, Menunggu, Diterima, dll)* hanya dalam **Satu Kali Query** database. Ini menghemat beban *server* secara eksponensial.

---

## 4. Keamanan Frontend & API
- **Rate Limiting:** API `/pendaftaran` sudah diamankan dengan pembatasan (*throttle* 5 permintaan/menit). Ini mencegah serangan DDoS sederhana atau spam bot dari sisi klien.
- **Validasi Permintaan:** File `StorePendaftarRequest` (Backend) memastikan data divalidasi dan diubah tipe datanya (seperti *Title Case* nama) sebelum masuk ke database, sehingga mencegah injeksi kasar dari sisi klien.

### Kesimpulan Audit
Sistem Anda secara arsitektural sudah **stabil dan sangat ringan** dari segi eksekusi kueri. Namun, perbaikan minor namun fatal harus segera dilakukan pada **generator nomor pendaftaran** dan penambahan konstrain `UNIQUE` agar pendaftaran serentak tidak merusak integritas *database* di masa depan.

---
---

# AUDIT KE-2 (26 September 2026)

Audit lanjutan yang lebih mendalam pada seluruh aspek keamanan, logika bisnis, privasi data, dan ketahanan sistem.

---

## 1. Kerentanan XSS (Cross-Site Scripting) — KRITIS ⚠️

### `dangerouslySetInnerHTML` pada Pesan Error Pendaftaran
**Lokasi:** `frontend/src/pages/public/Home.jsx` (baris ~236)
```jsx
<span dangerouslySetInnerHTML={{ __html: errorMessage }} />
```
- **Masalah:** Pesan error dari backend (`err.response.data.message`) di-*render* langsung sebagai HTML mentah. Jika seorang penyerang berhasil memanipulasi respons server (misalnya melalui Man-in-the-Middle di jaringan tanpa HTTPS, atau jika backend mengembalikan data yang mengandung tag `<script>`), maka kode JavaScript berbahaya bisa dieksekusi di browser pengguna. Ini disebut **Stored/Reflected XSS**.
- **Dampak:** Pencurian cookie, pengalihan ke situs phishing, atau pencurian data formulir pendaftar.
- **Solusi:** Ganti `dangerouslySetInnerHTML` dengan render teks biasa `{errorMessage}`. Jika memang perlu HTML, gunakan library sanitizer seperti `DOMPurify`.

---

## 2. Kebocoran Data Sensitif pada API Publik — TINGGI ⚠️

### Endpoint Cek Status Mengekspos NIK
**Lokasi:** `RegistrationController::cekStatus` (baris 82)
- **Masalah:** Endpoint publik `GET /api/cek-status/{nisn}` mengembalikan field `nik` (Nomor Induk Kependudukan 16 digit) dalam respons JSON. Ini artinya **siapapun** yang mengetahui NISN seseorang (informasi yang relatif mudah didapat, misalnya dari rapor teman sekelas) bisa mendapatkan NIK korban secara gratis.
- **Dampak:** NIK adalah data pribadi yang sangat sensitif dan bisa disalahgunakan untuk pinjaman online ilegal, penipuan identitas, dll.
- **Solusi:** Hapus field `nik` dari respons `cekStatus`. Frontend (`CheckStatus.jsx`) bahkan tidak menampilkan NIK, jadi field ini memang tidak diperlukan.

### Endpoint Cek Status Tidak Memiliki Rate Limiting
**Lokasi:** `routes/api.php` (baris 20)
```php
Route::get('/cek-status/{nisn}', [RegistrationController::class, 'cekStatus']);
```
- **Masalah:** Endpoint ini sepenuhnya terbuka tanpa `throttle`. Penyerang bisa menjalankan *script* otomatis yang menebak semua kemungkinan NISN (10 digit, dimulai dengan `00...`) secara massal untuk meng-*harvest* (memanen) data seluruh pendaftar: nama, sekolah asal, jurusan, NIK, dll.
- **Solusi:** Tambahkan middleware `throttle:10,1` (10 request per menit) pada route ini.

---

## 3. Halaman Login Admin Rentan Brute Force — TINGGI ⚠️

### Login Tanpa Rate Limiting & Tanpa Lockout
**Lokasi:** `routes/api.php` (baris 28) & `AuthController::login`
```php
Route::post('/admin/login', [AuthController::class, 'login']);
```
- **Masalah:** Endpoint login admin **tidak memiliki** pembatasan percobaan (`throttle`). Penyerang bisa melakukan percobaan login sebanyak tak terbatas menggunakan *brute-force tool* seperti Hydra atau Burp Suite. Dengan kecepatan 100 percobaan/detik, password lemah seperti `admin123` bisa ditemukan dalam hitungan menit.
- **Solusi:** Tambahkan `->middleware('throttle:5,1')` pada route login, dan idealnya implementasikan sistem *account lockout* (kunci akun setelah 5x gagal selama 15 menit).

---

## 4. Password CBT Tersimpan Tanpa Enkripsi (Plaintext) — SEDANG ⚠️

### Password CBT Disimpan & Dikirim Apa Adanya
**Lokasi:** `PendaftarService::generatePasswordCbt` & `PendaftarController::cetakKartuList`, `kartuUjianData`
- **Masalah:** Password CBT (Computer Based Test) disimpan di database dalam bentuk **teks biasa** (`plaintext`), bukan di-hash. Selain itu, password ini dikirim langsung ke frontend melalui API JSON. Jika database bocor, seluruh password ujian siswa ikut terekspos.
- **Catatan:** Ini mungkin *by design* karena password CBT memang perlu dicetak di kartu ujian. Namun tetap merupakan risiko jika terjadi kebocoran database.
- **Solusi (Opsional):** Jika memungkinkan, simpan password CBT di kolom terpisah yang terenkripsi dan hanya bisa didekripsi saat cetak kartu.

---

## 5. Nilai Hardcoded yang Membuat Sistem Tidak Fleksibel — SEDANG

### Tanggal Tes Ujian Hardcoded di Frontend
**Lokasi:** `frontend/src/pages/admin/PrintKartu.jsx` (baris 123)
```jsx
<div className="data-field tanggal-tes">07 Februari 2026</div>
```
- **Masalah:** Tanggal tes ujian tertulis langsung dalam kode (*hardcoded*). Jika jadwal ujian berubah, developer harus mengubah kode sumber, build ulang, dan deploy ulang. Ini bukan hal yang bisa dilakukan oleh admin sekolah biasa.
- **Solusi:** Tambahkan field `tanggal_tes` di tabel `pengaturan` agar admin bisa mengatur tanggal ujian dari halaman Pengaturan di dashboard.

### Biaya Formulir Hardcoded
**Lokasi:** `frontend/src/pages/public/Success.jsx` (baris 57)
```jsx
<h3>Rp 200.000,-</h3>
```
- **Masalah:** Nominal biaya formulir pendaftaran tertulis langsung dalam kode. Jika harga berubah tahun depan, harus diubah manual di kode sumber.
- **Solusi:** Tambahkan field `biaya_formulir` di tabel `pengaturan`.

### Prefix Nomor Pendaftaran & Kwitansi Hardcoded
**Lokasi:** `PendaftarService.php` (baris 13 & 39)
```php
$prefix = 'SPMBKG2-26';
$prefix = 'KW-SPMB26-';
```
- **Masalah:** Prefix ini dikunci ke tahun 2026. Ketika tahun ajaran berganti, prefix ini harus diubah secara manual oleh developer.
- **Solusi:** Buat prefix bisa dikonfigurasi melalui tabel `pengaturan` atau file `.env`.

### Tahun Ajaran Hardcoded di Halaman Login
**Lokasi:** `frontend/src/pages/admin/Login.jsx` (baris 58)
```jsx
<p>Tahun Ajaran 2026/2027</p>
```
- **Masalah:** Teks tahun ajaran di-hardcode. Tahun depan, admin harus meminta developer untuk mengubahnya.
- **Solusi:** Fetch data tahun ajaran dari API `/pengaturan` di halaman login.

---

## 6. Kelemahan Logika Bisnis — SEDANG

### Soft Delete Tapi Nomor Tetap "Terkunci" — ✅ DIPERBAIKI
**Lokasi:** `Pendaftar.php` & `PendaftarService.php`
- **Masalah:** Jika seorang admin menghapus data pendaftar (soft delete), data tersebut sebenarnya masih ada di database (hanya ditandai `deleted_at`). Namun, generator nomor pendaftaran hanya melihat data yang belum dihapus (`Pendaftar::whereNotNull(...)` tanpa `withTrashed()`). Ini bisa menyebabkan **tabrakan nomor** jika nomor pendaftar terakhir yang sudah di-*soft delete* di-generate ulang oleh pendaftar baru.
- **Solusi:** Gunakan `Pendaftar::withTrashed()->whereNotNull(...)` pada generator nomor agar tetap memperhitungkan data yang sudah dihapus. *(Sudah diterapkan pada `generateNoPendaftaran`, `generateNoKwitansi`, dan `isNikRegistered`)*.

### Tidak Ada Validasi Status Transisi — ✅ DIPERBAIKI
**Lokasi:** `PendaftarService::approve` & `PendaftarController::approve`
- **Masalah:** Endpoint approve tidak mengecek apakah status pendaftar saat ini masih "Menunggu". Artinya, pendaftar yang sudah "Diterima" bisa di-approve lagi, atau pendaftar yang sudah "Ditolak" bisa langsung diubah ke "Diterima" tanpa kontrol.
- **Solusi:** Tambahkan pengecekan `if ($pendaftar->status_pendaftaran !== 'Menunggu')` dan kembalikan respon error 422 jika status bukan 'Menunggu'. *(Sudah diterapkan di service dan controller)*.

---

## 7. Keamanan Token & Sesi — RENDAH

### Token Sanctum Tidak Memiliki Masa Kedaluwarsa (Expiry)
**Lokasi:** `AuthController::login` (baris 38)
```php
$token = $admin->createToken('admin-token')->plainTextToken;
```
- **Masalah:** Token yang dibuat tidak memiliki batas waktu kedaluwarsa (`expiration`). Jika token dicuri (misalnya dari browser yang ditinggalkan terbuka di lab komputer), penyerang bisa menggunakan token tersebut **selamanya** sampai admin secara manual logout.
- **Solusi:** Atur `expiration` di `config/sanctum.php` atau gunakan `$admin->createToken('admin-token', ['*'], now()->addHours(8))`.

### Token Disimpan di `localStorage`
**Lokasi:** `frontend/src/context/AuthContext.jsx` (baris 40)
- **Masalah:** Token autentikasi disimpan di `localStorage` browser. Penyimpanan ini rentan terhadap serangan XSS (jika ada celah XSS, penyerang bisa membaca `localStorage` menggunakan `document.cookie` / `localStorage.getItem`). 
- **Catatan:** Ini merupakan praktik umum di SPA (*Single Page Application*). Alternatif yang lebih aman adalah menggunakan `httpOnly cookie`, tetapi implementasinya lebih kompleks.

---

## 8. Informasi yang Terlalu Detail pada Pesan Error — RENDAH

### NISN Dikembalikan dalam Pesan Error 404
**Lokasi:** `RegistrationController::cekStatus` (baris 70)
```php
'message' => "Data pendaftar dengan NISN {$nisn} tidak ditemukan."
```
- **Masalah:** Mengembalikan input user dalam pesan error memberi konfirmasi kepada penyerang bahwa NISN tertentu **belum terdaftar**. Ini membantu proses *data enumeration* (mengetahui mana NISN yang valid dan mana yang tidak).
- **Solusi:** Gunakan pesan generik seperti `"Data pendaftar tidak ditemukan. Pastikan NISN yang Anda masukkan sudah benar."` tanpa mengulangi NISN-nya.

---

## 9. Endpoint Cetak Kartu Masih Tanpa Paginasi — PERFORMA

### `cetakKartuList` Masih Menggunakan `->get()` (Belum Diperbaiki)
**Lokasi:** `PendaftarController::cetakKartuList` (baris 216)
- **Status:** Temuan dari Audit ke-1 ini **BELUM DIPERBAIKI**. Endpoint masih menarik seluruh data sekaligus ke memori.

---

## 10. Produksi Readiness — PENTING SEBELUM DEPLOY

### `APP_DEBUG` Harus Dimatikan di Production
**Lokasi:** `.env` / `.env.example`
- **Masalah:** Jika `APP_DEBUG=true` saat production, setiap error PHP akan menampilkan *stack trace* lengkap termasuk nama file, path server, nama database, dan informasi sensitif lainnya kepada publik.
- **Solusi:** Pastikan `APP_DEBUG=false` dan `APP_ENV=production` di file `.env` server production.

### `console.error` Masih Aktif di Seluruh Frontend
**Lokasi:** Ditemukan di **16 lokasi** di seluruh file JSX (`Home.jsx`, `CheckStatus.jsx`, `DataPendaftar.jsx`, `Pengaturan.jsx`, `CetakKartuUjian.jsx`, dll.)
- **Masalah:** Pesan error detail yang dicetak ke console browser bisa dibaca oleh siapapun yang membuka Developer Tools (F12). Informasi ini bisa mengungkap URL API internal, struktur data, dan detail teknis lainnya kepada penyerang.
- **Solusi:** Gunakan *environment check* (`if (import.meta.env.DEV)`) sebelum `console.error`, atau gunakan library logging yang otomatis nonaktif di production build.

---

## Ringkasan Temuan Audit ke-2

| No | Temuan | Tingkat | Status |
|----|--------|---------|--------|
| 1 | XSS via `dangerouslySetInnerHTML` | 🔴 KRITIS | ✅ Diperbaiki |
| 2 | NIK terekspos di endpoint Cek Status publik | 🔴 TINGGI | ✅ Diperbaiki |
| 3 | Cek Status tanpa rate limiting | 🔴 TINGGI | ✅ Diperbaiki |
| 4 | Login admin tanpa rate limiting (brute force) | 🔴 TINGGI | ✅ Diperbaiki |
| 5 | Password CBT plaintext | 🟡 SEDANG | By Design |
| 6 | Tanggal tes, biaya, prefix hardcoded | 🟡 SEDANG | Belum Diperbaiki |
| 7 | Soft delete vs generator nomor (potensi tabrakan) | 🟡 SEDANG | ✅ Diperbaiki |
| 8 | Tidak ada validasi transisi status | 🟡 SEDANG | ✅ Diperbaiki |
| 9 | Token tanpa expiry | 🟢 RENDAH | Belum Diperbaiki |
| 10 | Token di localStorage | 🟢 RENDAH | Catatan |
| 11 | NISN di pesan error 404 | 🟢 RENDAH | ✅ Diperbaiki |
| 12 | Cetak kartu tanpa paginasi | 🟡 PERFORMA | Belum Diperbaiki |
| 13 | APP_DEBUG & console.error di production | 🟡 PENTING | Belum Diperbaiki |
| 14 | Data internal & `target_siswa` di endpoint publik | 🟡 SEDANG | ✅ Diperbaiki |

---

# ============================================================
# AUDIT KE-3 (Keamanan Lanjutan, Integritas Data & Arsitektur)
# ============================================================

Tanggal: 26 September 2026
Fokus Audit: Validasi Input, Ekspor Dokumen (Formula Injection), Manajemen Sesi/Token, Alur Cetak Kartu & Kwitansi, Upload Media, serta Skalabilitas Sistem.

---

## 1. Keamanan Validasi Input (Input Sanitization & Injection)

### 1.1 NISN & NIK Hanya Dicek Ukuran String (Bisa Diisi Huruf/Simbol) — ✅ DIPERBAIKI
**Lokasi:** `StorePendaftarRequest.php` & `UpdatePendaftarRequest.php`
- **Masalah:** Sistem hanya mengecek panjang string 10 dan 16 karakter tanpa memvalidasi apakah isinya angka (`numeric` / `digits`). Pendaftar bisa menginput `abcdefghij` untuk NISN dan lolos validasi.
- **Dampak:** Data pendaftar menjadi tidak valid dan merusak integritas data saat sinkronisasi Dapodik atau pencarian NISN di kemudian hari.
- **Solusi:** Ubah menjadi `'nisn' => 'required|digits:10'` dan `'nik' => 'required|digits:16'`. *(Sudah diterapkan di `StorePendaftarRequest` dan `UpdatePendaftarRequest`)*.

### 1.2 `alamat_smp` Tanpa Batas Panjang Karakter (Potensi DoS Payload Flooding) — ✅ DIPERBAIKI
**Lokasi:** `StorePendaftarRequest.php` & `UpdatePendaftarRequest.php`
- **Masalah:** Tidak ada batasan `max` panjang karakter pada alamat. Penyerang dapat mengirim payload teks berukuran sangat besar (misal 5MB string) yang membebani memori PHP dan database.
- **Solusi:** Tambahkan batas wajar: `'alamat_smp' => 'required|string|max:500'`. *(Sudah diterapkan di `StorePendaftarRequest` dan `UpdatePendaftarRequest`)*.

---

## 2. Keamanan Ekspor Berkas (Spreadsheet & Injection)

### 2.1 Kerentanan Formula Injection (CSV / Excel Injection) pada Ekspor Siswa — TINGGI
**Lokasi:** `ExportController.php` (`exportPendaftar` dan `exportCbtLogin`)
- **Masalah:** Sistem mengekspor tabel HTML sebagai file `.xls` yang dibuka dengan Microsoft Excel. Jika calon pendaftar mendaftarkan nama yang diawali dengan karakter formula seperti `=`, `+`, `-`, atau `@` (contoh: `=cmd|' /C calc'!A0` atau `@SUM(...)`), Excel akan menginterpretasikannya sebagai formula dinamis atau perintah eksternal saat file dibuka oleh admin.
- **Solusi:** Bersihkan atau berikan prefix tanda kutip satu `'` atau spasi di depan setiap sel teks yang diawali karakter formula (`=`, `+`, `-`, `@`), dan pastikan seluruh output teks dibungkus `htmlspecialchars()`.

### 2.2 Nilai Kolom Ekspor Tidak Dilindungi `htmlspecialchars()` — SEDANG
**Lokasi:** `ExportController.php` (baris 68, 69, 73, 74, 80)
- **Masalah:** Nilai `no_pendaftaran`, `no_kwitansi`, `nisn`, `nik`, `nama_jurusan`, dan `no_orangtua_wali` langsung dicetak tanpa `htmlspecialchars($value, ENT_QUOTES)`. Jika data mengandung karakter `<` atau `>`, struktur tabel HTML ekspor bisa rusak atau berpotensi XSS jika dibuka di browser.
- **Solusi:** Selalu gunakan `htmlspecialchars()` untuk seluruh variabel yang dicetak ke dalam template HTML ekspor.

---

## 3. Integritas Cetak Kartu & Kwitansi

### 3.1 Kartu Ujian & Kwitansi Bisa Diakses/Dicetak untuk Siswa yang Belum Bayar — ✅ DIPERBAIKI
**Lokasi:** `PendaftarController.php` (`kartuUjianData` & `kwitansiData`)
- **Masalah:** Jika endpoint `/api/admin/pendaftar/{id}/kartu-ujian` atau `kwitansi` diakses untuk siswa yang statusnya masih `'Menunggu'` (belum memiliki kwitansi / belum verifikasi bayar), sistem tetap mengembalikan data dengan `username_cbt` kosong (`""`) dan nomor kwitansi `"-"`. Admin bisa tidak sengaja mencetak kartu ujian untuk siswa yang belum melunasi biaya formulir.
- **Solusi:** Berikan validasi: jika `status_pendaftaran !== 'Diterima'` atau `no_kwitansi` masih kosong, tolak dengan pesan error HTTP 422 bahwa pendaftar belum menyelesaikan administrasi pembayaran formulir. *(Sudah diterapkan di backend & pesan penolakan ditampilkan di frontend)*.

### 3.2 `PrintKwitansi.jsx` Mengambil Raw Object Pendaftar, Bukan Endpoint Khusus Kwitansi — ✅ DIPERBAIKI
**Lokasi:** `PrintKwitansi.jsx`
- **Masalah:** Komponen cetak kwitansi memanggil endpoint `GET /admin/pendaftar/{id}` (data mentah pendaftar) alih-alih endpoint resmi `GET /admin/pendaftar/{id}/kwitansi` yang sudah diformat rapi beserta data nama sekolah dan tahun ajaran dinamis.
- **Solusi:** Arahkan request di `PrintKwitansi.jsx` ke endpoint `/admin/pendaftar/${id}/kwitansi`. *(Sudah diterapkan)*.

---

## 4. Keamanan Autentikasi & Manajemen Sesi

### 4.1 Token Sanctum Terakumulasi Tanpa Batas (Multiple Active Sessions Leak) — SEDANG
**Lokasi:** `AuthController::login` (baris 38)
- **Masalah:** Setiap kali admin berhasil login, token baru dibuat tanpa menghapus token-token lama (`$admin->createToken('admin-token')`). Karena Sanctum di konfigurasi default tidak memiliki expiry, token-token lama yang pernah dibuat di laptop/HP lain akan tetap aktif selamanya di tabel `personal_access_tokens`.
- **Solusi:** Lakukan `$admin->tokens()->delete();` sebelum membuat token baru (single-session), atau atur expiration pada Sanctum config.

### 4.2 Endpoint `/admin/me` Terpanggil di Halaman Pengunjung Publik — RENDAH
**Lokasi:** `AuthContext.jsx` & `App.jsx`
- **Masalah:** `AuthProvider` membungkus seluruh aplikasi. Jika admin pernah login di peramban yang sama lalu membuka halaman depan formulir pendaftaran umum (`/` atau `/cek-status`), `useEffect` di `AuthContext` tetap mengirim request `GET /api/admin/me`.
- **Solusi:** Batasi pemanggilan `verifyAuth` / `/admin/me` hanya ketika pengguna mengakses rute yang berawalan `/admin`.

---

## 5. Kinerja & Skalabilitas (Performance Bottlenecks)

### 5.1 Endpoint `cetakKartuList` Tanpa Paginasi — PERFORMA
**Lokasi:** `PendaftarController::cetakKartuList` (baris 223)
- **Masalah:** Menggunakan `->get()` tanpa paginasi. Ketika jumlah pendaftar mencapai ribuan, respon JSON akan sangat besar, memakan RAM server, dan membuat halaman admin terasa lag.
- **Solusi:** Terapkan paginasi (misal `->paginate(20)`) mirip dengan endpoint data pendaftar utama.

### 5.2 Beban Memori pada Unggah Gambar Carousel (Intervention GD Memory Spike) — PERFORMA / DoS
**Lokasi:** `CarouselController::store` (baris 30)
- **Masalah:** Batas ukuran unggah foto diatur hingga 10MB (`max:10240`). Library `Intervention Image` driver GD membutuhkan memori hingga 100MB+ saat mendekompresi gambar beresolusi 4K/8K sebelum di-scale down.
- **Solusi:** Turunkan batas maksimal file menjadi 2MB - 3MB (`max:3072`), yang sudah lebih dari cukup untuk banner web tajam setelah kompresi.

### 5.3 Hardcoded Jurusan pada Dashboard Admin — ARSITEKTUR
**Lokasi:** `DashboardService.php` & `Dashboard.jsx`
- **Masalah:** Kode jurusan (`AK`, `MP`, `TKR`, `TKJ`) ditulis statis di backend dan markup frontend. Jika pihak sekolah menambah jurusan baru (misal RPL atau DKV) di database, jurusan tersebut tidak akan muncul pada dashboard.
- **Solusi:** Buat query dinamis berdasarkan tabel `jurusan` dan looping card jurusan secara dinamis di frontend.

---

## Ringkasan Temuan Audit ke-3

| No | Temuan | Kategori | Tingkat | Status |
|:--:|:-------|:---------|:-------:|:------:|
| 1 | Validasi NISN & NIK tidak wajib numerik (`digits:10`/`digits:16`) | Validasi Data | 🔴 TINGGI | ✅ Diperbaiki |
| 2 | Formula Injection (CSV/XLS Injection) pada Ekspor Excel | Keamanan Ekspor | 🔴 TINGGI | Belum Diperbaiki |
| 3 | `alamat_smp` tanpa batasan karakter maksimal (DoS risk) | Validasi Data | 🟡 SEDANG | ✅ Diperbaiki |
| 4 | Kartu Ujian & Kwitansi bisa dicetak untuk siswa belum bayar | Logika Bisnis | 🟡 SEDANG | ✅ Diperbaiki |
| 5 | Token Sanctum lama tidak di-revoke saat login baru (Token Leaks) | Autentikasi | 🟡 SEDANG | Belum Diperbaiki |
| 6 | Nilai kolom ekspor Excel belum di-escape `htmlspecialchars()` | Keamanan Ekspor | 🟡 SEDANG | Belum Diperbaiki |
| 7 | Upload foto Carousel 10MB berisiko lonjakan memori RAM | Performa / DoS | 🟡 SEDANG | Belum Diperbaiki |
| 8 | Cetak Kartu Ujian di admin belum menggunakan paginasi | Performa | 🟡 SEDANG | Belum Diperbaiki |
| 9 | Jurusan di-hardcode statis di Dashboard Admin | Arsitektur | 🟡 SEDANG | Belum Diperbaiki |
| 10 | `/admin/me` terpanggil saat membuka form publik jika ada token | Arsitektur | 🟢 RENDAH | Belum Diperbaiki |
| 11 | `PrintKwitansi.jsx` memanggil endpoint raw pendaftar | Arsitektur | 🟢 RENDAH | ✅ Diperbaiki |
