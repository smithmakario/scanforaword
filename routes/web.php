<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'landing')->name('landing');
Route::view('/admin', 'admin.dashboard')->name('admin.dashboard');
