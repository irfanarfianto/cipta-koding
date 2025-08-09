<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['name','slug','description','base_price','is_active'];

    protected $casts = [
        'base_price' => 'integer',
        'is_active'  => 'boolean',
    ];

    public function orderItems()
    {
        return $this->morphMany(OrderItem::class, 'item');
    }
}
