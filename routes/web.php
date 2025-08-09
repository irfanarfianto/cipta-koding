<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('/admin', fn() => inertia('Admin/Dashboard'))->name('admin.dashboard');
    Route::prefix('admin')->name('admin.')->group(function () {
        // ... semua resource dan routes admin kamu di sini
    });
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
