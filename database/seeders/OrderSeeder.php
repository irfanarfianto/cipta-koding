<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        $services = Service::where('is_active', true)->get();
        $clients  = Client::all();
        if ($services->isEmpty() || $clients->isEmpty()) return;

        // buat 30 order
        for ($i=0; $i<30; $i++) {
            $client = $clients->random();
            $status = $faker->randomElement([
                'Menunggu Konfirmasi',
                'Menunggu Pembayaran',
                'Sedang Dikerjakan',
                'Review',
                'Selesai',
                'Dibatalkan'
            ]);

            $order = Order::create([
                'client_id'   => $client->id,
                'order_code'  => 'ORD-'.now()->format('ymd').'-'.strtoupper(Str::random(5)),
                'status'      => 'Menunggu Konfirmasi', // initial status
                'final_amount'=> null,
                'notes'       => $faker->boolean(40) ? $faker->sentence(8) : null,
            ]);

            // history create
            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'from_status' => null,
                'to_status'   => 'Menunggu Konfirmasi',
                'changed_by'  => null,
                'note'        => 'Order created (seed)',
            ]);

            // add items (1–3 services)
            $items   = $services->shuffle()->take(rand(1,3));
            $subtotal = 0;

            foreach ($items as $svc) {
                $qty = rand(1,3);
                $price = (float) $svc->base_price ?: rand(1000000, 3000000);
                $subtotal += $qty * $price;

                OrderItem::create([
                    'order_id'  => $order->id,
                    'item_id'   => $svc->id,
                    'item_type' => $svc->getMorphClass(), // polymorph
                    'quantity'  => $qty,
                    'price'     => $price,
                ]);
            }

            // final amount
            $order->update(['final_amount' => $subtotal]);

            // random status transitions menuju $status
            $flow = [
                'Menunggu Konfirmasi',
                'Menunggu Pembayaran',
                'Sedang Dikerjakan',
                'Review',
                'Selesai'
            ];
            $targetIdx = array_search($status, $flow);
            if ($status === 'Dibatalkan') {
                // langsung ubah jadi dibatalkan dari menunggu konfirmasi/ pembayaran
                $to = $faker->boolean() ? 'Menunggu Konfirmasi' : 'Menunggu Pembayaran';
                if ($to !== 'Menunggu Konfirmasi') {
                    $this->pushHistory($order, 'Menunggu Konfirmasi', 'Menunggu Pembayaran');
                }
                $order->update(['status' => 'Dibatalkan']);
                $this->pushHistory($order, $to, 'Dibatalkan');
                continue;
            }

            // transisi bertahap sampai status target
            $current = 'Menunggu Konfirmasi';
            for ($j=1; $j<=($targetIdx ?? 0); $j++) {
                $next = $flow[$j];
                $order->update(['status' => $next]);
                $this->pushHistory($order, $current, $next);
                $current = $next;
            }

            // invoices
            if (in_array($order->status, ['Menunggu Pembayaran','Sedang Dikerjakan','Review','Selesai'])) {
                // DP 50%
                $dp = Invoice::create([
                    'order_id'     => $order->id,
                    'invoice_code' => 'INV-'.now()->format('ymd').'-'.strtoupper(Str::random(5)),
                    'amount'       => round($subtotal * 0.5, 2),
                    'status'       => $faker->boolean(80) ? 'paid' : 'unpaid',
                    'due_date'     => now()->addDays(rand(3,10))->toDateString(),
                    'paid_at'      => null,
                ]);

                if ($dp->status === 'paid') {
                    Payment::create([
                        'invoice_id' => $dp->id,
                        'amount'     => $dp->amount,
                        'method'     => $faker->randomElement(['bank_transfer','ewallet','cash']),
                        'reference'  => strtoupper(Str::random(10)),
                        'paid_at'    => now()->subDays(rand(1,30)),
                    ]);

                    // kalau sudah bayar DP, set order ke "Sedang Dikerjakan" minimal
                    if (in_array($order->status, ['Menunggu Pembayaran'])) {
                        $prev = $order->status;
                        $order->update(['status' => 'Sedang Dikerjakan']);
                        $this->pushHistory($order, $prev, 'Sedang Dikerjakan');
                    }
                }

                // Pelunasan jika status akhir Review/Selesai
                if (in_array($order->status, ['Review','Selesai'])) {
                    $pelunasan = Invoice::create([
                        'order_id'     => $order->id,
                        'invoice_code' => 'INV-'.now()->format('ymd').'-'.strtoupper(Str::random(5)),
                        'amount'       => $subtotal - $dp->amount,
                        'status'       => $faker->boolean(70) ? 'paid' : 'unpaid',
                        'due_date'     => now()->addDays(rand(7,21))->toDateString(),
                        'paid_at'      => null,
                    ]);

                    if ($pelunasan->status === 'paid') {
                        Payment::create([
                            'invoice_id' => $pelunasan->id,
                            'amount'     => $pelunasan->amount,
                            'method'     => $faker->randomElement(['bank_transfer','ewallet','cash']),
                            'reference'  => strtoupper(Str::random(10)),
                            'paid_at'    => now()->subDays(rand(1,20)),
                        ]);

                        if ($order->status !== 'Selesai') {
                            $prev = $order->status;
                            $order->update(['status' => 'Selesai']);
                            $this->pushHistory($order, $prev, 'Selesai');
                        }
                    }
                }
            }
        }
    }

    private function pushHistory(Order $order, ?string $from, string $to): void
    {
        OrderStatusHistory::create([
            'order_id'    => $order->id,
            'from_status' => $from,
            'to_status'   => $to,
            'changed_by'  => null,
            'note'        => 'Auto transition (seed)',
        ]);
    }
}
