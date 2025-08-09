<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Order\OrderUpdateRequest;
use App\Http\Requests\Admin\Order\OrderUpdateStatusRequest;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';

        $orders = Order::query()
            ->with('client')
            ->when(request('status'), fn($q)=>$q->where('status', request('status')))
            ->when(request('search'), function ($q) use ($like) {
                $s = request('search');
                $q->where(fn($w)=>$w->where('order_code', $like, "%$s%")
                    ->orWhereHas('client', fn($c)=>$c->where('name', $like, "%$s%")
                        ->orWhere('email', $like, "%$s%")));
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders'   => $orders,
            'filters'  => request()->only(['status','search']),
            'statuses' => ['Menunggu Konfirmasi','Menunggu Pembayaran','Sedang Dikerjakan','Review','Selesai','Dibatalkan'],
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['client','items.item','invoices.payments','statusHistories.changer']);
        return Inertia::render('Admin/Orders/Show', ['order' => $order]);
    }

    public function update(OrderUpdateRequest $request, Order $order)
    {
        $order->update($request->validated());
        return back()->with('success','Order diperbarui.');
    }

    public function updateStatus(OrderUpdateStatusRequest $request, Order $order)
    {
        $data = $request->validated();

        $order->update(['status' => $data['status']]);

        if (!empty($data['note'])) {
            $order->statusHistories()->latest()->first()?->update(['note' => $data['note']]);
        }

        return back()->with('success','Status pesanan diperbarui.');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return back()->with('success', 'Order dihapus.');
    }
}
