<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'ScanThatWord') }}</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <style>
                :root {
                    color-scheme: dark;
                    font-family: 'Instrument Sans', system-ui, sans-serif;
                    background: radial-gradient(circle at top left, rgba(249,115,22,0.18), transparent 30%),
                        linear-gradient(180deg, #0b0f1a 0%, #07090f 100%);
                    color: #f8fafc;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    min-height: 100vh;
                    background-color: #07090f;
                    color: #f8fafc;
                }

                a {
                    color: inherit;
                    text-decoration: none;
                }

                .page {
                    width: min(1180px, calc(100% - 32px));
                    margin: 0 auto;
                    padding: 24px 0 48px;
                }

                .topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 10px 0 30px;
                }

                .logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                .logo-mark {
                    width: 38px;
                    height: 38px;
                    background: linear-gradient(135deg, #fb923c, #f43f5e);
                    border-radius: 14px;
                    display: grid;
                    place-items: center;
                    color: white;
                    font-weight: 800;
                }

                .card {
                    background: rgba(15, 23, 42, 0.92);
                    border: 1px solid rgba(148, 163, 184, 0.16);
                    border-radius: 28px;
                    box-shadow: 0 32px 120px rgba(15, 23, 42, 0.24);
                    backdrop-filter: blur(18px);
                }

                .hero {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 28px;
                    align-items: center;
                }

                .hero-copy {
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                }

                .eyebrow {
                    text-transform: uppercase;
                    letter-spacing: 0.22em;
                    font-size: 0.78rem;
                    color: #fbbf24;
                }

                .hero-title {
                    font-size: clamp(2.4rem, 2.6vw, 4.4rem);
                    line-height: 1.02;
                    margin: 0;
                    max-width: 780px;
                }

                .hero-copy p {
                    font-size: 1.02rem;
                    line-height: 1.75;
                    max-width: 680px;
                    color: #cbd5e1;
                }

                .actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .button,
                .store-button {
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    border-radius: 14px;
                    padding: 14px 22px;
                    font-weight: 600;
                    transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
                }

                .button {
                    background: linear-gradient(90deg, #fb923c, #f43f5e);
                    color: white;
                }

                .button:hover,
                .store-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 18px 40px rgba(244, 63, 94, 0.2);
                }

                .store-button {
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(148, 163, 184, 0.18);
                    color: #f8fafc;
                    min-width: 180px;
                    text-align: left;
                }

                .store-button svg {
                    width: 28px;
                    height: 28px;
                    flex-shrink: 0;
                }

                .feature-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 18px;
                }

                .feature-card {
                    padding: 22px;
                    border-radius: 22px;
                    background: rgba(15, 23, 42, 0.72);
                    border: 1px solid rgba(148, 163, 184, 0.12);
                }

                .feature-card h3 {
                    margin: 0 0 12px;
                    font-size: 1rem;
                    color: #f8fafc;
                }

                .feature-card p {
                    margin: 0;
                    color: #cbd5e1;
                    line-height: 1.7;
                    font-size: 0.95rem;
                }

                .panel {
                    margin-top: 36px;
                    padding: 28px;
                    border-radius: 28px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(148, 163, 184, 0.12);
                }

                .panel h2 {
                    margin-top: 0;
                    margin-bottom: 16px;
                    font-size: 1.3rem;
                }

                .panel-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                }

                .panel-card {
                    padding: 20px;
                    border-radius: 20px;
                    background: rgba(15, 23, 42, 0.88);
                    border: 1px solid rgba(148, 163, 184, 0.08);
                }

                .panel-card strong {
                    display: block;
                    font-size: 1.7rem;
                    margin-bottom: 8px;
                }

                .panel-card span {
                    color: #94a3b8;
                    font-size: 0.95rem;
                }

                footer {
                    margin-top: 46px;
                    color: #94a3b8;
                    font-size: 0.95rem;
                    text-align: center;
                }

                .admin-surface {
                    display: grid;
                    gap: 24px;
                }

                .admin-navbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    border-radius: 22px;
                    background: rgba(15, 23, 42, 0.95);
                    border: 1px solid rgba(148, 163, 184, 0.12);
                }

                .admin-grid {
                    display: grid;
                    gap: 22px;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 18px;
                }

                .table th,
                .table td {
                    padding: 14px 18px;
                    text-align: left;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
                }

                .table th {
                    color: #94a3b8;
                    font-size: 0.88rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .table tr:hover {
                    background: rgba(255,255,255,0.03);
                }

                @media (min-width: 860px) {
                    .hero { grid-template-columns: 1fr 1fr; }
                }
            </style>
        @endif
    </head>
    <body>
        <main class="page">
            <header class="topbar">
                <a href="{{ route('landing') }}" class="logo">
                    <span class="logo-mark">S</span>
                    <span>{{ config('app.name', 'ScanThatWord') }}</span>
                </a>

                <nav style="display:flex; gap:18px; align-items:center;">
                    <a href="{{ route('landing') }}">Home</a>
                    <a href="{{ route('admin.dashboard') }}">Admin</a>
                </nav>
            </header>

            @yield('content')
        </main>
    </body>
</html>
