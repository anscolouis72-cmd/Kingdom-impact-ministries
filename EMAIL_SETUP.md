# Email Verification Setup Guide

## Overview
The Kingdom Impact Ministries app now sends real verification emails to users during signup. Verification codes expire after 24 hours.

## Setting Up Email (Gmail)

### Prerequisites
- A Gmail account
- 2-Step Verification enabled on Gmail

### Step 1: Enable 2-Step Verification (if not already enabled)
1. Go to https://myaccount.google.com/security
2. Look for "2-Step Verification"
3. Click on it and follow the prompts
4. Once enabled, continue to Step 2

### Step 2: Generate an App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" from the dropdown
3. Select your device/platform from the second dropdown
4. Google will generate a 16-character password
5. Copy this password (it will have spaces - remove them)

### Step 3: Update .env File
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `xxxx-xxxx-xxxx-xxxx` with the 16-character App Password (remove spaces)

### Step 4: Restart the Server
Kill the current server process and restart:
```bash
npm start
```

## Testing Email Verification

1. Go to the signup page
2. Create a new account with your test email
3. The email will be sent to your inbox
4. Check your email for the verification code
5. Copy the code and paste it into the verification form
6. Once verified, you can log in

## Troubleshooting

### Email not received
- Check spam/junk folder
- Make sure EMAIL_PASSWORD is the App Password (not your Google password)
- Make sure .env file exists and has the correct values
- Check the server logs for errors

### Server stops after update
- The transporter might fail if .env is not configured
- Update .env with your email credentials
- The app will show fallback behavior if email sending fails

## Using Other Email Services

If you want to use a different email provider instead of Gmail:

### Outlook.com
```javascript
service: 'outlook',
auth: {
  user: 'your-email@outlook.com',
  pass: 'your-password'
}
```

### Custom SMTP
```javascript
host: 'smtp.your-server.com',
port: 587,
secure: false,
auth: {
  user: 'your-email@your-domain.com',
  pass: 'your-password'
}
```

Edit the transporter configuration in `server.js` to use these settings.

## Security Notes

- Never commit `.env` file to Git (it's in .gitignore)
- App passwords are more secure than storing your actual Gmail password
- The verification token is randomly generated and expires after 24 hours
- Users must verify email before they can login

For more information on Nodemailer, visit: https://nodemailer.com/
