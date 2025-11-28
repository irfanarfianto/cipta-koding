<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Public Routes (Frontend)
Route::get('/', fn() => Inertia::render('welcome'))->name('home');

// Public Services (dapat diakses tanpa login)
Route::get('/services', [\App\Http\Controllers\Public\ServiceController::class, 'index'])->name('public.services.index');
Route::get('/services/{service:slug}', [\App\Http\Controllers\Public\ServiceController::class, 'show'])->name('public.services.show');

// Authenticated Routes (User Area)
Route::middleware(['auth', 'verified'])->group(function () {
    // Public Dashboard (Redirect logic)
    Route::get('/dashboard', [\App\Http\Controllers\Public\DashboardController::class, 'index'])->name('dashboard');

    // User Orders (Public Controllers - untuk user biasa)
    Route::prefix('my')->name('my.')->group(function () {
        Route::resource('orders', \App\Http\Controllers\Public\OrderController::class)->only(['index', 'show']);
        Route::resource('invoices', \App\Http\Controllers\Public\InvoiceController::class)->only(['index', 'show']);
        Route::resource('quotations', \App\Http\Controllers\Public\QuotationController::class)->only(['index', 'show']);
        
        // Quotation actions
        Route::post('quotations/{quotation}/accept', [\App\Http\Controllers\Public\QuotationController::class, 'accept'])
            ->name('quotations.accept');
        Route::post('quotations/{quotation}/reject', [\App\Http\Controllers\Public\QuotationController::class, 'reject'])
            ->name('quotations.reject');
    });

    // Admin area (semua di-file terpisah)
    Route::middleware(['admin'])->group(function () {
        require __DIR__ . '/admin.php';
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
