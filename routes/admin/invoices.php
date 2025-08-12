<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\InvoiceController;


Route::prefix('invoices')->name('invoices.')->group(function () {
    Route::get('/', fn() => Inertia::render('Admin/Invoices/Index'))->name('index');
    Route::get('/{order}/invoices/dp', [InvoiceController::class, 'createDp'])->name('orders.invoices.dp');
    Route::get('/{order}/invoices/pelunasan', [InvoiceController::class, 'createPelunasan'])->name('orders.invoices.pelunasan');
    Route::get('/{invoice}/download', [\App\Http\Controllers\Admin\InvoiceController::class, 'download'])
        ->name('download');
    Route::get('/{invoice}', [InvoiceController::class, 'show'])->name('show');
});
