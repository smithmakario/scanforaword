<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $code;

    public function __construct($name, $code)
    {
        $this->name = $name;
        $this->code = $code;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Your Password - Scan for a Word',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reset',
            with: [
                'name' => $this->name,
                'code' => $this->code,
                'year' => now()->year,
            ]
        );
    }
}