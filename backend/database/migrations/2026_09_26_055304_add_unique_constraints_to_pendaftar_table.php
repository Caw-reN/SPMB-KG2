<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pendaftar', function (Blueprint $table) {
            $table->unique('no_pendaftaran', 'pendaftar_no_pendaftaran_unique_idx');
            $table->unique('nisn', 'pendaftar_nisn_unique_idx');
            $table->unique('no_kwitansi', 'pendaftar_no_kwitansi_unique_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftar', function (Blueprint $table) {
            $table->dropUnique('pendaftar_no_pendaftaran_unique_idx');
            $table->dropUnique('pendaftar_nisn_unique_idx');
            $table->dropUnique('pendaftar_no_kwitansi_unique_idx');
        });
    }
};
