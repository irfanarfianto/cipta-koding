<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioProject extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'project_url',
        'cover_image_url',
        'completed_date',
        'client_name',
    ];

    protected $casts = [
        'completed_date' => 'date',
    ];

    /**
     * Get all of the tags for the portfolio project.
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
