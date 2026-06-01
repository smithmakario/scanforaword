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
                <a href="{{ route('landing') }}" class="button" style="background: rgba(255,255,255,0.08); color:#f8fafc;">Back to landing</a>
            </div>
        </div>

        <div class="admin-grid">
            <div class="panel-card">
                <strong>98+</strong>
                <span>Active creators signed in this month</span>
            </div>
            <div class="panel-card">
                <strong>1.2K</strong>
                <span>Messages processed with audio and image support</span>
            </div>
            <div class="panel-card">
                <strong>24</strong>
                <span>Daily words scheduled for release</span>
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
