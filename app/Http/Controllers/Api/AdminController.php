<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\DailyWord;
use App\Models\Message;
use App\Models\Snippet;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

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

    public function deleteMessage(Request $request, Message $message)
    {
        $this->deleteAssociatedSupabaseObjects($message);
        $message->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Message removed successfully.',
        ]);
    }

    public function deleteCategory(Request $request, Category $category)
    {
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category removed successfully.',
        ]);
    }

    public function deleteDailyWord(Request $request, DailyWord $dailyWord)
    {
        $dailyWord->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Daily word removed successfully.',
        ]);
    }

    private function deleteAssociatedSupabaseObjects(Message $message): void
    {
        $supabase = [
            'url' => config('services.supabase.url'),
            'key' => config('services.supabase.key'),
            'audio_bucket' => config('services.supabase.audio_bucket', 'creator-audio'),
            'image_bucket' => config('services.supabase.image_bucket', 'creator-images'),
        ];

        if (!$supabase['url'] || !$supabase['key']) {
            return;
        }

        foreach (['audio_url' => $supabase['audio_bucket'], 'image_url' => $supabase['image_bucket']] as $field => $bucket) {
            if (!empty($message->{$field})) {
                $objectPath = $this->extractSupabaseObjectPath($message->{$field}, $bucket);
                if ($objectPath) {
                    $this->deleteSupabaseObject($supabase['url'], $supabase['key'], $bucket, $objectPath);
                }
            }
        }
    }

    private function extractSupabaseObjectPath(string $url, string $bucket): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) {
            return null;
        }

        $needle = "/storage/v1/object/public/{$bucket}/";
        $position = strpos($path, $needle);

        if ($position === false) {
            return null;
        }

        return substr($path, $position + strlen($needle));
    }

    private function deleteSupabaseObject(string $baseUrl, string $serviceKey, string $bucket, string $objectPath): bool
    {
        $response = Http::withHeaders([
            'apikey' => $serviceKey,
            'Authorization' => 'Bearer '.$serviceKey,
        ])->delete(rtrim($baseUrl, '/')."/storage/v1/object/{$bucket}/{$objectPath}");

        return !$response->failed();
    }
}
