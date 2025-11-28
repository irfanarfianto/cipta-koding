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

    protected $fillable = [
        'name',
        'slug',
        'description',
        'base_price',
        'is_active',
        // New fields from schema v2
        'category',
        'icon',
        'estimated_days',
        'features',
        'pricing_tiers',
        'meta_title',
        'meta_description',
        'display_order',
    ];

    protected $casts = [
        'base_price' => 'integer',
        'is_active'  => 'boolean',
        'features' => 'array',
        'pricing_tiers' => 'array',
        'estimated_days' => 'integer',
        'display_order' => 'integer',
    ];

    public function orderItems()
    {
        return $this->morphMany(OrderItem::class, 'item');
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
