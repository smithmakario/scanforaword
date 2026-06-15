<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyWord;
use App\Models\Message;
use App\Models\ShareToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ShareController extends Controller
{
    public function createMessageShare(Request $request, Message $message)
    {
        $user = $request->user();

        if (!$user || ($user->role !== 'admin' && $message->creator_id !== $user->id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only admins or the creator may generate share links for this message.'
            ], 403);
        }

        $token = $this->generateUniqueToken();

        $shareToken = ShareToken::create([
            'token' => $token,
            'shareable_type' => Message::class,
            'shareable_id' => $message->id,
        ]);

        $shareUrl = $request->root() . '/share/' . $shareToken->token;
        $qrCodeUrl = $this->buildQrCodeUrl($shareUrl);

        return response()->json([
            'status' => 'success',
            'data' => [
                'share_url' => $shareUrl,
                'qr_code_url' => $qrCodeUrl,
                'message' => $message,
            ],
        ]);
    }

    public function createDailyWordShare(Request $request, DailyWord $dailyWord)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only admins may generate share links for daily words.'
            ], 403);
        }

        $token = $this->generateUniqueToken();

        $shareToken = ShareToken::create([
            'token' => $token,
            'shareable_type' => DailyWord::class,
            'shareable_id' => $dailyWord->id,
        ]);

        $shareUrl = $request->root() . '/share/' . $shareToken->token;
        $qrCodeUrl = $this->buildQrCodeUrl($shareUrl);

        return response()->json([
            'status' => 'success',
            'data' => [
                'share_url' => $shareUrl,
                'qr_code_url' => $qrCodeUrl,
                'daily_word' => $dailyWord,
            ],
        ]);
    }

    public function getSharedItem(string $token)
    {
        $share = ShareToken::with('shareable')->where('token', $token)->first();

        if (!$share || !$share->shareable) {
            return response()->json([
                'status' => 'error',
                'message' => 'Shared item not found.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'type' => class_basename($share->shareable_type),
                'item' => $share->shareable,
                'share_url' => request()->root() . '/share/' . $share->token,
                'qr_code_url' => $this->buildQrCodeUrl(request()->root() . '/share/' . $share->token),
            ],
        ]);
    }

    private function generateUniqueToken(): string
    {
        do {
            $token = Str::upper(Str::random(10));
        } while (ShareToken::where('token', $token)->exists());

        return $token;
    }

    private function buildQrCodeUrl(string $shareUrl): string
    {
        return 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($shareUrl);
    }
}
