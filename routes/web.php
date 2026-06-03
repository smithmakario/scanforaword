<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminPageController;

Route::view('/', 'landing')->name('landing');

Route::get('/admin/login', [AdminPageController::class, 'showLogin'])->name('login');
Route::post('/admin/login', [AdminPageController::class, 'login']);

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/verify', [AdminPageController::class, 'showVerify'])->name('admin.verify');
    Route::post('/admin/verify', [AdminPageController::class, 'verifyOtp'])->name('admin.verify.post');
    Route::post('/admin/logout', [AdminPageController::class, 'logout'])->name('admin.logout');

    Route::middleware('email.verified')->group(function () {
            Route::get('/admin', [AdminPageController::class, 'showDashboard'])->name('admin.dashboard');
            Route::post('/admin/messages/{message}/status', [AdminPageController::class, 'updateMessageStatus'])->name('admin.messages.status');
            Route::post('/admin/messages/{message}/delete', [AdminPageController::class, 'deleteMessage'])->name('admin.messages.delete');
            Route::post('/admin/categories', [AdminPageController::class, 'createCategory'])->name('admin.categories.create');
            Route::post('/admin/categories/{category}/delete', [AdminPageController::class, 'deleteCategory'])->name('admin.categories.delete');
            Route::post('/admin/daily-words', [AdminPageController::class, 'createDailyWord'])->name('admin.dailyWords.create');
            Route::post('/admin/daily-words/{dailyWord}/delete', [AdminPageController::class, 'deleteDailyWord'])->name('admin.dailyWords.delete');
            Route::post('/admin/users/{user}/role', [AdminPageController::class, 'updateUserRole'])->name('admin.users.role');
    });
});
