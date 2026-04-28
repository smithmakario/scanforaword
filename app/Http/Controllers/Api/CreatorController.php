<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CreatorController extends Controller
{
    public function getStats(Request $request)
    {
        // For the demo, we use aggregated data
        $totalUploads = \App\Models\Message::count();
        $totalListens = \App\Models\Message::sum('listens_count');
        $keywordMatches = \App\Models\SearchLog::count(); // Simplified metric

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_uploads' => [
                    'value' => $totalUploads,
                    'growth' => '+12%'
                ],
                'total_listens' => [
                    'value' => number_format($totalListens / 1000, 1) . 'k',
                    'growth' => '+24%'
                ],
                'keyword_matches' => [
                    'value' => $keywordMatches,
                    'growth' => '+8%'
                ],
                'insights' => [
                    'peak_time' => '5 AM - 7 AM',
                    'engagement_score' => 75
                ]
            ]
        ]);
    }

    public function getRecentUploads(Request $request)
    {
        $messages = \App\Models\Message::latest()->take(5)->get();

        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    }

    public function uploadMessage(Request $request)
    {
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
            'status' => 'processing', // As shown in UI
            'duration' => $validated['duration'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Message uploaded and processing',
            'data' => $message
        ]);
    }
}
