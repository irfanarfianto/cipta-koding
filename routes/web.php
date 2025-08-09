<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController;

Route::get('/', fn () => Inertia::render('welcome'))->name('home');

Route::middleware(['auth', 'verified'/*, 'can:access-admin'*/])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin area (semua di-file terpisah)
    require __DIR__.'/admin.php';
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
