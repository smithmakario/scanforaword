<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShareToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'shareable_type',
        'shareable_id',
    ];

    public function shareable()
    {
        return $this->morphTo();
    }
}
