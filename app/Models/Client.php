<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'address',
    ];

    /**
     * Get the orders for the client.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
