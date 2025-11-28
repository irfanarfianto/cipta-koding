<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['order.client']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Search
        if ($request->has('search')) {
            $query->where('invoice_code', 'like', '%' . $request->search . '%');
        }

        $invoices = $query->latest()->paginate(15);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['status', 'type', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(Request $request)
    {
        $order = null;
        if ($request->has('order_id')) {
            $order = Order::with('client')->findOrFail($request->order_id);
        }

        return Inertia::render('Invoices/Create', [
            'order' => $order,
            'orders' => Order::with('client')
                ->whereIn('status', [
                    Order::STATUS_MENUNGGU_PEMBAYARAN,
                    Order::STATUS_SEDANG_DIKERJAKAN,
                ])
                ->get(),
        ]);
    }

    /**
     * Store a newly created invoice.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|uuid|exists:orders,id',
            'type' => 'required|in:dp,pelunasan,milestone,full',
            'amount' => 'required|numeric|min:0',
            'tax_percentage' => 'nullable|numeric|min:0|max:100',
            'due_date' => 'required|date|after:today',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ]);

        // Generate invoice code
        $validated['invoice_code'] = $this->generateInvoiceCode();
        $validated['status'] = 'unpaid';

        // Calculate tax
        $taxPercentage = $validated['tax_percentage'] ?? 0;
        $subtotal = $validated['amount'];
        $taxAmount = ($subtotal * $taxPercentage) / 100;
        
        $validated['subtotal'] = $subtotal;
        $validated['tax_amount'] = $taxAmount;
        $validated['amount'] = $subtotal + $taxAmount;

        $invoice = Invoice::create($validated);

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Invoice berhasil dibuat!');
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load([
            'order.client',
            'order.items.item',
            'payments',
        ]);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for editing the specified invoice.
     */
    public function edit(Invoice $invoice)
    {
        $invoice->load('order.client');

        return Inertia::render('Invoices/Edit', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Update the specified invoice.
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ]);

        $invoice->update($validated);

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Invoice berhasil diupdate!');
    }

    /**
     * Remove the specified invoice.
     */
    public function destroy(Invoice $invoice)
    {
        // Only allow deletion if unpaid
        if ($invoice->status !== 'unpaid') {
            return back()->with('error', 'Tidak dapat menghapus invoice yang sudah dibayar!');
        }

        $invoice->delete();

        return redirect()->route('invoices.index')
            ->with('success', 'Invoice berhasil dihapus!');
    }

    /**
     * Send invoice to client.
     */
    public function send(Invoice $invoice)
    {
        // TODO: Implement email sending
        // Mail::to($invoice->order->client->email)->send(new InvoiceMail($invoice));

        $invoice->update(['reminder_sent_at' => now()]);

        return back()->with('success', 'Invoice berhasil dikirim ke client!');
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid(Invoice $invoice)
    {
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return back()->with('success', 'Invoice ditandai sebagai lunas!');
    }

    /**
     * Generate unique invoice code.
     */
    private function generateInvoiceCode(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        
        return "INV-{$date}-{$random}";
    }
}
