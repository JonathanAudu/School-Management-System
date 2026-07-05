<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsAnnouncementController extends Controller
{
    public function index()
    {
        return response()->json(['news' => NewsAnnouncement::orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'published_at' => 'nullable|date',
            'image' => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('news', 'public');
        }

        $news = NewsAnnouncement::create($validated);
        return response()->json(['news' => $news, 'message' => 'News created']);
    }

    public function update(Request $request, NewsAnnouncement $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'published_at' => 'nullable|date',
            'image' => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('image')) {
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $validated['image'] = $request->file('image')->store('news', 'public');
        }

        $news->update($validated);
        return response()->json(['news' => $news, 'message' => 'News updated']);
    }

    public function destroy(NewsAnnouncement $news)
    {
        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }
        $news->delete();
        return response()->json(['message' => 'News deleted']);
    }
}
