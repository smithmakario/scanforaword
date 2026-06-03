<?php

namespace App\Http\Controllers;

use App\Mail\VerificationOtp;
use App\Models\User;
use App\Models\Bookmark;
use App\Models\Category;
use App\Models\DailyWord;
use App\Models\Message;
use App\Models\Snippet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;

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

    public function showDashboard(Request $request)
    {
        $stats = [
            'users' => User::count(),
            'creators' => User::where('role', 'creator')->count(),
            'messages' => Message::count(),
            'snippets' => Snippet::count(),
            'bookmarks' => Bookmark::count(),
            'categories' => Category::count(),
            'daily_words' => DailyWord::count(),
        ];

        $messages = Message::with('keywords', 'creator')->latest()->take(12)->get();
        $users = User::latest()->take(12)->get();
        $categories = Category::latest()->get();
        $dailyWords = DailyWord::with(['snippet', 'category'])->latest()->take(12)->get();
        $snippets = Snippet::latest()->take(20)->get();

        return view('admin.dashboard', compact('stats', 'messages', 'users', 'categories', 'dailyWords', 'snippets'));
    }

    public function updateMessageStatus(Request $request, Message $message)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:processing,live,archived',
        ]);

        $message->update(['status' => $validated['status']]);

        return back()->with('status', 'Message status updated to ' . $validated['status'] . '.');
    }

    public function deleteMessage(Request $request, Message $message)
    {
        $this->deleteAssociatedSupabaseObjects($message);
        $message->delete();

        return back()->with('status', 'Message removed successfully.');
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        Category::create($validated);

        return back()->with('status', 'Category added successfully.');
    }

    public function deleteCategory(Request $request, Category $category)
    {
        $category->delete();

        return back()->with('status', 'Category deleted successfully.');
    }

    public function createDailyWord(Request $request)
    {
        $validated = $request->validate([
            'snippet_id' => 'required|exists:snippets,id',
            'category_id' => 'required|exists:categories,id',
            'scheduled_for' => 'required|date',
        ]);

        DailyWord::create($validated);

        return back()->with('status', 'Daily word scheduled successfully.');
    }

    public function deleteDailyWord(Request $request, DailyWord $dailyWord)
    {
        $dailyWord->delete();

        return back()->with('status', 'Daily word removed successfully.');
    }

    public function updateUserRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:user,creator,admin',
        ]);

        $user->update(['role' => $validated['role']]);

        return back()->with('status', 'User role updated successfully.');
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

    private function deleteAssociatedSupabaseObjects(Message $message): void
    {
        $supabase = [
            'url' => config('services.supabase.url'),
            'key' => config('services.supabase.key'),
            'audio_bucket' => config('services.supabase.audio_bucket', 'creator-audio'),
            'image_bucket' => config('services.supabase.image_bucket', 'creator-images'),
        ];

        if (!$supabase['url'] || !$supabase['key']) {
            return;
        }

        foreach (['audio_url' => $supabase['audio_bucket'], 'image_url' => $supabase['image_bucket']] as $field => $bucket) {
            if (!empty($message->{$field})) {
                $objectPath = $this->extractSupabaseObjectPath($message->{$field}, $bucket);
                if ($objectPath) {
                    $this->deleteSupabaseObject($supabase['url'], $supabase['key'], $bucket, $objectPath);
                }
            }
        }
    }

    private function extractSupabaseObjectPath(string $url, string $bucket): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) {
            return null;
        }

        $needle = "/storage/v1/object/public/{$bucket}/";
        $position = strpos($path, $needle);

        if ($position === false) {
            return null;
        }

        return substr($path, $position + strlen($needle));
    }

    private function deleteSupabaseObject(string $baseUrl, string $serviceKey, string $bucket, string $objectPath): bool
    {
        $response = Http::withHeaders([
            'apikey' => $serviceKey,
            'Authorization' => 'Bearer '.$serviceKey,
        ])->delete(rtrim($baseUrl, '/')."/storage/v1/object/{$bucket}/{$objectPath}");

        return !$response->failed();
    }
}
