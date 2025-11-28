<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use App\Models\Client;
use App\Models\Service;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class QuotationController extends Controller
{
    /**
     * Display a listing of quotations.
     */
    public function index(Request $request)
    {
        $query = Quotation::with(['client']);

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
            $query->where('quotation_code', 'like', '%' . $request->search . '%');
        }

        $quotations = $query->latest()->paginate(15);

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'filters' => $request->only(['status', 'client_id', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new quotation.
     */
    public function create()
    {
        return Inertia::render('Quotations/Create', [
            'clients' => Client::where('status', 'active')->get(),
            'services' => Service::where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a newly created quotation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|uuid|exists:clients,id',
            'valid_until' => 'required|date|after:today',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_type' => 'required|string',
            'items.*.item_id' => 'required|uuid',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Generate quotation code
        $validated['quotation_code'] = $this->generateQuotationCode();
        $validated['status'] = 'draft';

        $quotation = Quotation::create($validated);

        // Create quotation items
        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $itemSubtotal = $item['quantity'] * $item['unit_price'];
            $quotation->items()->create([
                'item_type' => $item['item_type'],
                'item_id' => $item['item_id'],
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'subtotal' => $itemSubtotal,
            ]);
            $subtotal += $itemSubtotal;
        }

        // Calculate totals (you can add tax here if needed)
        $quotation->update([
            'subtotal' => $subtotal,
            'total_amount' => $subtotal,
        ]);

        return redirect()->route('quotations.show', $quotation)
            ->with('success', 'Quotation berhasil dibuat!');
    }

    /**
     * Display the specified quotation.
     */
    public function show(Quotation $quotation)
    {
        $quotation->load([
            'client',
            'items.item',
            'order',
        ]);

        return Inertia::render('Quotations/Show', [
            'quotation' => $quotation,
        ]);
    }

    /**
     * Show the form for editing the specified quotation.
     */
    public function edit(Quotation $quotation)
    {
        // Only allow editing draft quotations
        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Hanya quotation draft yang bisa diedit!');
        }

        $quotation->load('items.item');

        return Inertia::render('Quotations/Edit', [
            'quotation' => $quotation,
            'clients' => Client::where('status', 'active')->get(),
            'services' => Service::where('is_active', true)->get(),
        ]);
    }

    /**
     * Update the specified quotation.
     */
    public function update(Request $request, Quotation $quotation)
    {
        // Only allow updating draft quotations
        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Hanya quotation draft yang bisa diupdate!');
        }

        $validated = $request->validate([
            'valid_until' => 'required|date',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $quotation->update($validated);

        return redirect()->route('quotations.show', $quotation)
            ->with('success', 'Quotation berhasil diupdate!');
    }

    /**
     * Remove the specified quotation.
     */
    public function destroy(Quotation $quotation)
    {
        // Only allow deletion of draft quotations
        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Hanya quotation draft yang bisa dihapus!');
        }

        $quotation->delete();

        return redirect()->route('quotations.index')
            ->with('success', 'Quotation berhasil dihapus!');
    }

    /**
     * Send quotation to client.
     */
    public function send(Quotation $quotation)
    {
        // TODO: Implement email sending
        // Mail::to($quotation->client->email)->send(new QuotationMail($quotation));

        $quotation->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return back()->with('success', 'Quotation berhasil dikirim ke client!');
    }

    /**
     * Accept quotation.
     */
    public function accept(Quotation $quotation)
    {
        $quotation->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return back()->with('success', 'Quotation diterima!');
    }

    /**
     * Reject quotation.
     */
    public function reject(Quotation $quotation)
    {
        $quotation->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        return back()->with('success', 'Quotation ditolak!');
    }

    /**
     * Convert quotation to order.
     */
    public function convertToOrder(Quotation $quotation)
    {
        if ($quotation->status !== 'accepted') {
            return back()->with('error', 'Hanya quotation yang diterima yang bisa dikonversi ke order!');
        }

        if ($quotation->order_id) {
            return back()->with('error', 'Quotation sudah dikonversi ke order!');
        }

        // Create order
        $order = Order::create([
            'client_id' => $quotation->client_id,
            'order_code' => 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
            'status' => Order::STATUS_MENUNGGU_KONFIRMASI,
            'final_amount' => $quotation->total_amount,
            'notes' => 'Converted from quotation: ' . $quotation->quotation_code,
        ]);

        // Create order items from quotation items
        foreach ($quotation->items as $item) {
            $order->items()->create([
                'item_type' => $item->item_type,
                'item_id' => $item->item_id,
                'quantity' => $item->quantity,
                'price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ]);
        }

        // Link quotation to order
        $quotation->update(['order_id' => $order->id]);

        return redirect()->route('orders.show', $order)
            ->with('success', 'Quotation berhasil dikonversi ke order!');
    }

    /**
     * Generate unique quotation code.
     */
    private function generateQuotationCode(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        
        return "QUO-{$date}-{$random}";
    }
}
