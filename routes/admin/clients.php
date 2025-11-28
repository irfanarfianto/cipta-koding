<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ClientController;

Route::resource('clients', ClientController::class);
