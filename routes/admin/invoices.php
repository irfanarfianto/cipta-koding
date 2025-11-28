<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\InvoiceController;


Route::prefix('invoices')->name('invoices.')->group(function () {
    Route::get('/',               [InvoiceController::class, 'index'])->name('index');
    Route::get('/{order}/invoices/dp', [InvoiceController::class, 'createDp'])->name('dp');
    Route::get('/{order}/invoices/pelunasan', [InvoiceController::class, 'createPelunasan'])->name('pelunasan');
    Route::get('/{invoice}/download', [\App\Http\Controllers\Admin\InvoiceController::class, 'download'])
        ->name('download');
    Route::get('/{invoice}/print', [InvoiceController::class, 'print'])->name('print');

    Route::get('/{invoice}', [InvoiceController::class, 'show'])->name('show');
    Route::put('/{invoice}', [InvoiceController::class, 'update'])->name('update');
    Route::post('/{invoice}/cancel', [InvoiceController::class, 'cancel'])->name('cancel');
    Route::post('/{invoice}/send-reminder', [InvoiceController::class, 'sendReminder'])->name('send-reminder');
});
