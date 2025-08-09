<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'client_id',
        'order_code',
        'status',
        'final_amount',
        'notes',
    ];

    protected $casts = [
        'final_amount' => 'decimal:2',
    ];

    /**
     * Get the client that owns the order.
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get all of the items for the order.
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the invoices for the order.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
