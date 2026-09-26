<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('jurusan')) {
            Schema::create('jurusan', function (Blueprint $table) {
                $table->increments('id_jurusan');
                $table->string('kode_jurusan', 20);
                $table->string('nama_jurusan', 100);
                $table->dateTime('created_at', 3)->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('jurusan');
    }
};
