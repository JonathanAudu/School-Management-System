<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GradingScale;
use Illuminate\Http\Request;

class GradingScaleController extends Controller
{
    public function index()
    {
        $scales = GradingScale::orderBy('min_score', 'desc')->get();
        if ($scales->isEmpty()) {
            $defaults = [
                ['min_score' => 70, 'max_score' => 100, 'grade' => 'A', 'remark' => 'Excellent'],
                ['min_score' => 60, 'max_score' => 69, 'grade' => 'B', 'remark' => 'Very Good'],
                ['min_score' => 50, 'max_score' => 59, 'grade' => 'C', 'remark' => 'Good'],
                ['min_score' => 45, 'max_score' => 49, 'grade' => 'D', 'remark' => 'Pass'],
                ['min_score' => 0, 'max_score' => 44, 'grade' => 'F', 'remark' => 'Fail'],
            ];
            foreach ($defaults as $default) {
                GradingScale::create($default);
            }
            $scales = GradingScale::orderBy('min_score', 'desc')->get();
        }
        return response()->json($scales);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'scales' => 'required|array',
            'scales.*.min_score' => 'required|integer',
            'scales.*.max_score' => 'required|integer',
            'scales.*.grade' => 'required|string',
            'scales.*.remark' => 'required|string',
        ]);

        GradingScale::truncate();
        foreach ($validated['scales'] as $scaleData) {
            GradingScale::create($scaleData);
        }

        return response()->json(['message' => 'Grading scale updated successfully']);
    }
}
