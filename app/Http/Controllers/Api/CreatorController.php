<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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

        $totalUploads = \App\Models\Message::query()->count('*');
        $totalListens = \App\Models\Message::query()->sum('listens_count') ?? 0;
        $keywordMatches = \App\Models\SearchLog::query()->count('*');

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
        
        $messages = \App\Models\Message::query()->latest()->take(5)->get();

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
            'duration' => 'nullable|string',
            'keywords' => 'required|string',
            'content' => 'nullable|string',
            'full_url' => 'nullable|url',
            'audio_file' => 'nullable|file|mimes:mp3,wav,m4a,ogg,aac|max:102400',
            'audio_base64' => 'nullable|string',
            'audio_extension' => 'nullable|string|in:mp3,wav,m4a,ogg,aac',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_base64' => 'nullable|string',
            'image_extension' => 'nullable|string|in:jpg,jpeg,png,gif,webp',
        ]);

        $needsSupabase = $request->hasFile('audio_file')
            || !empty($validated['audio_base64'])
            || $request->hasFile('image_file')
            || !empty($validated['image_base64']);

        $supabase = $needsSupabase ? $this->supabaseConfig() : null;

        if ($needsSupabase && (!$supabase['url'] || !$supabase['key'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.'
            ], 500);
        }

        $audioUrl = null;
        $imageUrl = null;

        if ($request->hasFile('audio_file')) {
            $audioFile = $request->file('audio_file');
            $audioUrl = $this->uploadSupabaseFile(
                $supabase['url'],
                $supabase['key'],
                $supabase['audio_bucket'],
                $this->buildObjectPath('audio', $audioFile->getClientOriginalExtension()),
                $audioFile->get(),
                $audioFile->getMimeType()
            );
        } elseif (!empty($validated['audio_base64'])) {
            $audioData = base64_decode($validated['audio_base64'], true);
            if ($audioData === false) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid base64 audio payload.'
                ], 422);
            }

            $extension = $validated['audio_extension'] ?? 'mp3';
            $audioUrl = $this->uploadSupabaseFile(
                $supabase['url'],
                $supabase['key'],
                $supabase['audio_bucket'],
                $this->buildObjectPath('audio', $this->normalizeExtension($extension)),
                $audioData,
                $this->extensionToMimeType($extension)
            );
        }

        if ($request->hasFile('image_file')) {
            $imageFile = $request->file('image_file');
            $imageUrl = $this->uploadSupabaseFile(
                $supabase['url'],
                $supabase['key'],
                $supabase['image_bucket'],
                $this->buildObjectPath('image', $imageFile->getClientOriginalExtension()),
                $imageFile->get(),
                $imageFile->getMimeType()
            );
        } elseif (!empty($validated['image_base64'])) {
            $imageData = base64_decode($validated['image_base64'], true);
            if ($imageData === false) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid base64 image payload.'
                ], 422);
            }

            $extension = $validated['image_extension'] ?? 'jpg';
            $imageUrl = $this->uploadSupabaseFile(
                $supabase['url'],
                $supabase['key'],
                $supabase['image_bucket'],
                $this->buildObjectPath('image', $this->normalizeExtension($extension)),
                $imageData,
                $this->extensionToMimeType($extension)
            );
        }

        $message = \App\Models\Message::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'content' => $validated['content'] ?? null,
            'speaker' => $validated['speaker'] ?? $user->name,
            'full_url' => $audioUrl ?: ($validated['full_url'] ?? null),
            'audio_url' => $audioUrl,
            'image_url' => $imageUrl,
            'status' => 'processing',
            'duration' => $validated['duration'] ?? null,
        ]);

        $keywordNames = array_map('trim', explode(',', $validated['keywords']));
        foreach ($keywordNames as $keywordName) {
            if (!empty($keywordName)) {
                $keyword = \App\Models\Keyword::firstOrCreate(['name' => strtolower($keywordName)]);
                $message->keywords()->attach($keyword->id);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Message uploaded successfully',
            'data' => $message
        ]);
    }

    private function supabaseConfig(): array
    {
        return [
            'url' => config('services.supabase.url'),
            'key' => config('services.supabase.key'),
            'audio_bucket' => config('services.supabase.audio_bucket', 'creator-audio'),
            'image_bucket' => config('services.supabase.image_bucket', 'creator-images'),
        ];
    }

    private function buildObjectPath(string $folder, string $extension): string
    {
        $safeExtension = $this->normalizeExtension($extension);

        return trim(sprintf(
            'creator_uploads/%s/%s.%s',
            $folder,
            Str::random(16),
            $safeExtension
        ), '/');
    }

    private function normalizeExtension(string $extension): string
    {
        return strtolower(str_replace('.', '', $extension));
    }

    private function extensionToMimeType(string $extension): string
    {
        return match ($this->normalizeExtension($extension)) {
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'm4a' => 'audio/mp4',
            'ogg' => 'audio/ogg',
            'aac' => 'audio/aac',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };
    }

    private function uploadSupabaseFile(string $baseUrl, string $serviceKey, string $bucket, string $objectPath, string $content, string $contentType): string
    {
        $response = Http::withHeaders([
            'apikey' => $serviceKey,
            'Authorization' => 'Bearer '.$serviceKey,
            'Content-Type' => $contentType,
            'x-upsert' => 'true',
        ])->withBody($content, $contentType)
          ->put(rtrim($baseUrl, '/')."/storage/v1/object/{$bucket}/{$objectPath}");

        if ($response->failed()) {
            throw new \RuntimeException('Failed to upload file to Supabase storage: ' . $response->body());
        }

        return $this->buildPublicFileUrl($baseUrl, $bucket, $objectPath);
    }

    private function buildPublicFileUrl(string $baseUrl, string $bucket, string $objectPath): string
    {
        $encodedPath = implode('/', array_map('rawurlencode', explode('/', $objectPath)));

        return rtrim($baseUrl, '/')."/storage/v1/object/public/{$bucket}/{$encodedPath}";
    }
}