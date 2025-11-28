<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Pastikan user login dan adalah admin
        if ($request->user() && $request->user()->isAdmin()) {
            return $next($request);
        }

        // Jika bukan admin, redirect ke dashboard user biasa atau home
        // dengan pesan error (opsional)
        return redirect()->route('dashboard')->with('error', 'Anda tidak memiliki akses ke halaman Admin.');
    }
}
