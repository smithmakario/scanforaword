<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\DailyWordController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Laravel API is running',
        'timestamp' => now()
    ]);
});

Route::get('/search', [SearchController::class, 'search']);

Route::get('/categories', [DailyWordController::class, 'getCategories']);
Route::post('/preferences', [DailyWordController::class, 'setPreferences']);
Route::get('/daily-word', [DailyWordController::class, 'getToday']);
