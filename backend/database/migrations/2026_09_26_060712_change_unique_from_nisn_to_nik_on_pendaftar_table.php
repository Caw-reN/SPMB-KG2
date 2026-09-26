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
            $table->dropUnique('pendaftar_nisn_unique_idx');
            $table->unique('nik', 'pendaftar_nik_unique_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftar', function (Blueprint $table) {
            $table->dropUnique('pendaftar_nik_unique_idx');
            $table->unique('nisn', 'pendaftar_nisn_unique_idx');
        });
    }
};
