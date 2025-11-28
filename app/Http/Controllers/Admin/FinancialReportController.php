<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinancialReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Reports/Index');
    }

    public function summary(Request $request)
    {
        $range = $request->get('range', 'this_month'); // this_month, last_month, this_year
        
        $query = Payment::where('status', 'success');
        
        if ($range === 'this_month') {
            $query->whereMonth('paid_at', now()->month)->whereYear('paid_at', now()->year);
        } elseif ($range === 'last_month') {
            $query->whereMonth('paid_at', now()->subMonth()->month)->whereYear('paid_at', now()->subMonth()->year);
        } elseif ($range === 'this_year') {
            $query->whereYear('paid_at', now()->year);
        }

        $revenue = $query->sum('amount');

        // Pending Invoices (Total outstanding)
        $pending = Invoice::where('status', 'unpaid')->sum('amount');
        
        // Overdue Invoices
        $overdue = Invoice::where('status', 'overdue')->sum('amount');

        return response()->json([
            'revenue' => $revenue,
            'pending' => $pending,
            'overdue' => $overdue,
        ]);
    }

    public function revenueChart(Request $request)
    {
        // Monthly revenue for current year
        $data = Payment::where('status', 'success')
            ->whereYear('paid_at', now()->year)
            ->selectRaw('MONTH(paid_at) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
            
        // Fill missing months
        $chartData = [];
        for ($i = 1; $i <= 12; $i++) {
            $found = $data->firstWhere('month', $i);
            $chartData[] = [
                'month' => date('M', mktime(0, 0, 0, $i, 1)),
                'total' => $found ? (float)$found->total : 0,
            ];
        }

        return response()->json($chartData);
    }
}
