<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('pengaturan')) {
            Schema::create('pengaturan', function (Blueprint $table) {
                $table->increments('id');
                $table->string('nama_sekolah', 50)->nullable();
                $table->string('tahun_ajaran', 20)->nullable();
                $table->integer('gelombang')->nullable();
                $table->integer('target_siswa')->nullable();
                $table->string('judul', 255)->nullable();
                $table->text('deskripsi')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan');
    }
};
