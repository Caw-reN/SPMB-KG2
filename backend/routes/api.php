<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\PendaftarController;
use App\Http\Controllers\Api\PengaturanController;
use App\Http\Controllers\Api\CarouselController;
use App\Http\Controllers\Api\Public\RegistrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/pengaturan', [RegistrationController::class, 'getPengaturan']);
Route::get('/jurusan', [RegistrationController::class, 'getJurusan']);
Route::post('/pendaftaran', [RegistrationController::class, 'register'])->middleware('throttle:5,1');
Route::get('/cek-status/{nisn}', [RegistrationController::class, 'cekStatus'])->middleware('throttle:10,1');
Route::get('/carousels', [CarouselController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/
Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

/*
|--------------------------------------------------------------------------
| Admin Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Pendaftar
    Route::get('/pendaftar', [PendaftarController::class, 'index']);
    Route::get('/pendaftar/{id}', [PendaftarController::class, 'show']);
    Route::put('/pendaftar/{id}', [PendaftarController::class, 'update']);
    Route::delete('/pendaftar/{id}', [PendaftarController::class, 'destroy']);
    Route::post('/pendaftar/{id}/approve', [PendaftarController::class, 'approve']);
    Route::post('/pendaftar/{id}/verify-formulir', [PendaftarController::class, 'verifyFormulir']);

    // Cetak & Print Data
    Route::get('/cetak-kartu', [PendaftarController::class, 'cetakKartuList']);
    Route::get('/pendaftar/{id}/kwitansi', [PendaftarController::class, 'kwitansiData']);
    Route::get('/pendaftar/{id}/kartu-ujian', [PendaftarController::class, 'kartuUjianData']);

    // Pengaturan
    Route::get('/pengaturan', [PengaturanController::class, 'show']);
    Route::put('/pengaturan', [PengaturanController::class, 'update']);

    // Carousel
    Route::post('/carousels', [CarouselController::class, 'store']);
    Route::put('/carousels/{id}', [CarouselController::class, 'update']);
    Route::delete('/carousels/{id}', [CarouselController::class, 'destroy']);

    // Export Excel
    Route::get('/export/pendaftar', [ExportController::class, 'exportPendaftar']);
    Route::get('/export/cbt-login', [ExportController::class, 'exportCbtLogin']);
});
