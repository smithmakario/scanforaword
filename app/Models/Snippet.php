<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Snippet extends Model
{
    protected $fillable = [
        'message_id',
        'title',
        'video_url',
        'thumbnail_url',
        'duration',
    ];

    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    public function keywords()
    {
        return $this->belongsToMany(Keyword::class);
    }
}
