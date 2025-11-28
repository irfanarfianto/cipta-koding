<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'order_id',
        'invoice_code',
        'amount',
        'type',
        'status',
        'due_date',
        'paid_at',
        'tax_amount',
        'tax_percentage',
        'subtotal',
        'notes',
        'payment_method',
        'reminder_sent_at',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'tax_amount'       => 'decimal:2',
        'tax_percentage'   => 'decimal:2',
        'subtotal'         => 'decimal:2',
        'due_date'         => 'date',
        'paid_at'          => 'datetime',
        'reminder_sent_at' => 'datetime',
    ];
    public const TYPE_DP        = 'dp';
    public const TYPE_PELUNASAN = 'pelunasan';
    public const TYPE_MILESTONE = 'milestone';
    public const TYPE_FULL      = 'full';

    public function scopeType($q, ?string $type)
    {
        return $type ? $q->where('type', $type) : $q;
    }
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    public function scopeOfType($q, ?string $type)
    {
        return $type ? $q->where('type', $type) : $q;
    }
    public function scopeStatus($q, ?string $st)
    {
        return $st ? $q->where('status', $st) : $q;
    }
}
