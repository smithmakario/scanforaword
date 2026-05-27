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
            'email' => 'nullable|string|email|max:255|unique:users',
            'phone_number' => 'nullable|string|max:20|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|in:user,creator,admin'
        ]);

        if (empty($validated['email']) && empty($validated['phone_number'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email or phone number is required'
            ], 422);
        }

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
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

        $user = \App\Models\User::query()->where('email', $request->input('email'))->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email or password'
            ], 401);
        }

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

        if (!empty($user->email)) {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\VerificationOtp($user->email, $otp));
        }
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
        $request->user()->tokens()->delete();

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

    public function requestCreator(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'creator') {
            return response()->json([
                'status' => 'error',
                'message' => 'You are already a creator'
            ], 400);
        }
        
        if ($user->creator_request_status === 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Your creator request is already pending'
            ], 400);
        }
        
        $user->update([
            'creator_request_status' => 'pending',
            'creator_requested_at' => now(),
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Creator request submitted successfully',
            'data' => [
                'creator_request_status' => 'pending',
            ]
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->verification_code === $request->code) {
            $user->update([
                'verification_code' => null,
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);

            $user->sendWelcomeEmail();

            return response()->json([
                'status' => 'success',
                'message' => 'Email verified successfully',
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid verification code'
        ], 400);
    }

    public function resendCode(Request $request)
    {
        $user = $request->user();

        if ($user->is_verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email already verified'
            ], 400);
        }

        if (!$user->email) {
            return response()->json([
                'status' => 'error',
                'message' => 'No email on file'
            ], 400);
        }

        $user->sendVerificationCode();

        return response()->json([
            'status' => 'success',
            'message' => 'Verification code resent',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = \App\Models\User::query()->where('email', $request->input('email'))->first();

        if (!$user) {
            return response()->json([
                'status' => 'success',
                'message' => 'If the email exists, a reset code has been sent',
            ]);
        }

        $user->sendPasswordResetCode();

        return response()->json([
            'status' => 'success',
            'message' => 'If the email exists, a reset code has been sent',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = \App\Models\User::query()->where('email', $request->input('email'))
            ->where('verification_code', $request->code)
            ->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid reset code'
            ], 400);
        }

        $user->update([
            'verification_code' => null,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        ]);

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}
