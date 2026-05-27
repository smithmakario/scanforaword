<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\DailyWordController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CreatorController;
use App\Http\Controllers\Api\LibraryController;

Route::middleware('throttle:api')->group(function () {
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
    Route::post('/login/social', [AuthController::class, 'socialLogin']); // Placeholder for Google/Apple

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

        // Admin Routes
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::patch('/users/{user}/role', [AdminController::class, 'updateUserRole']);
            Route::get('/messages', [AdminController::class, 'messages']);
            Route::patch('/messages/{message}/status', [AdminController::class, 'updateMessageStatus']);
            Route::get('/categories', [AdminController::class, 'categories']);
            Route::post('/categories', [AdminController::class, 'createCategory']);
            Route::get('/daily-words', [AdminController::class, 'dailyWords']);
            Route::post('/daily-words', [AdminController::class, 'createDailyWord']);
        });

        // Creator Routes
        Route::prefix('creator')->middleware('role:creator')->group(function () {
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
    Route::post('/search/visual', [SearchController::class, 'visualScan']); // For OCR searching

    // Daily Word Routes
    Route::get('/categories', [DailyWordController::class, 'getCategories']);
    Route::post('/preferences', [DailyWordController::class, 'setPreferences']);
    Route::get('/daily-word', [DailyWordController::class, 'getToday']);
});
