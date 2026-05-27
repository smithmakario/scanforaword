<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
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
        .code {
            background: #f8f9fa;
            border: 2px dashed #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #1a1a2e;
            margin: 20px 0;
        }
        .expiry {
            color: #888;
            font-size: 14px;
            text-align: center;
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
            
            <p>Welcome to <strong>Scan for a Word</strong>! To get started, please verify your email address.</p>
            
            <p>Your verification code is:</p>
            
            <div class="code">{{ code }}</div>
            
            <p class="expiry">This code expires in 15 minutes.</p>
            
            <p>If you didn't create an account, you can safely ignore this email.</p>
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