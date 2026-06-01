<?php

namespace App\Http\Controllers;

use App\Mail\VerificationOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class AdminPageController extends Controller
{
    public function showLogin()
    {
        if (Auth::check() && Auth::user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login');
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ]);

        if (!Auth::attempt([
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'admin',
        ])) {
            return back()->withErrors(['email' => 'Invalid admin credentials'])->withInput();
        }

        $request->session()->regenerate();
        $user = Auth::user();

        if (!$user->email_verified_at) {
            $this->sendOtp($user);

            return redirect()
                ->route('admin.verify')
                ->with('status', 'OTP sent to your email. Verify your account before continuing.');
        }

        return redirect()->route('admin.dashboard');
    }

    public function showVerify()
    {
        return view('admin.verify');
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->withErrors(['email' => 'Please login first.']);
        }

        if ($user->otp_code !== $request->input('otp') || now()->gt($user->otp_expires_at)) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP code'])->withInput();
        }

        $user->email_verified_at = now();
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        return redirect()->route('admin.dashboard')->with('status', 'Email verified successfully. Welcome to the admin console.');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function sendOtp(User $user): void
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->otp_code = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        if (!empty($user->email)) {
            Mail::to($user->email)->send(new VerificationOtp($user->email, $otp));
        }
    }
}
