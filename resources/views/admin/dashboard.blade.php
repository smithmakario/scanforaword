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
                <strong>{{ $stats['users'] ?? '—' }}</strong>
                <span>Total registered users</span>
            </div>
            <div class="panel-card">
                <strong>{{ $stats['creators'] ?? '—' }}</strong>
                <span>Creator accounts</span>
            </div>
            <div class="panel-card">
                <strong>{{ $stats['messages'] ?? '—' }}</strong>
                <span>Messages processed</span>
            </div>
            <div class="panel-card">
                <strong>{{ $stats['daily_words'] ?? '—' }}</strong>
                <span>Daily words scheduled</span>
            </div>
        </div>

        <div class="panel" style="padding: 24px; margin-top: 18px;">
            <h2>Creator content moderation</h2>
            <p>Approve, archive, or remove creator uploads from the dashboard.</p>
            <table class="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Creator</th>
                        <th>Status</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($messages as $message)
                        <tr>
                            <td>{{ $message->title }}</td>
                            <td>{{ $message->creator?->name ?? 'User #' . $message->creator_id }}</td>
                            <td>{{ ucfirst($message->status) }}</td>
                            <td>{{ optional($message->created_at)->diffForHumans() }}</td>
                            <td style="display:flex; gap:8px; flex-wrap:wrap;">
                                <form method="POST" action="{{ route('admin.messages.status', $message) }}" style="display:inline-flex; gap:6px; align-items:center;">
                                    @csrf
                                    <select name="status" style="padding:8px 10px; border-radius:12px; background:rgba(255,255,255,0.08); color:#f8fafc; border:1px solid rgba(148,163,184,0.18);">
                                        <option value="processing" @if($message->status === 'processing') selected @endif>Processing</option>
                                        <option value="live" @if($message->status === 'live') selected @endif>Live</option>
                                        <option value="archived" @if($message->status === 'archived') selected @endif>Archived</option>
                                    </select>
                                    <button type="submit" class="button" style="padding:10px 14px;">Update</button>
                                </form>
                                <form method="POST" action="{{ route('admin.messages.delete', $message) }}" style="display:inline-flex;">
                                    @csrf
                                    <button type="submit" class="button" style="background:#f87171;">Delete</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5">No messages found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="panel" style="display:grid; gap:24px; grid-template-columns:1fr 1fr; margin-top:18px;">
            <div>
                <h2>Manage users</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($users as $user)
                            <tr>
                                <td>{{ $user->name }}</td>
                                <td>{{ $user->email }}</td>
                                <td>{{ $user->role }}</td>
                                <td>
                                    <form method="POST" action="{{ route('admin.users.role', $user) }}" style="display:flex; gap:8px; align-items:center;">
                                        @csrf
                                        <select name="role" style="padding:8px 10px; border-radius:12px; background:rgba(255,255,255,0.08); color:#f8fafc; border:1px solid rgba(148,163,184,0.18);">
                                            <option value="user" @if($user->role === 'user') selected @endif>User</option>
                                            <option value="creator" @if($user->role === 'creator') selected @endif>Creator</option>
                                            <option value="admin" @if($user->role === 'admin') selected @endif>Admin</option>
                                        </select>
                                        <button type="submit" class="button">Save</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4">No users found.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div>
                <h2>Manage categories</h2>
                <form method="POST" action="{{ route('admin.categories.create') }}" style="display:grid; gap:12px; margin-bottom:18px;">
                    @csrf
                    <input type="text" name="name" placeholder="Category name" required style="padding:12px 14px; border-radius:14px; background:rgba(255,255,255,0.06); border:1px solid rgba(148,163,184,0.18); color:#f8fafc;" />
                    <button type="submit" class="button">Add category</button>
                </form>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($categories as $category)
                            <tr>
                                <td>{{ $category->name }}</td>
                                <td>
                                    <form method="POST" action="{{ route('admin.categories.delete', $category) }}">
                                        @csrf
                                        <button type="submit" class="button" style="background:#f87171;">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="2">No categories found.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div class="panel" style="display:grid; gap:24px; grid-template-columns:1fr 1fr; margin-top:18px;">
            <div>
                <h2>Schedule daily word</h2>
                <form method="POST" action="{{ route('admin.dailyWords.create') }}" style="display:grid; gap:12px;">
                    @csrf
                    <label style="display:grid; gap:8px; color:#cbd5e1;">Snippet
                        <select name="snippet_id" required style="padding:12px 14px; border-radius:14px; background:rgba(255,255,255,0.06); border:1px solid rgba(148,163,184,0.18); color:#f8fafc;">
                            @foreach($snippets as $snippet)
                                <option value="{{ $snippet->id }}">{{ \Illuminate\Support\Str::limit($snippet->title ?? 'Snippet #' . $snippet->id, 60) }}</option>
                            @endforeach
                        </select>
                    </label>
                    <label style="display:grid; gap:8px; color:#cbd5e1;">Category
                        <select name="category_id" required style="padding:12px 14px; border-radius:14px; background:rgba(255,255,255,0.06); border:1px solid rgba(148,163,184,0.18); color:#f8fafc;">
                            @foreach($categories as $category)
                                <option value="{{ $category->id }}">{{ $category->name }}</option>
                            @endforeach
                        </select>
                    </label>
                    <label style="display:grid; gap:8px; color:#cbd5e1;">Scheduled for
                        <input type="date" name="scheduled_for" required style="padding:12px 14px; border-radius:14px; background:rgba(255,255,255,0.06); border:1px solid rgba(148,163,184,0.18); color:#f8fafc;" />
                    </label>
                    <button type="submit" class="button">Schedule word</button>
                </form>
            </div>

            <div>
                <h2>Daily words queue</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Snippet</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($dailyWords as $dailyWord)
                            <tr>
                                <td>{{ $dailyWord->snippet?->title ?? '—' }}</td>
                                <td>{{ $dailyWord->category?->name ?? '—' }}</td>
                                <td>{{ optional($dailyWord->scheduled_for)->format('Y-m-d') }}</td>
                                <td>
                                    <form method="POST" action="{{ route('admin.dailyWords.delete', $dailyWord) }}">
                                        @csrf
                                        <button type="submit" class="button" style="background:#f87171;">Remove</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4">No scheduled daily words found.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </section>
@endsection
