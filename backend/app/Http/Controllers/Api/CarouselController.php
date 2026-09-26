<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carousel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;

class CarouselController extends Controller
{
    public function index(Request $request)
    {
        $query = Carousel::query();
        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }
        return response()->json([
            'success' => true,
            'data' => $query->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB limit
        ]);

        $file = $request->file('image');
        $filename = uniqid('carousel_') . '.jpg';
        $path = 'carousels/' . $filename;

        // Compress image using Intervention Image
        $manager = new ImageManager(new Driver());
        $image = $manager->decode($file->getPathname());
        
        // Scale down if width is greater than 1920px to save space
        $image->scaleDown(width: 1920);

        // Encode as JPEG with 80% quality to get "tiny jpg" effect
        $encoded = $image->encode(new JpegEncoder(quality: 80));

        // Save to public disk
        Storage::disk('public')->put($path, (string) $encoded);

        $carousel = Carousel::create([
            'image_path' => $path,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $carousel,
            'message' => 'Carousel berhasil ditambahkan'
        ]);
    }

    public function update(Request $request, string $id)
    {
        $carousel = Carousel::findOrFail($id);
        
        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $carousel->update([
            'is_active' => $request->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status carousel berhasil diubah',
            'data' => $carousel
        ]);
    }

    public function destroy(string $id)
    {
        $carousel = Carousel::findOrFail($id);
        if ($carousel->image_path && Storage::disk('public')->exists($carousel->image_path)) {
            Storage::disk('public')->delete($carousel->image_path);
        }
        $carousel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Carousel berhasil dihapus'
        ]);
    }
}
