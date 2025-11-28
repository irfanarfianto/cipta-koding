<?php

use App\Http\Controllers\Admin\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::resource('testimonials', TestimonialController::class);
