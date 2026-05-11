<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'nullable|string|max:20|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|in:user,creator'
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'user',
        ]);

        $this->sendOtp($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registration successful. Please verify your email.',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!\Illuminate\Support\Facades\Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = \App\Models\User::where('email', $request['email'])->firstOrFail();
        
        // If not verified, send OTP
        if (!$user->email_verified_at) {
            $this->sendOtp($user);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => $user->email_verified_at ? 'Login successful' : 'Please verify your email.',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'is_verified' => (bool)$user->email_verified_at
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->otp_code !== $request->otp || now()->gt($user->otp_expires_at)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired OTP code'
            ], 422);
        }

        $user->email_verified_at = now();
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Email verified successfully',
            'data' => $user
        ]);
    }

    public function resendOtp(Request $request)
    {
        $user = $request->user();
        $this->sendOtp($user);

        return response()->json([
            'status' => 'success',
            'message' => 'New OTP code sent to your email'
        ]);
    }

    private function sendOtp($user)
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->otp_code = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\VerificationOtp($user->email, $otp));
    }

    public function profile(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => $request->user()
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out'
        ]);
    }

    public function socialLogin(Request $request)
    {
        // Placeholder for social login logic (Google/Apple)
        return response()->json([
            'status' => 'success',
            'message' => 'Social login successful (Simulation)',
            'data' => [
                'name' => 'Social User',
                'email' => $request->email ?? 'social@example.com',
            ],
            'access_token' => 'simulated_token',
            'token_type' => 'Bearer'
        ]);
    }
}
