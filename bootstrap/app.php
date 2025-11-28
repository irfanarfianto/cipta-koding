<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, $request) {
            $response = null;

            // Hanya handle untuk request Inertia
            if (!$request->header('X-Inertia')) {
                $response = null; // biar fallback ke handler default Laravel
            } elseif ($e instanceof NotFoundHttpException) {
                // 404
                $response = Inertia::render('Errors/NotFound', [
                    'status'  => 404,
                    'message' => 'Halaman tidak ditemukan',
                ])->toResponse($request)->setStatusCode(404);
            } elseif ($e instanceof HttpExceptionInterface) {
                // HTTP exception lain (403/401/419/429/dst) -> render ServerError dengan status asli
                $status = $e->getStatusCode();
                $response = Inertia::render('Errors/ServerError', [
                    'status'  => $status,
                    // Hindari bocor detail di production; tampilkan message hanya saat debug
                    'message' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan pada server',
                ])->toResponse($request)->setStatusCode($status);
            } else {
                // Non-HTTP exception -> 500
                $response = Inertia::render('Errors/ServerError', [
                    'status'  => 500,
                    'message' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan pada server',
                ])->toResponse($request)->setStatusCode(500);
            }

            return $response;
        });
    })->create();
