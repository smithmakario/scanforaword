<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'title',
        'description',
        'full_url',
        'audio_url',
        'image_url',
        'speaker',
        'status',
        'listens_count',
        'duration',
        'content',
    ];

    public function snippets()
    {
        return $this->hasMany(Snippet::class);
    }

    public function keywords()
    {
        return $this->belongsToMany(Keyword::class);
    }
}
