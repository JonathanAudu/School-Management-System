<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhotoAlbum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhotoAlbumController extends Controller
{
    public function index()
    {
        return response()->json(['albums' => PhotoAlbum::with('photos')->orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('albums', 'public');
        }

        $album = PhotoAlbum::create($validated);
        return response()->json(['album' => $album, 'message' => 'Album created']);
    }

    public function update(Request $request, PhotoAlbum $album)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('cover_image')) {
            if ($album->cover_image) {
                Storage::disk('public')->delete($album->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('albums', 'public');
        }

        $album->update($validated);
        return response()->json(['album' => $album, 'message' => 'Album updated']);
    }

    public function destroy(PhotoAlbum $album)
    {
        if ($album->cover_image) {
            Storage::disk('public')->delete($album->cover_image);
        }
        $album->delete();
        return response()->json(['message' => 'Album deleted']);
    }
}
