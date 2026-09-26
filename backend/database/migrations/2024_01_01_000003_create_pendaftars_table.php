<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('pendaftar')) {
            Schema::create('pendaftar', function (Blueprint $table) {
                $table->increments('id_pendaftar');
                $table->string('no_pendaftaran', 20)->nullable();
                $table->string('no_kwitansi', 20)->nullable();
                $table->string('nama_siswa', 255);
                $table->string('nisn', 10)->nullable();
                $table->string('nik', 16)->nullable();
                $table->string('jenis_kelamin', 1);
                $table->string('agama', 10);
                $table->integer('jurusan_1')->nullable();
                $table->integer('jurusan_2')->nullable();
                $table->string('nama_ayah', 100)->nullable();
                $table->string('nama_ibu', 100)->nullable();
                $table->string('no_orangtua_wali', 20)->nullable();
                $table->string('nama_sekolah', 100)->nullable();
                $table->text('alamat_smp')->nullable();
                $table->string('npsn', 10)->nullable();
                $table->string('status_pendaftaran', 50)->default('Menunggu');
                $table->integer('gelombang')->nullable();
                $table->string('password_cbt', 255)->nullable();
                $table->tinyInteger('formulir_kembali')->default(0);
                $table->date('tanggal_daftar')->nullable();
                $table->timestamp('deleted_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pendaftar');
    }
};
