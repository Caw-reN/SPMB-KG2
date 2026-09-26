<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('admin')) {
            Schema::create('admin', function (Blueprint $table) {
                $table->increments('id');
                $table->string('username', 255)->unique();
                $table->string('password', 255);
                $table->timestamp('Created_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin');
    }
};
