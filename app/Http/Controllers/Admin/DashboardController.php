<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Client;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // METRICS
        $metrics = [
            'total_orders'     => Order::count(),
            'new_orders'       => Order::where('status', 'Menunggu Konfirmasi')->count(),
            'unpaid_invoices'  => Invoice::where('status', 'unpaid')->count(),
            'total_revenue'    => (float) Payment::sum('amount'),
            'total_clients'    => Client::count(),
            'active_services'  => Service::where('is_active', true)->count(),
            'projects_in_progress' => Order::whereIn('status', ['Dalam Pengerjaan', 'Revisi'])->count(),
            // Asumsi: Order punya due_date atau kita pakai created_at + estimasi. 
            // Untuk sekarang kita pakai placeholder 0 atau logic sederhana jika ada kolom deadline.
            // Kita akan update ini nanti jika ada kolom deadline di tabel orders.
            'projects_late'    => 0, 
        ];

        // CHART: monthly revenue (12 bulan terakhir)
        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            $monthlyRevenue = DB::table('payments')
                ->selectRaw("to_char(date_trunc('month', COALESCE(paid_at, created_at)), 'YYYY-MM') as ym, SUM(amount)::float as total")
                ->whereRaw("COALESCE(paid_at, created_at) >= (CURRENT_DATE - INTERVAL '12 months')")
                ->groupByRaw("date_trunc('month', COALESCE(paid_at, created_at))")
                ->orderByRaw("date_trunc('month', COALESCE(paid_at, created_at))")
                ->get();
        } else { // mysql
            $monthlyRevenue = DB::table('payments')
                ->selectRaw("DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m') as ym, SUM(amount) as total")
                ->whereRaw("COALESCE(paid_at, created_at) >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
                ->groupByRaw("DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m')")
                ->orderByRaw("DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m')")
                ->get();
        }

        // Distribusi status order
        $statusDist = Order::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        // KPI & Analytics
        $totalOrders = Order::count();
        $completedOrders = Order::where('status', 'Selesai')->count();
        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;

        $totalInvoices = Invoice::count();
        $paidInvoices = Invoice::where('status', 'paid')->count();
        $collectionRate = $totalInvoices > 0 ? ($paidInvoices / $totalInvoices) * 100 : 0;

        $avgOrderValue = $totalOrders > 0 ? ((float) Payment::sum('amount') / $totalOrders) : 0;

        // Popular Services (Top 5)
        $popularServices = DB::table('order_items')
            ->join('services', 'order_items.item_id', '=', 'services.id')
            ->where('order_items.item_type', 'service') // Asumsi morph map 'service' atau class name
            ->select('services.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // LIST TERBARU
        $latestOrders = Order::with('client')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($o)=>[
                'id'         => $o->id,
                'order_code' => $o->order_code,
                'status'     => $o->status,
                'final_amount'=> $o->final_amount,
                'client'     => [
                    'id'    => $o->client?->id,
                    'name'  => $o->client?->name,
                    'email' => $o->client?->email,
                ],
                'created_at' => $o->created_at?->toISOString(),
            ]);

        $dueInvoices = Invoice::with('order.client')
            ->where('status', 'unpaid')
            ->orderBy('due_date')
            ->take(5)
            ->get()
            ->map(fn($inv)=>[
                'id'           => $inv->id,
                'invoice_code' => $inv->invoice_code,
                'amount'       => $inv->amount,
                'due_date'     => optional($inv->due_date)->format('Y-m-d'),
                'order'        => [
                    'id'         => $inv->order?->id,
                    'order_code' => $inv->order?->order_code,
                ],
                'client'       => [
                    'id'   => $inv->order?->client?->id,
                    'name' => $inv->order?->client?->name,
                ],
            ]);

        $recentPayments = Payment::with('invoice.order.client')
            ->orderByDesc(DB::raw('COALESCE(paid_at, created_at)'))
            ->take(5)
            ->get()
            ->map(fn($p)=>[
                'id'       => $p->id,
                'amount'   => $p->amount,
                'method'   => $p->method,
                'paid_at'  => optional($p->paid_at ?? $p->created_at)->format('Y-m-d H:i'),
                'invoice'  => [
                    'id'           => $p->invoice?->id,
                    'invoice_code' => $p->invoice?->invoice_code,
                ],
                'order'    => [
                    'id'         => $p->invoice?->order?->id,
                    'order_code' => $p->invoice?->order?->order_code,
                ],
                'client'   => [
                    'id'   => $p->invoice?->order?->client?->id,
                    'name' => $p->invoice?->order?->client?->name,
                ],
            ]);

        return Inertia::render('Admin/Dashboard', [
            'metrics'         => $metrics,
            'charts'          => [
                'monthly_revenue' => $monthlyRevenue,
                'order_status_distribution' => $statusDist,
            ],
            'kpi' => [
                'completion_rate' => round($completionRate, 1),
                'collection_rate' => round($collectionRate, 1),
                'avg_order_value' => $avgOrderValue,
            ],
            'popular_services' => $popularServices,
            'latest_orders'   => $latestOrders,
            'due_invoices'    => $dueInvoices,
            'recent_payments' => $recentPayments,
        ]);
    }
}
