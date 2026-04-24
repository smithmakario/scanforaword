<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchLog extends Model
{
    protected $fillable = [
        'email_or_phone',
        'keyword',
        'result_count',
    ];
}
