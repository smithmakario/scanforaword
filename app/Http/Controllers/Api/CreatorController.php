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
            'audio_base64' => 'nullable|string',
            'image_base64' => 'nullable|string',
            'keywords' => 'required|string',
            'content' => 'nullable|string',
        ]);

        $audioPath = null;
        $imagePath = null;

        // Handle audio file upload
        if (!empty($validated['audio_base64'])) {
            $audioData = base64_decode($validated['audio_base64']);
            $audioName = 'audio_' . time() . '.mp3';
            $audioPath = 'messages/' . $audioName;
            \Illuminate\Support\Facades\Storage::disk('public')->put($audioPath, $audioData);
        }

        // Handle image file upload
        if (!empty($validated['image_base64'])) {
            $imageData = base64_decode($validated['image_base64']);
            $imageName = 'image_' . time() . '.jpg';
            $imagePath = 'messages/' . $imageName;
            \Illuminate\Support\Facades\Storage::disk('public')->put($imagePath, $imageData);
        }

        $message = \App\Models\Message::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'content' => $validated['content'] ?? null,
            'speaker' => $validated['speaker'] ?? $user->name,
            'full_url' => $audioPath ? \Illuminate\Support\Facades\Storage::disk('public')->url($audioPath) : ($validated['full_url'] ?? null),
            'status' => 'processing',
            'duration' => $validated['duration'] ?? null,
        ]);

        // Handle keywords
        $keywordNames = array_map('trim', explode(',', $validated['keywords']));
        foreach ($keywordNames as $keywordName) {
            if (!empty($keywordName)) {
                $keyword = \App\Models\Keyword::firstOrCreate(['name' => strtolower($keywordName)]);
                $message->keywords()->attach($keyword->id);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Message uploaded and processing',
            'data' => $message
        ]);
    }
}