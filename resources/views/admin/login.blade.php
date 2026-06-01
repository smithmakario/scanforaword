@extends('layouts.app')

@section('content')
    <section class="panel" style="max-width:500px; margin: 40px auto; padding: 32px;">
        <h1 style="margin-top:0;">Admin login</h1>

        @if(session('status'))
            <div style="margin-bottom:18px; padding:14px 16px; border-radius:16px; background:#111827; border:1px solid rgba(148,163,184,0.18); color:#a5f3fc;">
                {{ session('status') }}
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

        <form method="POST" action="{{ route('login') }}" style="display:grid; gap:16px;">
            @csrf
            <label style="display:flex; flex-direction:column; gap:8px; color:#cbd5e1; font-weight:600;">
                Email address
                <input type="email" name="email" value="{{ old('email') }}" required autofocus style="padding:14px 16px; border-radius:14px; border:1px solid rgba(148,163,184,0.16); background:rgba(255,255,255,0.06); color:#f8fafc;" />
            </label>

            <label style="display:flex; flex-direction:column; gap:8px; color:#cbd5e1; font-weight:600;">
                Password
                <input type="password" name="password" required style="padding:14px 16px; border-radius:14px; border:1px solid rgba(148,163,184,0.16); background:rgba(255,255,255,0.06); color:#f8fafc;" />
            </label>

            <button type="submit" class="button" style="width:100%;">Sign in</button>
        </form>

        <p style="margin-top:22px; color:#94a3b8;">Admin login with verified email and password. OTP will be sent automatically for first-time access.</p>
    </section>
@endsection
