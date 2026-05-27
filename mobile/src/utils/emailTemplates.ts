export const verificationEmailStyles = {
  container: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    minHeight: '100vh',
  },
  wrapper: {
    maxWidth: 500,
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: 30,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    padding: 30,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 20,
  },
  text: {
    color: '#4a4a4a',
    lineHeight: 24,
    marginBottom: 20,
  },
  codeBox: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#1a1a2e',
  },
  expiry: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
  link: {
    color: '#1a1a2e',
    textDecorationLine: 'none',
  },
};

export const verificationEmailHTML = (name: string, code: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:20px;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">Scan for a Word</h1>
    </div>
    <div style="padding:30px;">
      <p style="font-size:18px;font-weight:600;color:#1a1a2e;margin-bottom:20px;">Hi ${name},</p>
      <p style="color:#4a4a4a;line-height:1.6;margin-bottom:20px;">Welcome to <strong>Scan for a Word</strong>! To get started, please verify your email address.</p>
      <p style="color:#4a4a4a;line-height:1.6;margin-bottom:20px;">Your verification code is:</p>
      <div style="background:#f8f9fa;border:2px dashed #e0e0e0;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a2e;">${code}</span>
      </div>
      <p style="color:#888;font-size:14px;text-align:center;margin-bottom:20px;">This code expires in 15 minutes.</p>
      <p style="color:#888;font-size:14px;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
    <div style="background:#f8f9fa;padding:20px;text-align:center;">
      <p style="color:#888;font-size:12;margin:0;">&copy; ${new Date().getFullYear()} Scan for a Word. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;