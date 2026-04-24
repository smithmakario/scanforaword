<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'title',
        'description',
        'full_url',
        'speaker',
    ];

    public function snippets()
    {
        return $this->hasMany(Snippet::class);
    }
}
