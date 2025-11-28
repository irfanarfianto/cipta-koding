<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'address',
        // New fields from schema v2
        'company_name',
        'company_website',
        'type',
        'status',
        'referred_by',
        'referral_code',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function portfolioProjects()
    {
        return $this->hasMany(PortfolioProject::class);
    }

    public function testimonials()
    {
        return $this->hasMany(Testimonial::class);
    }

    // Referral relationships
    public function referrer()
    {
        return $this->belongsTo(Client::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(Client::class, 'referred_by');
    }
}
