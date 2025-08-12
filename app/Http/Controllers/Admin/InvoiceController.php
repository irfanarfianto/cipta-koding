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
use Barryvdh\DomPDF\Facade\Pdf;


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

    public function download(Invoice $invoice)
    {
        // Pastikan semua relasi yang dibutuhkan ikut dimuat
        $invoice->loadMissing([
            'order.client',
            'order.items.item', // item adalah relasi ke model produk/jasa; sesuaikan kalau namanya beda
            'payments',
            'order.invoices.payments', // untuk hitung total paid order
        ]);

        $order = $invoice->order;
        $items = $order?->items ?? collect();

        // Hitung subtotal order dari items (qty * price)
        $orderSubtotal = (int) $items->sum(function ($row) {
            return ((int) $row->quantity) * ((int) $row->price);
        });

        // Final amount order (pakai final_amount kalau ada; fallback subtotal)
        $orderFinal = (int) ($order->final_amount ?? $orderSubtotal);

        // Total pembayaran terhadap order (dari semua invoice)
        $orderPaid = (int) $order->invoices->sum(function ($inv) {
            return (int) $inv->payments->sum('amount');
        });

        $orderDue = max(0, $orderFinal - $orderPaid);

        // Ringkasan invoice ini
        $thisInvoicePaid = (int) $invoice->payments->sum('amount');
        $thisInvoiceRemaining = max(0, (int) $invoice->amount - $thisInvoicePaid);

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice'             => $invoice,
            'order'               => $order,
            'items'               => $items,
            'orderSubtotal'       => $orderSubtotal,
            'orderFinal'          => $orderFinal,
            'orderPaid'           => $orderPaid,
            'orderDue'            => $orderDue,
            'thisInvoicePaid'     => $thisInvoicePaid,
            'thisInvoiceRemaining' => $thisInvoiceRemaining,
        ])->setPaper('a4', 'portrait');

        $filename = ($invoice->invoice_code ?: "invoice-{$invoice->id}") . '.pdf';
        return $pdf->download($filename);
    }
}
