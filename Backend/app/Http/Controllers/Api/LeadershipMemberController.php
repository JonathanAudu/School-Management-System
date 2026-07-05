<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeadershipMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LeadershipMemberController extends Controller
{
    public function index()
    {
        return response()->json(['members' => LeadershipMember::orderBy('order')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'photo' => 'nullable|image|max:10240',
            'bio' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('leadership', 'public');
        }

        $member = LeadershipMember::create($validated);
        return response()->json(['member' => $member, 'message' => 'Leadership member added']);
    }

    public function update(Request $request, LeadershipMember $leadershipMember)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'photo' => 'nullable|image|max:10240',
            'bio' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        if ($request->hasFile('photo')) {
            if ($leadershipMember->photo) {
                Storage::disk('public')->delete($leadershipMember->photo);
            }
            $validated['photo'] = $request->file('photo')->store('leadership', 'public');
        }

        $leadershipMember->update($validated);
        return response()->json(['member' => $leadershipMember, 'message' => 'Leadership member updated']);
    }

    public function destroy(LeadershipMember $leadershipMember)
    {
        if ($leadershipMember->photo) {
            Storage::disk('public')->delete($leadershipMember->photo);
        }
        $leadershipMember->delete();
        return response()->json(['message' => 'Leadership member deleted']);
    }
}
