<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DailyWordController extends Controller
{
    public function getCategories()
    {
        return response()->json([
            'status' => 'success',
            'data' => \App\Models\Category::all()
        ]);
    }

    public function setPreferences(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id',
        ]);

        // Find user by email or phone
        $user = \App\Models\User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        if (!$user) {
            $user = \App\Models\User::create([
                'name' => 'User ' . substr($request->identifier, 0, 5),
                'email' => str_contains($request->identifier, '@') ? $request->identifier : null,
                'phone_number' => !str_contains($request->identifier, '@') ? $request->identifier : null,
                'password' => bcrypt(str(\Illuminate\Support\Str::random(16))),
            ]);
        }

        $user->categories()->sync($request->categories);

        return response()->json([
            'status' => 'success',
            'message' => 'Preferences updated successfully'
        ]);
    }

    public function getToday(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
        ]);

        $user = \App\Models\User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        $today = now()->toDateString();
        $query = \App\Models\DailyWord::where('scheduled_for', $today);

        if ($user && $user->categories()->exists()) {
            $categoryIds = $user->categories()->pluck('categories.id');
            $query->whereIn('category_id', $categoryIds);
        }

        $dailyWord = $query->with('snippet.message')->first();

        if (!$dailyWord) {
            // Fallback to any daily word for today
            $dailyWord = \App\Models\DailyWord::where('scheduled_for', $today)
                ->with('snippet.message')
                ->first();
        }

        return response()->json([
            'status' => 'success',
            'data' => $dailyWord
        ]);
    }
}
