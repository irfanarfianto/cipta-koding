<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Jika admin, redirect ke admin dashboard
        if ($request->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        // Untuk user biasa, tampilkan dashboard user atau redirect ke orders
        // Untuk saat ini kita redirect ke My Orders
        return redirect()->route('my.orders.index');
    }
}
