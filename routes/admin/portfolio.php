<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\PortfolioController;

Route::resource('portfolio', PortfolioController::class)->parameters([
    'portfolio' => 'portfolio'
]);
