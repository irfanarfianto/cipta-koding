<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Invoice\InvoiceStoreRequest;
use App\Http\Requests\Admin\Invoice\InvoiceUpdateRequest;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';

        $invoices = Invoice::query()
            ->with('order.client')
            ->when(request('status'), fn($q)=>$q->where('status', request('status')))
            ->when(request('search'), function ($q) use ($like) {
                $s = request('search');
                $q->where(fn($w)=>$w->where('invoice_code', $like, "%$s%")
                    ->orWhereHas('order.client', fn($c)=>$c->where('name',$like,"%$s%")));
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Invoices/Index', [
            'invoices' => $invoices,
            'filters'  => request()->only(['status','search']),
            'statuses' => ['unpaid','paid','overdue','cancelled'],
        ]);
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['order.client','payments']);
        return Inertia::render('Admin/Invoices/Show', ['invoice' => $invoice]);
    }

    public function store(InvoiceStoreRequest $request, Order $order)
    {
        $data = $request->validated();

        $invoice = $order->invoices()->create([
            'invoice_code' => 'INV-'.now()->format('ymd').'-'.str()->upper(str()->random(5)),
            'amount'       => $data['amount'],
            'due_date'     => $data['due_date'],
            'status'       => 'unpaid',
        ]);

        return redirect()->route('admin.invoices.show', $invoice)->with('success','Invoice dibuat.');
    }

    public function update(InvoiceUpdateRequest $request, Invoice $invoice)
    {
        $invoice->update($request->validated());
        return back()->with('success','Invoice diperbarui.');
    }
}
