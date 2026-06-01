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
        Route::view('/admin', 'admin.dashboard')->name('admin.dashboard');
    });
});
