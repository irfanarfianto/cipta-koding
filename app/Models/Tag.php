<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'slug'];

    /**
     * Get all of the posts that are assigned this tag.
     */
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * Get all of the portfolio projects that are assigned this tag.
     */
    public function portfolioProjects()
    {
        return $this->morphedByMany(PortfolioProject::class, 'taggable');
    }
}
