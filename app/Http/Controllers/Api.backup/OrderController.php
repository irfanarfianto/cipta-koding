<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['client', 'items.item', 'invoices']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Search by order code
        if ($request->has('search')) {
            $query->where('order_code', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $orders = $query->paginate($request->get('per_page', 15));

        return OrderResource::collection($orders);
    }

    /**
     * Store a newly created order.
     */
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        // Generate order code
        $validated['order_code'] = $this->generateOrderCode();
        $validated['status'] = Order::STATUS_MENUNGGU_KONFIRMASI;

        $order = Order::create($validated);

        // Create order items
        if (isset($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $order->items()->create($item);
            }
        }

        // Calculate final amount
        $this->calculateFinalAmount($order);

        return new OrderResource($order->load(['client', 'items.item']));
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load(['client', 'items.item', 'invoices.payments', 'statusHistories.changedBy']);
        
        return new OrderResource($order);
    }

    /**
     * Update the specified order.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $validated = $request->validated();

        $order->update($validated);

        // Update items if provided
        if (isset($validated['items'])) {
            // Delete existing items
            $order->items()->delete();
            
            // Create new items
            foreach ($validated['items'] as $item) {
                $order->items()->create($item);
            }
            
            // Recalculate final amount
            $this->calculateFinalAmount($order);
        }

        return new OrderResource($order->fresh(['client', 'items.item']));
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully'
        ]);
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

        // Update order status and timestamps
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

        return new OrderResource($order->fresh(['client', 'statusHistories']));
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
