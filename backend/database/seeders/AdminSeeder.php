<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::create([
            'username' => 'kg2ok',
            'password' => Hash::make('admin123'), // Ganti password sesuai kebutuhan
        ]);
    }
}
