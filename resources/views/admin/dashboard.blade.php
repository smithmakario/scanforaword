@extends('layouts.app')

@section('content')
    <section class="admin-surface">
        <div class="admin-navbar">
            <div>
                <span style="display:block; color:#fbbf24; font-size:0.82rem; letter-spacing:0.18em; text-transform:uppercase;">Admin</span>
                <h1 style="margin:8px 0 0; font-size:2rem;">Platform control center</h1>
            </div>
            <div style="display:inline-flex; gap:10px; align-items:center;">
                <span style="display:inline-flex; align-items:center; gap:10px; padding:10px 14px; border-radius:14px; background: rgba(251, 146, 60, 0.14); color:#fbbf24; font-weight:600;">Live</span>
                @auth
                    <span style="color:#cbd5e1;">{{ auth()->user()->name }}</span>
                    <form method="POST" action="{{ route('admin.logout') }}" style="margin:0;">
                        @csrf
                        <button type="submit" class="button" style="background: rgba(255,255,255,0.08); color:#f8fafc;">Logout</button>
                    </form>
                @else
                    <a href="{{ route('login') }}" class="button" style="background: rgba(255,255,255,0.08); color:#f8fafc;">Login</a>
                @endauth
            </div>
        </div>

        @if(session('status'))
            <div style="padding:18px 22px; border-radius:20px; background:rgba(16,185,129,0.16); border:1px solid rgba(52,211,153,0.24); color:#dcfce7;">
                {{ session('status') }}
            </div>
        @endif

        <div class="admin-grid">
            <div class="panel-card">
                <strong>{{ $data['users'] ?? '—' }}</strong>
                <span>Total registered users</span>
            </div>
            <div class="panel-card">
                <strong>{{ $data['creators'] ?? '—' }}</strong>
                <span>Active creators</span>
            </div>
            <div class="panel-card">
                <strong>{{ $data['messages'] ?? '—' }}</strong>
                <span>Messages processed</span>
            </div>
            <div class="panel-card">
                <strong>{{ $data['daily_words'] ?? '—' }}</strong>
                <span>Daily words scheduled</span>
            </div>
        </div>

        <div class="card panel" style="padding: 24px; margin-top: 18px;">
            <h2>Curated admin actions</h2>
            <div style="display:flex; flex-wrap:wrap; gap:14px; margin-top:18px;">
                <a href="/api/admin/users" class="store-button" style="justify-content:center;">Users API</a>
                <a href="/api/admin/messages" class="store-button" style="justify-content:center;">Messages API</a>
                <a href="/api/admin/categories" class="store-button" style="justify-content:center;">Categories API</a>
                <a href="/api/admin/daily-words" class="store-button" style="justify-content:center;">Daily Words API</a>
            </div>
        </div>

        <div class="panel">
            <h2>Recent activity</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Status</th>
                        <th>Updated</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Creator request review</td>
                        <td>Pending</td>
                        <td>2 hours ago</td>
                    </tr>
                    <tr>
                        <td>Audio upload moderation</td>
                        <td>Live</td>
                        <td>30 minutes ago</td>
                    </tr>
                    <tr>
                        <td>Daily word schedule</td>
                        <td>Ready</td>
                        <td>Today</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
@endsection
