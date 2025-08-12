<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'client_id',
        'order_code',
        'status',
        'final_amount',
        'notes',
    ];

    protected $casts = [
        'final_amount' => 'integer',
    ];
    
    public const STATUS_MENUNGGU_KONFIRMASI = 'Menunggu Konfirmasi';
    public const STATUS_MENUNGGU_PEMBAYARAN = 'Menunggu Pembayaran';
    public const STATUS_SEDANG_DIKERJAKAN = 'Sedang Dikerjakan';
    public const STATUS_REVIEW = 'Review';
    public const STATUS_SELESAI = 'Selesai';
    public const STATUS_DIBATALKAN = 'Dibatalkan';

    public const STATUSES = [
        self::STATUS_MENUNGGU_KONFIRMASI,
        self::STATUS_MENUNGGU_PEMBAYARAN,
        self::STATUS_SEDANG_DIKERJAKAN,
        self::STATUS_REVIEW,
        self::STATUS_SELESAI,
        self::STATUS_DIBATALKAN,
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasManyThrough(Payment::class, Invoice::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }
    public function remainingToInvoice(): int
    {
        $final = (int) ($this->final_amount ?? 0);
        $invoiced = (int) $this->invoices()->where('status', '!=', 'cancelled')->sum('amount');
        return max(0, $final - $invoiced);
    }

    public function totalPaid(): int
    {
        return (int) $this->invoices()->withSum('payments', 'amount')->get()->sum('payments_sum_amount');
    }
}
