@extends('layouts.app')

@section('content')
    <section class="hero">
        <div class="hero-copy">
            <span class="eyebrow">Instant word discovery</span>
            <h1 class="hero-title">Turn every message, snippet, and audio link into a smarter daily word experience.</h1>
            <p>ScanThatWord helps learners, creators, and communities discover meaning from spoken and written content. Get fast keyword insights, audio highlights, and visual summaries in one place.</p>

            <div class="actions">
                <a href="#download" class="button">Download the app</a>
                <a href="{{ route('login') }}" class="button" style="background: rgba(255,255,255,0.08); color:#f8fafc;">Go to admin portal</a>
            </div>

            <div class="feature-grid">
                <div class="feature-card">
                    <h3>Audio & image support</h3>
                    <p>Upload voice clips or images and let the app extract the best words and phrases automatically.</p>
                </div>
                <div class="feature-card">
                    <h3>Creator tools</h3>
                    <p>Creator mode enables direct content uploads, keyword tagging, and custom word curation for your audience.</p>
                </div>
                <div class="feature-card">
                    <h3>Admin controls</h3>
                    <p>Moderate messages, manage categories, and schedule daily words from a polished admin console.</p>
                </div>
            </div>
        </div>

        <div class="card" style="padding: 32px;">
            <div style="display:flex; flex-direction:column; gap:24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:16px;">
                    <div>
                        <span style="font-size:0.95rem; color:#fbbf24; text-transform:uppercase; letter-spacing:0.16em;">App preview</span>
                        <h2 style="margin:14px 0 0; font-size:1.9rem;">ScanThatWord mobile experience</h2>
                    </div>
                    <span style="display:inline-flex; align-items:center; gap:9px; background: rgba(251, 146, 60, 0.12); color:#fb923c; padding:10px 14px; border-radius:999px; font-weight:600;">Trusted by word explorers</span>
                </div>

                <div style="display:grid; gap:16px;">
                    <div style="background: rgba(39, 39, 42, 0.96); border:1px solid rgba(255,255,255,0.06); border-radius:22px; padding:22px;">
                        <p style="margin:0 0 10px; font-weight:600; color:#f8fafc;">Why people love it</p>
                        <ul style="margin:0; padding-left:1.15rem; color:#cbd5e1; line-height:1.8;">
                            <li>Fast scanning of written and audio content</li>
                            <li>Easy keyword and phrase discovery</li>
                            <li>Beautiful, modern mobile interface</li>
                        </ul>
                    </div>
                    <div style="background: rgba(255,255,255,0.04); border:1px solid rgba(148, 163, 184, 0.14); border-radius:20px; padding:22px;">
                        <p style="margin:0 0 12px; font-weight:600; color:#f8fafc;">Download the apps</p>
                        <div id="download" style="display:grid; gap:14px;">
                            <a href="https://apps.apple.com" target="_blank" class="store-button">
                                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.6 13.5c-.1-1.2.4-2.1 1.3-2.8-1.1-1.6-2.9-2.4-4.7-2.1-2.1.4-3.6 2.2-3.5 4.2 0 1.1.4 2.1 1.3 2.8 1.1.9 2.4 1.4 3.9 1.6.1-.7.3-1.4.7-2.1zM16.6 3.5c-.5.6-1 1.2-1.6 1.7-.9.7-2 .9-3.1.8-1.1-.1-2.1-.7-2.9-1.4-.5-.4-.9-.9-1.3-1.5C6.4 3.2 6 2.5 6 1.7c1.4.1 2.8.8 3.7 1.8.9 1.1 1.5 2.5 1.7 4 .7 0 1.4-.2 2-.5.2-.1.4-.3.7-.5.2-.2.5-.4.7-.5s.2.1.3.3zM6.6 8.6c-1.5.6-2.6 1.9-3.1 3.4-.6 1.7-.3 3.6.7 5.1.1.2.2.4.2.6.1.3 0 .5-.2.7-1.1 1.6-2.5 2.6-4.1 3.3-.2.1-.3.1-.5.1-.5 0-.9-.3-1-.8-.2-.8-.1-1.8.2-2.8C1.7 17.6 4.7 14 8 12.9c2.1-.7 4.4-.6 6.4.3.4.2.7.2 1.1-.1.3-.2.4-.7.3-1.1-1-2.1-2.7-3.5-4.7-4.1-1-.3-2-.2-2.9.1z"/></svg>
                                <span>App Store</span>
                            </a>
                            <a href="https://play.google.com" target="_blank" class="store-button">
                                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 1.8l13.9 9.4-13.9 9.4c-.9.6-2.1.1-2.3-1-.1-1.2-.2-7.8 0-16.8.1-1.1 1.4-1.7 2.3-1zM13.1 10.1l5.8-3.9-5.8 9.1v-5.2zM14.6 12l-1-.7v4.7l1-.7c1.8-1.1 3.6-2.2 5.3-3.3 0-.1 0-.2-.1-.3L14.6 12zm-1.7 8.8l7.9-5.2V8.4l-7.9-5.2v17.6z"/></svg>
                                <span>Google Play</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="panel">
        <h2>Designed for the ScanThatWord brand</h2>
        <div class="panel-row">
            <div class="panel-card">
                <strong>Accessible</strong>
                <span>Clear contrast, large controls, and mobile-first interaction for every user.</span>
            </div>
            <div class="panel-card">
                <strong>Modern</strong>
                <span>Bright accent gradients, glassmorphism panels, and clean typography match the target feel.</span>
            </div>
            <div class="panel-card">
                <strong>Fast</strong>
                <span>Landing and admin pages are intentionally lightweight for a polished performance-first experience.</span>
            </div>
        </div>
    </section>

    <footer>Built for word discovery and creator workflow. ScanThatWord brings modern UI, audio support, and admin operations together.</footer>
@endsection
