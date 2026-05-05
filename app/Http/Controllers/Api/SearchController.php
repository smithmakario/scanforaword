<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string', // email or phone
            'keyword' => 'required|string',
        ]);

        $identifier = $request->identifier;
        $keywordName = strtolower($request->keyword);

        // Search in Messages (all status for now)
        $messages = \App\Models\Message::where(function($query) use ($keywordName) {
            $query->where('title', 'LIKE', "%$keywordName%")
                ->orWhere('content', 'LIKE', "%$keywordName%")
                ->orWhereHas('keywords', function($q) use ($keywordName) {
                    $q->where('name', $keywordName);
                });
        })
        ->get();

        // Also search in snippets
        $snippets = \App\Models\Snippet::where('title', 'LIKE', "%$keywordName%")
            ->orWhere('content', 'LIKE', "%$keywordName%")
            ->orWhereHas('keywords', function($query) use ($keywordName) {
                $query->where('name', $keywordName);
            })
            ->with('message')
            ->get();

        // Log the search
        \App\Models\SearchLog::create([
            'email_or_phone' => $identifier,
            'keyword' => $keywordName,
            'result_count' => count($messages) + count($snippets),
        ]);

        // Transform messages to include in results
        $messageResults = $messages->map(function($msg) {
            return [
                'id' => $msg->id,
                'title' => $msg->title,
                'content' => $msg->content,
                'keyword' => $msg->keywords->pluck('name')->implode(', '),
                'speaker' => $msg->speaker,
                'duration' => $msg->duration,
                'full_url' => $msg->full_url,
            ];
        });

        // Combine and return
        $allResults = $messageResults->concat($snippets);

        return response()->json([
            'status' => 'success',
            'query' => [
                'identifier' => $identifier,
                'keyword' => $keywordName,
            ],
            'results_count' => $allResults->count(),
            'data' => $allResults,
        ]);
    }

    public function getTrendingKeywords()
    {
        // Get keywords with most searches in logs
        $trending = \App\Models\SearchLog::select('keyword', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
            ->groupBy('keyword')
            ->orderBy('total', 'desc')
            ->take(5)
            ->pluck('keyword');

        // Fallback if no logs
        if ($trending->isEmpty()) {
            $trending = ['Peace', 'Resilience', 'Clarity', 'Kindness', 'Gratitude'];
        }

        return response()->json([
            'status' => 'success',
            'data' => $trending
        ]);
    }

    public function getSearchHistory(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
        ]);

        $history = \App\Models\SearchLog::where('email_or_phone', $request->identifier)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $history
        ]);
    }

    public function visualScan(Request $request)
    {
        // Placeholder for OCR / AI scanning
        return response()->json([
            'status' => 'success',
            'message' => 'Visual scan completed',
            'detected_text' => 'Faith',
            'results' => \App\Models\Snippet::where('content', 'LIKE', '%Faith%')->with('message')->get()
        ]);
    }
}
