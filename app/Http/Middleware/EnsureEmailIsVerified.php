<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->email_verified_at) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email verification is required to access this route.',
                ], 403);
            }

            if (Auth::check()) {
                return redirect()->route('admin.verify')->with('error', 'Please verify your admin account before continuing.');
            }

            return redirect()->route('login');
        }

        return $next($request);
    }
}
