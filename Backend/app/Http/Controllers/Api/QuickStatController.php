<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuickStat;
use Illuminate\Http\Request;

class QuickStatController extends Controller
{
    public function index()
    {
        return response()->json(['stats' => QuickStat::orderBy('order')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'icon' => 'nullable|string|max:50',
            'number' => 'required|string|max:50',
            'title' => 'required|string|max:100',
            'suffix' => 'nullable|string|max:20',
            'order' => 'nullable|integer',
        ]);

        $stat = QuickStat::create($validated);
        return response()->json(['stat' => $stat, 'message' => 'Quick stat created']);
    }

    public function update(Request $request, QuickStat $quickStat)
    {
        $validated = $request->validate([
            'icon' => 'nullable|string|max:50',
            'number' => 'required|string|max:50',
            'title' => 'required|string|max:100',
            'suffix' => 'nullable|string|max:20',
            'order' => 'nullable|integer',
        ]);

        $quickStat->update($validated);
        return response()->json(['stat' => $quickStat, 'message' => 'Quick stat updated']);
    }

    public function destroy(QuickStat $quickStat)
    {
        $quickStat->delete();
        return response()->json(['message' => 'Quick stat deleted']);
    }
}
