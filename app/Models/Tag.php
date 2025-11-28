<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tag extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['name','slug'];

    public function posts()
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    public function portfolioProjects()
    {
        return $this->morphedByMany(PortfolioProject::class, 'taggable');
    }
}
