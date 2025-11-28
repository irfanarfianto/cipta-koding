<?php

use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    // Halaman dashboard admin Inertia
    // Halaman dashboard admin Inertia
    Route::get('/', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

    // Modul Orders (file terpisah)
    require __DIR__.'/admin/orders.php';
    require __DIR__.'/admin/invoices.php';
    require __DIR__.'/admin/clients.php';
    require __DIR__.'/admin/services.php';
    require __DIR__.'/admin/portfolio.php';
    require __DIR__.'/admin/posts.php';
    require __DIR__.'/admin/tags.php';
    require __DIR__.'/admin/testimonials.php';
    require __DIR__.'/admin/payments.php';
    require __DIR__.'/admin/reports.php';
});
