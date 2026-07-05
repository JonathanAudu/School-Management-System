<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\WebsiteSetting;
use Illuminate\Support\Facades\Storage;

class WebsiteSettingController extends Controller
{
    public function index(Request $request)
    {
        $query = WebsiteSetting::query();
        
        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->get()->keyBy('key');
        return response()->json(['settings' => $settings]);
    }

    public function update(Request $request)
    {
        $settings = $request->except('_token', '_method');

        foreach ($settings as $key => $value) {
            // Skip the metadata _group keys
            if (str_ends_with($key, '_group')) continue;

            $setting = WebsiteSetting::firstOrNew(['key' => $key]);

            // Handle file uploads
            if ($request->hasFile($key)) {
                if ($setting->value) {
                    Storage::disk('public')->delete($setting->value);
                }
                $path = $request->file($key)->store('website_settings', 'public');
                $setting->value = $path;
                $setting->type = 'image';
            } else {
                // If it was an image type but we are receiving a string, it means it was unchanged or removed
                // Only update if it's not a file payload. If it's a file payload that wasn't caught, something's wrong.
                // We'll update only if it's a normal string or array.
                if (is_array($value)) {
                    $setting->value = json_encode($value);
                    $setting->type = 'json';
                } elseif (!is_null($value)) {
                    $setting->value = $value;
                }
            }

            if ($request->has($key . '_group')) {
                $setting->group = $request->input($key . '_group');
            }

            $setting->save();
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
