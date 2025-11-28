<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PortfolioProject extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'tech_stack',
        'project_url',
        'github_url',
        'cover_image_url',
        'images',
        'completed_date',
        'duration_days',
        'team_size',
        'client_id',
        'client_name',
        'is_featured',
        'view_count',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'completed_date' => 'date',
        'tech_stack' => 'array',
        'images' => 'array',
        'is_featured' => 'boolean',
    ];

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
