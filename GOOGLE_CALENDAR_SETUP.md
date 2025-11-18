# 🗓️ Google Calendar Setup Guide

## Current Status
❌ **Google Calendar is NOT connected**

## Quick Fix Steps

### 1. Start Your App
```bash
npm run dev
```

### 2. Login as Admin
- Go to: http://localhost:3000/login
- Login with: anubhav8392@gmail.com

### 3. Connect Google Calendar
- Go to: http://localhost:3000/profile
- Look for "Connect Google Calendar" or similar button
- Or directly visit: http://localhost:3000/api/auth/google

### 4. Authorize Permissions
When Google asks for permissions, make sure to:
- ✅ Select your Google account
- ✅ Click "Allow" for calendar access
- ✅ Complete the authorization flow

### 5. Verify Connection
Run this command to check if it's connected:
```bash
node check-google-calendar.js
```

You should see:
```
✓ Access Token: Present
✓ Refresh Token: Present
✓ Calendar ID: your-calendar-id
✓ Token Status: Valid
```

## Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution:** Make sure your Google Cloud Console has this redirect URI:
```
http://localhost:3000/api/auth/google/callback
```

### Issue: "Access blocked"
**Solution:** 
1. Go to Google Cloud Console
2. Enable Google Calendar API
3. Add your email to test users (if app is in testing mode)

### Issue: Still not working after connection
**Solution:** Check browser console and server logs for specific error messages.

## Environment Variables (Already Set ✓)
- GOOGLE_CLIENT_ID: Set
- GOOGLE_CLIENT_SECRET: Set
- NEXT_PUBLIC_BASE_URL: http://localhost:3000

## Next Steps After Connection
Once connected, test the calendar by:
1. Going to schedule meeting page
2. Checking if available time slots appear
3. Creating a test meeting

---
Generated: ${new Date().toLocaleString()}
