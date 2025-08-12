<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Invoice\InvoiceStoreRequest;
use App\Http\Requests\Admin\Invoice\InvoiceUpdateRequest;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\Request;


class InvoiceController extends Controller
{
    public function index()
    {
        $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';

        $invoices = Invoice::query()
            ->with('order.client')
            ->when(request('status'), fn($q) => $q->where('status', request('status')))
            ->when(request('search'), function ($q) use ($like) {
                $s = request('search');
                $q->where(fn($w) => $w->where('invoice_code', $like, "%$s%")
                    ->orWhereHas('order.client', fn($c) => $c->where('name', $like, "%$s%")));
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Invoices/Index', [
            'invoices' => $invoices,
            'filters'  => request()->only(['status', 'search']),
            'statuses' => ['unpaid', 'paid', 'overdue', 'cancelled'],
        ]);
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['order.client', 'payments']);
        return Inertia::render('Admin/Invoices/Show', ['invoice' => $invoice]);
    }

    public function store(InvoiceStoreRequest $request, Order $order)
    {
        $data = $request->validated();

        $invoice = $order->invoices()->create([
            'invoice_code' => 'INV-' . now()->format('ymd') . '-' . str()->upper(str()->random(5)),
            'amount'       => $data['amount'],
            'due_date'     => $data['due_date'],
            'status'       => 'unpaid',
        ]);

        return redirect()->route('admin.invoices.show', $invoice)->with('success', 'Invoice dibuat.');
    }

    public function update(InvoiceUpdateRequest $request, Invoice $invoice)
    {
        $invoice->update($request->validated());
        return back()->with('success', 'Invoice diperbarui.');
    }

    // POST /admin/orders/{order}/invoices/dp
    public function createDp(Request $request, Order $order)
    {
        $data = $request->validate([
            'amount'   => ['nullable', 'numeric', 'min:0'],
            'percent'  => ['nullable', 'numeric', 'min:1', 'max:100'],
            'due_date' => ['required', 'date'],
        ]);

        // final_amount bisa null → anggap 0
        $final = (float) ($order->final_amount ?? 0);

        // Jika nominal diisi, pakai itu; jika kosong, hitung dari persen (default 50%)
        $amount = $data['amount'] ?? null;
        if (is_null($amount)) {
            $pct    = (float) ($data['percent'] ?? 50);
            $amount = (int) round($final * $pct / 100);
        }

        // Safety: tidak boleh lebih dari final
        $amount = max(0, min($amount, $final));

        $order->invoices()->create([
            'invoice_code' => 'INV-' . now()->format('ymd') . '-' . str()->upper(str()->random(5)),
            'amount'       => $amount,
            'status'       => 'unpaid',
            'due_date'     => $data['due_date'],
        ]);

        // Opsional: setelah buat DP, ubah status order → Menunggu Pembayaran (kalau masih Menunggu Konfirmasi)
        if ($order->status === 'Menunggu Konfirmasi') {
            $order->update(['status' => 'Menunggu Pembayaran']);
        }

        return back()->with('success', 'Invoice DP dibuat.');
    }

    // POST /admin/orders/{order}/invoices/pelunasan
    public function createPelunasan(Request $request, Order $order)
    {
        $data = $request->validate([
            'amount'   => ['nullable', 'numeric', 'min:0'],
            'due_date' => ['required', 'date'],
        ]);

        $final = (float) ($order->final_amount ?? 0);
        $paid  = (float) $order->invoices()->withSum('payments', 'amount')->get()->sum('payments_sum_amount');
        $due   = max(0, $final - $paid);

        // Jika nominal diisi, pakai itu; jika kosong, tagih seluruh sisa
        $amount = $data['amount'] ?? $due;

        // Safety: cap di sisa
        $amount = max(0, min($amount, $due));

        $order->invoices()->create([
            'invoice_code' => 'INV-' . now()->format('ymd') . '-' . str()->upper(str()->random(5)),
            'amount'       => $amount,
            'status'       => 'unpaid',
            'due_date'     => $data['due_date'],
        ]);

        return redirect()

            ->with('success', 'Invoice pelunasan dibuat.');
    }
}
