<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ServiceController;

Route::resource('services', ServiceController::class)->except(['show']);
