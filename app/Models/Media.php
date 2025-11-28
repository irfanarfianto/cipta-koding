<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'model_type',
        'model_id',
        'collection_name',
        'name',
        'file_name',
        'mime_type',
        'disk',
        'size',
        'manipulations',
        'custom_properties',
        'order_column',
    ];

    protected $casts = [
        'size' => 'integer',
        'manipulations' => 'array',
        'custom_properties' => 'array',
        'order_column' => 'integer',
    ];

    public function model()
    {
        return $this->morphTo();
    }

    public function getFullUrl(): string
    {
        return \Storage::disk($this->disk)->url($this->file_name);
    }
}
