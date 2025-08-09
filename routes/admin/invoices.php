<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('invoices')->name('invoices.')->group(function () {
    Route::get('/', fn () => Inertia::render('Admin/Invoices/Index'))->name('index');
});
