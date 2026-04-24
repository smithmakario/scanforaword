<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyWord extends Model
{
    protected $fillable = [
        'snippet_id',
        'category_id',
        'scheduled_for',
    ];

    public function snippet()
    {
        return $this->belongsTo(Snippet::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
