<?php

use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    // Halaman dashboard admin Inertia
    Route::get('/', fn() => inertia('Admin/Dashboard'))->name('dashboard');

    // Modul Orders (file terpisah)
    require __DIR__.'/admin/orders.php';
    require __DIR__.'/admin/invoices.php';

    // Nanti: invoices, payments, clients, services, dst.
    // require __DIR__.'/admin/invoices.php';
    // require __DIR__.'/admin/payments.php';
    // ...
});
