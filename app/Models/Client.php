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

    protected $fillable = ['name','email','phone_number','address'];

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
}
