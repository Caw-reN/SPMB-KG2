<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePengaturanRequest;
use App\Models\Pengaturan;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PengaturanController extends Controller
{
    public function show(): JsonResponse
    {
        $pengaturan = Pengaturan::getSettings();

        return response()->json([
            'success' => true,
            'data' => $pengaturan,
        ]);
    }

    public function update(UpdatePengaturanRequest $request): JsonResponse
    {
        $pengaturan = Pengaturan::getSettings();

        if (!$pengaturan) {
            $pengaturan = Pengaturan::create($request->validated());
        } else {
            $pengaturan->update($request->validated());
        }

        Cache::forget('pengaturan_terbaru');

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan berhasil disimpan',
            'data' => $pengaturan,
        ]);
    }
}
