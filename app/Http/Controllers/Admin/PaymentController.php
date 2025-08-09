<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Payment\PaymentStoreRequest;
use App\Models\Invoice;

class PaymentController extends Controller
{
    public function store(PaymentStoreRequest $request, Invoice $invoice)
    {
        $payment = $invoice->payments()->create($request->validated());

        // Auto-mark paid jika total pembayaran >= amount invoice
        $total = $invoice->payments()->sum('amount');
        if ($total >= (float)$invoice->amount && $invoice->status !== 'paid') {
            $invoice->update(['status'=>'paid','paid_at'=>$payment->paid_at ?? now()]);
        }

        return back()->with('success','Pembayaran ditambahkan.');
    }
}
