<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\OrderController;

define('ORDER_ROUTE', '/{order}');

Route::prefix('orders')->name('orders.')->group(function () {
    // CRUD
    Route::get('/',               [OrderController::class, 'index'])->name('index');
    Route::get('/export',         [OrderController::class, 'exportCsv'])->name('export'); // CSV
    Route::get('/create',         [OrderController::class, 'create'])->name('create');
    Route::post('/',              [OrderController::class, 'store'])->name('store');
    Route::get(ORDER_ROUTE,        [OrderController::class, 'show'])->name('show');
    Route::put(ORDER_ROUTE,        [OrderController::class, 'update'])->name('update');
    Route::delete(ORDER_ROUTE,     [OrderController::class, 'destroy'])->name('destroy');

    // Status
    Route::patch(ORDER_ROUTE . '/status',  [OrderController::class, 'updateStatus'])->name('update-status');
    Route::post('/bulk/status',      [OrderController::class, 'bulkUpdateStatus'])->name('bulk-status');

    // Items
    Route::post(ORDER_ROUTE . '/items',                    [OrderController::class, 'addItem'])->name('items.add');
    Route::put(ORDER_ROUTE . '/items/{orderItem}',         [OrderController::class, 'updateItem'])->name('items.update');
    Route::delete(ORDER_ROUTE . '/items/{orderItem}',      [OrderController::class, 'removeItem'])->name('items.remove');

    // Invoices (shortcut tombol di detail order)
    Route::post(ORDER_ROUTE . '/invoice/dp',        [OrderController::class, 'createInvoiceDp'])->name('invoice.dp');
    Route::post(ORDER_ROUTE . '/invoice/pelunasan', [OrderController::class, 'createInvoicePelunasan'])->name('invoice.pelunasan');
});
