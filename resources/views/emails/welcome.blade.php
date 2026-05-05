<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Scan for a Word</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .content p {
            color: #4a4a4a;
            line-height: 1.6;
            margin: 0 0 20px;
        }
        .features {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features li {
            color: #4a4a4a;
            margin: 10px 0;
            padding-left: 10px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #888;
        }
        .footer a {
            color: #1a1a2e;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Scan for a Word</h1>
        </div>
        <div class="content">
            <p>Hi {{ name }},</p>
            
            <p>Welcome to <strong>Scan for a Word</strong>!</p>
            
            <p>Your account has been successfully created. Start exploring Bible teachings on topics that matter to you.</p>
            
            <div class="features">
                <strong>Here's what you can do:</strong>
                <ul>
                    <li>Search for teachings by topic or keyword</li>
                    <li>Save your favorite messages to your library</li>
                    <li>Receive daily words based on your interests</li>
                    <li>Share inspiring snippets with others</li>
                </ul>
            </div>
            
            <p style="text-align: center;">
                <a href="{{ app_url }}" class="btn">Get Started</a>
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ year }} Scan for a Word. All rights reserved.</p>
            <p>
                <a href="https://scanforaword.com">Website</a> | 
                <a href="https://scanforaword.com/privacy">Privacy</a> | 
                <a href="https://scanforaword.com/terms">Terms</a>
            </p>
        </div>
    </div>
</body>
</html>