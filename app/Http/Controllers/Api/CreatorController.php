<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CreatorController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'creator') {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied. Creator role required.'
            ], 403);
        }

        $totalUploads = \App\Models\Message::count();
        $totalListens = \App\Models\Message::sum('listens_count') ?? 0;
        $keywordMatches = \App\Models\SearchLog::count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'uploads' => $totalUploads,
                'listens' => $totalListens,
                'keyword_matches' => $keywordMatches,
                'peak_time' => '5 AM - 7 AM',
                'engagement' => 75
            ]
        ]);
    }

    public function getRecentUploads(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'creator') {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied. Creator role required.'
            ], 403);
        }
        
        $messages = \App\Models\Message::latest()->take(5)->get();

        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    }

    public function uploadMessage(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'creator') {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied. Creator role required.'
            ], 403);
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'speaker' => 'nullable|string',
            'full_url' => 'nullable|url',
            'duration' => 'nullable|string',
        ]);

        $message = \App\Models\Message::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'speaker' => $validated['speaker'] ?? 'Apostle Segun Obadje',
            'full_url' => $validated['full_url'] ?? null,
            'status' => 'processing',
            'duration' => $validated['duration'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Message uploaded and processing',
            'data' => $message
        ]);
    }
}