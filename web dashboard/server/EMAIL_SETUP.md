# Email Verification Setup Guide

## Overview
The system now requires email verification for all new Gmail account registrations. This ensures only authentic Gmail accounts can create accounts, preventing fake or dummy email addresses.

## How It Works

1. **User Registration**: User submits registration form with Gmail address
2. **Verification Email Sent**: System sends verification email to the Gmail address
3. **Email Verification**: User clicks verification link in their Gmail inbox
4. **Account Created**: Account is only created after email is verified

## Setup Instructions

### Option 1: Production Setup (Recommended)

1. **Create a Gmail App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Sign in with your Gmail account
   - Enable 2-Step Verification if not already enabled
   - Generate an App Password for "Mail"
   - Copy the 16-character password

2. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   FRONTEND_URL=http://localhost:5173
   ```

3. **Restart Server**: The server will now send real verification emails.

### Option 2: Development Mode (No Email Configuration)

If you don't configure email settings, the system will:
- Still require email verification
- Log verification links to the console
- Allow you to manually copy/paste the verification link

**Example Console Output:**
```
📧 Verification Email (Development Mode):
To: user@gmail.com
Subject: Verify your Gmail account
Verification Link: http://localhost:5173/verify-email?token=abc123...
```

## Features

- ✅ **Gmail-Only Registration**: Only @gmail.com addresses allowed
- ✅ **Email Verification**: Must verify email before account creation
- ✅ **Secure Tokens**: Cryptographically secure verification tokens
- ✅ **24-Hour Expiry**: Verification links expire after 24 hours
- ✅ **Resend Verification**: Users can request new verification emails
- ✅ **Auto-Cleanup**: Expired verifications are automatically removed

## API Endpoints

- `POST /api/auth/register` - Register new user (sends verification email)
- `GET /api/auth/verify-email?token=...` - Verify email and create account
- `POST /api/auth/resend-verification` - Resend verification email

## User Flow

1. User fills out registration form with Gmail address
2. System validates Gmail domain
3. Verification email sent to Gmail inbox
4. User clicks verification link
5. Account is created and user is automatically logged in
6. User redirected to dashboard

## Security

- Verification tokens are cryptographically secure (32 bytes)
- Tokens expire after 24 hours
- Each token can only be used once
- Pending registrations are stored securely
- Expired registrations are automatically cleaned up

