@extends('layouts.app')

@section('content')
    <section class="panel" style="max-width:500px; margin: 40px auto; padding: 32px;">
        <h1 style="margin-top:0;">Verify admin OTP</h1>

        @if(session('status'))
            <div style="margin-bottom:18px; padding:14px 16px; border-radius:16px; background:#111827; border:1px solid rgba(148,163,184,0.18); color:#a5f3fc;">
                {{ session('status') }}
            </div>
        @endif

        @if(session('error'))
            <div style="margin-bottom:18px; padding:14px 16px; border-radius:16px; background:#991b1b; color:#f8fafc;">
                {{ session('error') }}
            </div>
        @endif

        @if($errors->any())
            <div style="margin-bottom:18px; padding:14px 16px; border-radius:16px; background:#4b5563; color:#f8fafc;">
                <ul style="margin:0; padding-left:18px; list-style:disc;">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('admin.verify.post') }}" style="display:grid; gap:16px;">
            @csrf
            <label style="display:flex; flex-direction:column; gap:8px; color:#cbd5e1; font-weight:600;">
                6-digit OTP code
                <input type="text" name="otp" value="{{ old('otp') }}" maxlength="6" required autofocus style="padding:14px 16px; border-radius:14px; border:1px solid rgba(148,163,184,0.16); background:rgba(255,255,255,0.06); color:#f8fafc;" />
            </label>

            <button type="submit" class="button" style="width:100%;">Verify OTP</button>
        </form>

        <p style="margin-top:22px; color:#94a3b8;">Check your email for the OTP. If you did not receive it, log out and sign in again to resend the code.</p>
    </section>
@endsection
