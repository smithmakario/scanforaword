<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Mail\VerificationMail;
use App\Mail\PasswordResetMail;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'password',
        'role',
        'creator_request_status',
        'creator_requested_at',
        'verification_code',
        'is_verified',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
        ];
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function sendVerificationCode(): int
    {
        $code = rand(100000, 999999);
        
        $this->update([
            'verification_code' => $code,
            'is_verified' => false,
        ]);

        Mail::to($this->email)->send(new VerificationMail($this->name, $code));

        return $code;
    }

    public function sendPasswordResetCode(): int
    {
        $code = rand(100000, 999999);
        
        $this->update([
            'verification_code' => $code,
        ]);

        Mail::to($this->email)->send(new PasswordResetMail($this->name, $code));

        return $code;
    }

    public function verifyCode(string $code): bool
    {
        if ($this->verification_code === $code) {
            $this->update([
                'verification_code' => null,
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);
            return true;
        }
        return false;
    }

    public function sendWelcomeEmail(): void
    {
        Mail::to($this->email)->send(new WelcomeMail($this->name));
    }
}