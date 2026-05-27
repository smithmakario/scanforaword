<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\DailyWord;
use App\Models\Message;
use App\Models\Snippet;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'users' => User::query()->count('*'),
                'creators' => User::query()->where('role', 'creator')->count('*'),
                'messages' => Message::query()->count('*'),
                'snippets' => Snippet::query()->count('*'),
                'bookmarks' => \App\Models\Bookmark::query()->count('*'),
                'categories' => Category::query()->count('*'),
                'daily_words' => DailyWord::query()->count('*'),
            ],
        ]);
    }

    public function users(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => User::query()->latest()->get(['id', 'name', 'email', 'phone_number', 'role', 'email_verified_at', 'created_at']),
        ]);
    }

    public function updateUserRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:user,creator,admin',
        ]);

        $user->update([
            'role' => $validated['role'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User role updated successfully.',
            'data' => $user->fresh(),
        ]);
    }

    public function messages(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => Message::query()->latest()->get(),
        ]);
    }

    public function updateMessageStatus(Request $request, Message $message)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:processing,live,archived',
        ]);

        $message->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Message status updated successfully.',
            'data' => $message->fresh(),
        ]);
    }

    public function categories(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => Category::query()->latest()->get(),
        ]);
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Category created successfully.',
            'data' => $category,
        ]);
    }

    public function dailyWords(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => DailyWord::query()->with(['snippet', 'category'])->latest()->get(),
        ]);
    }

    public function createDailyWord(Request $request)
    {
        $validated = $request->validate([
            'snippet_id' => 'required|exists:snippets,id',
            'category_id' => 'required|exists:categories,id',
            'scheduled_for' => 'required|date',
        ]);

        $dailyWord = DailyWord::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Daily word scheduled successfully.',
            'data' => $dailyWord->load(['snippet', 'category']),
        ]);
    }
}
