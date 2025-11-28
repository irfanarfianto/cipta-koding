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
            ->status(request('status'))
            ->ofType(request('type'))
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
            'filters'  => request()->only(['status', 'type', 'search']),
            'statuses' => ['unpaid', 'paid', 'overdue', 'cancelled'],
            'types'    => ['dp', 'pelunasan', 'milestone', 'full'],
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
            'invoice_code'   => 'INV-' . now()->format('ymd') . '-' . str()->upper(str()->random(5)),
            'type'           => $data['type'] ?? 'full',
            'amount'         => (float) $data['amount'],
            'due_date'       => $data['due_date'],
            'status'         => 'unpaid',
            'tax_amount'     => $data['tax_amount'] ?? 0,
            'tax_percentage' => $data['tax_percentage'] ?? 0,
            'subtotal'       => $data['subtotal'] ?? $data['amount'],
            'notes'          => $data['notes'] ?? null,
            'payment_method' => $data['payment_method'] ?? null,
        ]);

        return redirect()->route('admin.invoices.show', $invoice)->with('success', 'Invoice dibuat.');
    }

    public function cancel(Invoice $invoice)
    {
        $invoice->update(['status' => 'cancelled']);
        return back()->with('success', 'Invoice dibatalkan.');
    }

    public function sendReminder(Invoice $invoice)
    {
        $invoice->update(['reminder_sent_at' => now()]);
        // TODO: Implement actual email/WA sending logic here
        return back()->with('success', 'Pengingat pembayaran dikirim.');
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

        $remaining = $order->remainingToInvoice(); // final - sum(invoices not cancelled)

        $amount = $data['amount'] ?? null;
        if (is_null($amount)) {
            $pct    = (float) ($data['percent'] ?? 50);
            $amount = (int) round($remaining * $pct / 100);
        }
        $amount = max(0, min((int)$amount, $remaining));

        $order->invoices()->create([
            'invoice_code' => 'INV-' . now()->format('ymd') . '-' . str()->upper(str()->random(5)),
            'type'         => 'dp',
            'amount'       => (int) $amount,
            'status'       => 'unpaid',
            'due_date'     => $data['due_date'],
        ]);

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

        $remaining = $order->remainingToInvoice(); // final - sum(invoices not cancelled)

        $amount = (int) ($data['amount'] ?? $remaining);
        $amount = max(0, min($amount, $remaining));

        // Tidak ada sisa untuk ditagihkan
        if ($amount <= 0) {
            return back()->with('warning', 'Tidak ada sisa yang perlu ditagihkan.');
        }

        $order->invoices()->create([
            'invoice_code' => 'INV-' . now()->format('ymd') . '-' . str()->upper(str()->random(5)),
            'type'         => 'pelunasan',
            'amount'       => (int) $amount,
            'status'       => 'unpaid',
            'due_date'     => $data['due_date'],
        ]);

        return back()->with('success', 'Invoice pelunasan dibuat.');
    }

    public function print(Invoice $invoice)
    {
        $invoice->loadMissing([
            'order.client',
            'order.items.item',
            'payments',
            'order.invoices.payments',
        ]);

        $order = $invoice->order;
        $items = $order?->items ?? collect();

        $orderSubtotal = (int) $items->sum(fn($r) => (int)$r->quantity * (int)$r->price);
        $orderFinal    = (int) ($order->final_amount ?? $orderSubtotal);
        $orderPaid     = (int) $order->invoices->sum(fn($inv) => (int) $inv->payments->sum('amount'));
        $orderDue      = max(0, $orderFinal - $orderPaid);

        $thisInvoicePaid       = (int) $invoice->payments->sum('amount');
        $thisInvoiceRemaining  = max(0, (int) $invoice->amount - $thisInvoicePaid);

        $pdf = Pdf::loadView('pdf.invoice', compact(
            'invoice',
            'order',
            'items',
            'orderSubtotal',
            'orderFinal',
            'orderPaid',
            'orderDue',
            'thisInvoicePaid',
            'thisInvoiceRemaining'
        ))->setPaper('a4', 'portrait');

        $filename = ($invoice->invoice_code ?: "invoice-{$invoice->id}") . '.pdf';

        // stream inline untuk preview di browser
        return $pdf->stream($filename);
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
