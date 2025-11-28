<?php

use App\Http\Controllers\Admin\TagController;
use Illuminate\Support\Facades\Route;

Route::resource('tags', TagController::class)->except(['create','edit','show']);
