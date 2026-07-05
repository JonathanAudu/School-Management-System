<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhotoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'photo_album_id' => 'required|exists:photo_albums,id',
            'image' => 'required|image|max:5120', // up to 5MB
        ]);

        $path = $request->file('image')->store('photos', 'public');
        
        $photo = Photo::create([
            'photo_album_id' => $request->photo_album_id,
            'image' => $path,
        ]);

        return response()->json(['photo' => $photo, 'message' => 'Photo added']);
    }

    public function destroy(Photo $photo)
    {
        Storage::disk('public')->delete($photo->image);
        $photo->delete();
        return response()->json(['message' => 'Photo deleted']);
    }
}
