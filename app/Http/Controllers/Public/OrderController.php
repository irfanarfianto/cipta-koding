<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Client;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['client', 'items.item']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Search
        if ($request->has('search')) {
            $query->where('order_code', 'like', '%' . $request->search . '%');
        }

        $orders = $query->latest()->paginate(15);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'client_id', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new order.
     */
    public function create()
    {
        return Inertia::render('Orders/Create', [
            'clients' => Client::where('status', 'active')->get(),
            'services' => Service::where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|uuid|exists:clients,id',
            'notes' => 'nullable|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'discount_code' => 'nullable|string|max:50',
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_amount' => 'nullable|numeric|min:0',
            'estimated_completion_date' => 'nullable|date|after:today',
            'items' => 'required|array|min:1',
            'items.*.item_type' => 'required|string',
            'items.*.item_id' => 'required|uuid',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        // Generate order code
        $validated['order_code'] = $this->generateOrderCode();
        $validated['status'] = Order::STATUS_MENUNGGU_KONFIRMASI;

        $order = Order::create($validated);

        // Create order items
        foreach ($validated['items'] as $item) {
            $order->items()->create($item);
        }

        // Calculate final amount
        $this->calculateFinalAmount($order);

        return redirect()->route('orders.show', $order)
            ->with('success', 'Order berhasil dibuat!');
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load([
            'client',
            'items.item',
            'invoices.payments',
            'statusHistories.changedBy',
            'assignedTo'
        ]);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Show the form for editing the specified order.
     */
    public function edit(Order $order)
    {
        $order->load('items.item');

        return Inertia::render('Orders/Edit', [
            'order' => $order,
            'clients' => Client::where('status', 'active')->get(),
            'services' => Service::where('is_active', true)->get(),
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'discount_code' => 'nullable|string|max:50',
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_amount' => 'nullable|numeric|min:0',
            'estimated_completion_date' => 'nullable|date',
        ]);

        $order->update($validated);

        return redirect()->route('orders.show', $order)
            ->with('success', 'Order berhasil diupdate!');
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return redirect()->route('orders.index')
            ->with('success', 'Order berhasil dihapus!');
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', Order::STATUSES),
            'note' => 'nullable|string',
        ]);

        // Create status history
        $order->statusHistories()->create([
            'from_status' => $order->status,
            'to_status' => $validated['status'],
            'changed_by' => auth()->id(),
            'note' => $validated['note'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Update order status
        $updates = ['status' => $validated['status']];
        
        switch ($validated['status']) {
            case Order::STATUS_MENUNGGU_PEMBAYARAN:
                $updates['confirmed_at'] = now();
                break;
            case Order::STATUS_SEDANG_DIKERJAKAN:
                $updates['started_at'] = now();
                break;
            case Order::STATUS_SELESAI:
                $updates['completed_at'] = now();
                break;
            case Order::STATUS_DIBATALKAN:
                $updates['cancelled_at'] = now();
                break;
        }

        $order->update($updates);

        return back()->with('success', 'Status order berhasil diupdate!');
    }

    /**
     * Generate unique order code.
     */
    private function generateOrderCode(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        
        return "ORD-{$date}-{$random}";
    }

    /**
     * Calculate final amount based on items and discount.
     */
    private function calculateFinalAmount(Order $order): void
    {
        $subtotal = $order->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $discount = 0;
        if ($order->discount_amount > 0) {
            if ($order->discount_type === 'percentage') {
                $discount = ($subtotal * $order->discount_amount) / 100;
            } else {
                $discount = $order->discount_amount;
            }
        }

        $finalAmount = $subtotal - $discount;

        $order->update(['final_amount' => max(0, $finalAmount)]);
    }
}
