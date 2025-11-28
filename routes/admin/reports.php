<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\FinancialReportController;

Route::prefix('reports')->name('reports.')->group(function () {
    Route::get('/', [FinancialReportController::class, 'index'])->name('index');
    Route::get('/summary', [FinancialReportController::class, 'summary'])->name('summary');
    Route::get('/revenue-chart', [FinancialReportController::class, 'revenueChart'])->name('revenue-chart');
});
