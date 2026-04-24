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
}
