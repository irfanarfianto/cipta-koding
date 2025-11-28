<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Payment\PaymentStoreRequest;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::query()
            ->with(['invoice.order.client', 'verifiedBy'])
            ->when(request('status'), fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters'  => request()->only(['status']),
        ]);
    }

    public function store(PaymentStoreRequest $request, Invoice $invoice)
    {
        $data = $request->validated();
        // Default to success if not provided (legacy behavior), unless it's a manual transfer which might be pending
        $data['status'] = $data['status'] ?? 'success'; 

        $payment = $invoice->payments()->create($data);

        $this->checkInvoiceStatus($invoice);

        return back()->with('success', 'Pembayaran ditambahkan.');
    }

    public function update(Request $request, Payment $payment)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,success,failed,refunded'],
            'notes'  => ['nullable', 'string'],
        ]);

        $payment->update([
            'status'      => $data['status'],
            'notes'       => $data['notes'] ?? null,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        $this->checkInvoiceStatus($payment->invoice);

        return back()->with('success', 'Status pembayaran diperbarui.');
    }

    public function destroy(Payment $payment)
    {
        $invoice = $payment->invoice;
        $payment->delete();
        
        $this->checkInvoiceStatus($invoice);

        return back()->with('success', 'Pembayaran dihapus.');
    }

    private function checkInvoiceStatus(Invoice $invoice)
    {
        // Only count successful payments
        $total = $invoice->payments()->where('status', 'success')->sum('amount');
        
        if ($total >= (float)$invoice->amount && $invoice->status !== 'paid') {
            $invoice->update(['status' => 'paid', 'paid_at' => now()]);
        } elseif ($total < (float)$invoice->amount && $invoice->status === 'paid') {
            // Revert to unpaid if payments are removed/refunded
             $invoice->update(['status' => 'unpaid', 'paid_at' => null]);
        }
    }
}
