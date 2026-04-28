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

        // Find the keyword
        $keyword = \App\Models\Keyword::where('name', $keywordName)->first();

        $snippets = [];
        if ($keyword) {
            $snippets = $keyword->snippets()->with('message')->get();
        }

        // Log the search
        \App\Models\SearchLog::create([
            'email_or_phone' => $identifier,
            'keyword' => $keywordName,
            'result_count' => count($snippets),
        ]);

        return response()->json([
            'status' => 'success',
            'query' => [
                'identifier' => $identifier,
                'keyword' => $keywordName,
            ],
            'results_count' => count($snippets),
            'data' => $snippets,
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
}
