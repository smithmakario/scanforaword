<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LibraryController extends Controller
{
    public function getBookmarks(Request $request)
    {
        $bookmarks = $request->user()->bookmarks()->with('snippet.message')->get();

        return response()->json([
            'status' => 'success',
            'data' => $bookmarks
        ]);
    }

    public function toggleBookmark(Request $request, $snippetId)
    {
        $user = $request->user();
        $bookmark = \App\Models\Bookmark::where('user_id', $user->id)
            ->where('snippet_id', $snippetId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $message = 'Removed from bookmarks';
        } else {
            \App\Models\Bookmark::create([
                'user_id' => $user->id,
                'snippet_id' => $snippetId,
            ]);
            $message = 'Added to bookmarks';
        }

        return response()->json([
            'status' => 'success',
            'message' => $message
        ]);
    }

    public function getLibraryStatus(Request $request)
    {
        // For the UI section "Library Status"
        $recentKeywords = \App\Models\Keyword::latest()->take(3)->pluck('name');

        return response()->json([
            'status' => 'success',
            'data' => [
                'indexed_keywords' => $recentKeywords,
                'summary' => 'Your content has been indexed for ' . $recentKeywords->implode(', ') . ' this week.'
            ]
        ]);
    }
}
