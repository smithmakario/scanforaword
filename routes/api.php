<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\DailyWordController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CreatorController;
use App\Http\Controllers\Api\LibraryController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Laravel API is running',
        'timestamp' => now()
    ]);
});

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Creator Routes
    Route::prefix('creator')->group(function () {
        Route::get('/stats', [CreatorController::class, 'getStats']);
        Route::get('/messages', [CreatorController::class, 'getRecentUploads']);
        Route::post('/upload', [CreatorController::class, 'uploadMessage']);
    });

    // Library Routes
    Route::get('/bookmarks', [LibraryController::class, 'getBookmarks']);
    Route::post('/snippets/{id}/bookmark', [LibraryController::class, 'toggleBookmark']);
    Route::get('/library/status', [LibraryController::class, 'getLibraryStatus']);
});

// Public Search Routes
Route::get('/search', [SearchController::class, 'search']);
Route::get('/search/trending', [SearchController::class, 'getTrendingKeywords']);
Route::get('/search/history', [SearchController::class, 'getSearchHistory']);

// Daily Word Routes
Route::get('/categories', [DailyWordController::class, 'getCategories']);
Route::post('/preferences', [DailyWordController::class, 'setPreferences']);
Route::get('/daily-word', [DailyWordController::class, 'getToday']);
