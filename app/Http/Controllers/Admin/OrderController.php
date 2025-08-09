<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Order\OrderIndexRequest;
use App\Http\Requests\Admin\Order\OrderStoreRequest;
use App\Http\Requests\Admin\Order\OrderUpdateRequest;
use App\Http\Requests\Admin\Order\OrderUpdateStatusRequest;
use App\Http\Requests\Admin\Order\OrderBulkStatusRequest;
use App\Http\Requests\Admin\Order\OrderExportRequest;
use App\Http\Requests\Admin\OrderItem\OrderItemStoreRequest;
use App\Http\Requests\Admin\OrderItem\OrderItemUpdateRequest;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function index(OrderIndexRequest $request)
    {
        $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
        $filters = $request->validated();

        $orders = Order::query()
            ->with('client')
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['client_id'] ?? null, fn($q, $v) => $q->where('client_id', $v))
            ->when(($filters['date_from'] ?? null) && ($filters['date_to'] ?? null), function ($q) use ($filters) {
                $q->whereBetween(DB::raw('DATE(created_at)'), [$filters['date_from'], $filters['date_to']]);
            })
            ->when($filters['search'] ?? null, function ($q, $s) use ($like) {
                $q->where(fn($w) => $w
                    ->where('order_code', $like, "%$s%")
                    ->orWhereHas('client', fn($c) => $c->where('name', $like, "%$s%")
                        ->orWhere('email', $like, "%$s%")));
            })
            ->when($filters['sort'] ?? null, function ($q, $sort) {
                // sort=updated_at:desc | created_at:desc | final_amount:asc | status:asc | order_code:asc
                [$col, $dir] = array_pad(explode(':', $sort), 2, 'desc');
                $allowed = ['updated_at', 'created_at', 'final_amount', 'status', 'order_code']; // 👈 tambahkan updated_at
                if (in_array($col, $allowed, true)) {
                    $q->orderBy($col, $dir === 'asc' ? 'asc' : 'desc');
                }
            }, fn($q) => $q->orderByDesc('updated_at'))
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders'   => $orders,
            'filters'  => $filters,
            'statuses' => ['Menunggu Konfirmasi', 'Menunggu Pembayaran', 'Sedang Dikerjakan', 'Review', 'Selesai', 'Dibatalkan'],
            'clients'  => Client::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function exportCsv(OrderExportRequest $request): StreamedResponse
    {
        $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
        $filters = $request->validated();

        $rows = Order::query()
            ->with('client')
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['client_id'] ?? null, fn($q, $v) => $q->where('client_id', $v))
            ->when(($filters['date_from'] ?? null) && ($filters['date_to'] ?? null), function ($q) use ($filters) {
                $q->whereBetween(DB::raw('DATE(created_at)'), [$filters['date_from'], $filters['date_to']]);
            })
            ->when($filters['search'] ?? null, function ($q, $s) use ($like) {
                $q->where(fn($w) => $w->where('order_code', $like, "%$s%")
                    ->orWhereHas('client', fn($c) => $c->where('name', $like, "%$s%")
                        ->orWhere('email', $like, "%$s%")));
            })
            ->orderByDesc('created_at')
            ->get();

        $filename = 'orders_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Order Code', 'Client', 'Email', 'Status', 'Final Amount', 'Created At']);
            foreach ($rows as $o) {
                fputcsv($out, [
                    $o->order_code,
                    $o->client?->name,
                    $o->client?->email,
                    $o->status,
                    $o->final_amount,
                    optional($o->created_at)->toDateTimeString(),
                ]);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function create()
    {
        return Inertia::render('Admin/Orders/Create', [
            'clients'  => Client::orderBy('name')->get(['id', 'name', 'email']),
            'services' => Service::where('is_active', true)->orderBy('name')->get(['id', 'name', 'base_price']),
            'statuses' => ['Menunggu Konfirmasi', 'Menunggu Pembayaran', 'Sedang Dikerjakan', 'Review', 'Selesai', 'Dibatalkan'],
            'defaults' => [
                'client_id' => null,
                'notes' => null,
            ],
        ]);
    }

    public function store(OrderStoreRequest $request)
    {
        $data = $request->validated();

        if (is_string($data['items'] ?? null)) {
            $decoded = json_decode($data['items'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data['items'] = $decoded;
            }
        }

        $order = null;
        DB::transaction(function () use ($data, &$order) {
            $order = Order::create([
                'client_id'    => $data['client_id'],
                'order_code'   => 'ORD-' . now()->format('ymd') . '-' . Str::upper(Str::random(5)),
                'status'       => $data['status'] ?? 'Menunggu Konfirmasi',
                'final_amount' => 0,
                'notes'        => $data['notes'] ?? null,
            ]);

            // Group/merge items by service(+price)
            $bucket = [];
            foreach (($data['items'] ?? []) as $it) {
                $svc  = Service::findOrFail($it['service_id']);
                $price = $it['price'] ?? ($svc->base_price ?? 0);
                // key unik: gabungkan service + (opsional) price
                $key = $svc->id . '|' . $svc->getMorphClass() . '|' . $price;

                if (!isset($bucket[$key])) {
                    $bucket[$key] = [
                        'item_id'   => $svc->id,
                        'item_type' => $svc->getMorphClass(),
                        'quantity'  => 0,
                        'price'     => $price,
                    ];
                }
                $bucket[$key]['quantity'] += (int) $it['quantity'];
            }

            foreach ($bucket as $row) {
                // kalau ingin benar-benar aman dari duplikat paralel, tetap cek existing:
                $existing = $order->items()
                    ->where('item_id', $row['item_id'])
                    ->where('item_type', $row['item_type'])
                    ->where('price', $row['price'])
                    ->first();

                if ($existing) {
                    $existing->increment('quantity', $row['quantity']);
                } else {
                    $order->items()->create($row);
                }
            }

            $this->recalcFinalAmount($order);
        });

        return redirect()->route('admin.orders.show', $order)->with('success', 'Order dibuat.');
    }



    public function show(Order $order)
    {
        $order->load([
            'client',
            'items.item',
            'invoices.payments',
            'statusHistories.changer' // timeline
        ]);

        // jumlah terbayar & sisa
        $paid = $order->invoices->flatMap->payments->sum('amount');
        $due  = max(0, (float)($order->final_amount ?? 0) - (float)$paid);

        return Inertia::render('Admin/Orders/Show', [
            'order'  => $order,
            'paid'   => (float)$paid,
            'due'    => (float)$due,
            'statuses' => ['Menunggu Konfirmasi', 'Menunggu Pembayaran', 'Sedang Dikerjakan', 'Review', 'Selesai', 'Dibatalkan'],
            'services' => \App\Models\Service::where('is_active', true)->orderBy('name')->get(['id', 'name', 'base_price']),

        ]);
    }

    public function update(OrderUpdateRequest $request, Order $order)
    {
        $order->update($request->validated());
        return back()->with('success', 'Order diperbarui.');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return back()->with('success', 'Order dihapus.');
    }

    // ---------- Status ----------

    public function updateStatus(OrderUpdateStatusRequest $request, Order $order)
    {
        $data = $request->validated();
        $order->update(['status' => $data['status']]);

        if (!empty($data['note'])) {
            $order->statusHistories()->latest()->first()?->update(['note' => $data['note']]);
        }

        return back()->with('success', 'Status pesanan diperbarui.');
    }

    public function bulkUpdateStatus(OrderBulkStatusRequest $request)
    {
        $data = $request->validated(); // ['ids'=>[], 'status'=>'...', 'note'=>?]

        $orders = Order::whereIn('id', $data['ids'])->get();
        foreach ($orders as $order) {
            $order->update(['status' => $data['status']]);
            if (!empty($data['note'])) {
                $order->statusHistories()->latest()->first()?->update(['note' => $data['note']]);
            }
        }

        return back()->with('success', 'Status beberapa order berhasil diperbarui.');
    }


    // ---------- Items ----------

    public function addItem(OrderItemStoreRequest $request, Order $order)
    {
        $data = $request->validated(); // service_id, quantity, price?
        $service = Service::findOrFail($data['service_id']);
        $price = $data['price'] ?? ($service->base_price ?? 0);

        // MERGE by (order_id, item_id, item_type[, price])
        $existing = $order->items()
            ->where('item_id', $service->id)
            ->where('item_type', $service->getMorphClass())
            // jika ingin pisahkan baris untuk harga berbeda, keep baris ini:
            ->where('price', $price)
            ->first();

        if ($existing) {
            $existing->increment('quantity', (int) $data['quantity']);
            $existing->touch();
        } else {
            $order->items()->create([
                'item_id'   => $service->id,
                'item_type' => $service->getMorphClass(),
                'quantity'  => (int) $data['quantity'],
                'price'     => $price,
            ]);
        }

        $this->recalcFinalAmount($order);

        return back()->with('success', 'Item ditambahkan.');
    }


    public function updateItem(OrderItemUpdateRequest $request, Order $order, OrderItem $orderItem)
    {
        // safety: pastikan milik order yg sama
        abort_unless($orderItem->order_id === $order->id, 404);

        $orderItem->update($request->validated());
        $this->recalcFinalAmount($order);

        return back()->with('success', 'Item diperbarui.');
    }

    public function removeItem(Order $order, OrderItem $orderItem)
    {
        abort_unless($orderItem->order_id === $order->id, 404);

        $orderItem->delete();
        $this->recalcFinalAmount($order);

        return back()->with('success', 'Item dihapus.');
    }

    protected function recalcFinalAmount(Order $order): void
    {
        $sum = $order->items()->select(DB::raw('SUM(quantity*price) as total'))->value('total') ?? 0;
        $order->update(['final_amount' => $sum]);
    }

    // ---------- Invoices Shortcut ----------

    public function createInvoiceDp(Order $order)
    {
        request()->validate([
            'amount'   => ['nullable', 'numeric', 'min:0'],
            'percent'  => ['nullable', 'numeric', 'min:1', 'max:100'],
            'due_date' => ['required', 'date'],
        ]);

        $amount = request('amount');
        if (is_null($amount)) {
            $percent = (float) (request('percent', 50));
            $amount  = round(((float)$order->final_amount) * $percent / 100, 2);
        }

        $invoice = $order->invoices()->create([
            'invoice_code' => 'INV-' . now()->format('ymd') . '-' . Str::upper(Str::random(5)),
            'amount'       => $amount,
            'status'       => 'unpaid',
            'due_date'     => request('due_date'),
        ]);

        // opsional: setelah DP dibuat, set status order → Menunggu Pembayaran
        if ($order->status === 'Menunggu Konfirmasi') {
            $order->update(['status' => 'Menunggu Pembayaran']);
        }

        return redirect()->route('admin.invoices.show', $invoice)->with('success', 'Invoice DP dibuat.');
    }

    public function createInvoicePelunasan(Order $order)
    {
        request()->validate([
            'amount'   => ['nullable', 'numeric', 'min:0'],
            'due_date' => ['required', 'date'],
        ]);

        $paid = $order->invoices()->withSum('payments', 'amount')->get()->sum('payments_sum_amount');
        $remaining = max(0, (float)$order->final_amount - (float)$paid);
        $amount = request('amount') ?? $remaining;

        $invoice = $order->invoices()->create([
            'invoice_code' => 'INV-' . now()->format('ymd') . '-' . Str::upper(Str::random(5)),
            'amount'       => $amount,
            'status'       => 'unpaid',
            'due_date'     => request('due_date'),
        ]);

        return redirect()->route('admin.invoices.show', $invoice)->with('success', 'Invoice pelunasan dibuat.');
    }
}
