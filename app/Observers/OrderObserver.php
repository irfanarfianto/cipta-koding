<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        DB::afterCommit(function () use ($order) {
            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'from_status' => null,
                'to_status'   => $order->status,
                'changed_by'  => Auth::id(),
                'note'        => 'Order created',
            ]);
        });
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Kalau kolom 'status' tidak berubah, skip.
        if (! $order->isDirty('status')) {
            return;
        }

        $from = $order->getOriginal('status'); // status lama
        $to   = $order->status;                // status baru (sudah di-set, belum commit)
        $changerId = Auth::id();               // bisa null jika tidak ada user login (job/CLI)

        // Catatan: kita tidak melempar exception di sini agar update utama tidak gagal
        // hanya karena log history. Kalau ingin wajib, bungkus di transaksi dan throw kalau gagal.
        // Di bawah ini kita gunakan afterCommit agar tidak tercatat jika update gagal rollback.

        DB::afterCommit(function () use ($order, $from, $to, $changerId) {
            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'from_status' => $from,
                'to_status'   => $to,
                'changed_by'  => $changerId,
                'note'        => null,
            ]);
        });
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "restored" event.
     */
    public function restored(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "force deleted" event.
     */
    public function forceDeleted(Order $order): void
    {
        //
    }
}
