<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Message extends Model
{
    protected $fillable = [
        'title',
        'description',
        'full_url',
        'audio_url',
        'image_url',
        'creator_id',
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

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}
