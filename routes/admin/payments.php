<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\PaymentController;

Route::prefix('payments')->name('payments.')->group(function () {
    Route::get('/', [PaymentController::class, 'index'])->name('index');
    Route::post('/{invoice}', [PaymentController::class, 'store'])->name('store');
    Route::put('/{payment}', [PaymentController::class, 'update'])->name('update');
    Route::delete('/{payment}', [PaymentController::class, 'destroy'])->name('destroy');
});
