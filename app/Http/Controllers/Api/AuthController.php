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
            'role' => 'nullable|string|in:user,creator'
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

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
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

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email or password'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
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
