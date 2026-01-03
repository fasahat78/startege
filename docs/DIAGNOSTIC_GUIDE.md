# Firebase Auth Diagnostic Guide

## Quick Diagnostic Steps

### 1. Check Browser Console Logs

When signing in, look for these logs in order:

```
[CLIENT] ===== STARTING VERIFY =====
[CLIENT] Target redirect: /onboarding/persona
[CLIENT] ID Token length: [number]
[CLIENT] Calling verify route...
[CLIENT] Verify response status: 200
[CLIENT] Response parsed as JSON: {...}
[CLIENT] Full responseData: {...}
[CLIENT] ✅ Redirect URL found in response: /onboarding/persona
[CLIENT] ===== EXECUTING REDIRECT NOW =====
```

**If you see:**
- `[CLIENT] ❌ NO redirectUrl in response!` → Verify route isn't returning redirectUrl
- `[CLIENT] Verify response status: 0` → Network/CORS issue
- `[CLIENT] Failed to parse response as JSON` → Server returned HTML/error

### 2. Check Server Terminal Logs

Look for these logs:

```
[VERIFY ROUTE] Route handler called
[VERIFY ROUTE] Token verified successfully, UID: [uid]
[VERIFY ROUTE] Onboarding status: NOT_STARTED
[VERIFY ROUTE] ===== SUCCESS =====
[VERIFY ROUTE] Redirect URL: /onboarding/persona
[VERIFY ROUTE] Cookie set: true
```

**If you see:**
- `[VERIFY ROUTE] Firebase server import error` → Firebase Admin SDK not configured
- `[VERIFY ROUTE] Token verification error` → Invalid token
- No logs at all → Route not being called

### 3. Check Middleware Logs

Look for:

```
[MIDDLEWARE] ===== REQUEST =====
[MIDDLEWARE] Path: /onboarding/persona
[MIDDLEWARE] firebase-token present: true/false
[MIDDLEWARE] Token length: [number]
```

**If you see:**
- `[MIDDLEWARE] ⚠️ NO TOKEN FOUND` → Cookie not being set or not persisting

### 4. Use Diagnostic Page

Visit: `http://localhost:3000/debug/auth`

This page shows:
- Cookie status (present/absent)
- Token validity
- Request headers
- Environment configuration
- Full diagnostic JSON

### 5. Use Diagnostic API

Call: `GET /api/auth/firebase/diagnose`

Returns JSON with:
- Cookie status
- Token verification result
- Headers
- Environment info

## Common Issues

### Issue 1: Cookie Not Set
**Symptoms:** `[MIDDLEWARE] ⚠️ NO TOKEN FOUND`
**Check:**
- Browser DevTools → Application → Cookies
- Is `firebase-token` cookie present?
- What is its value?

### Issue 2: Redirect Not Executing
**Symptoms:** Stays on signin page, no redirect logs
**Check:**
- Browser console for `[CLIENT] ===== EXECUTING REDIRECT NOW =====`
- If missing, check if `redirectUrl` is in response
- Check for JavaScript errors blocking execution

### Issue 3: Opaque Redirect
**Symptoms:** `[CLIENT] Verify response type: opaqueredirect`
**Solution:** Already fixed - verify route returns JSON now

### Issue 4: VPN/Proxy Blocking
**Symptoms:** Cookie set but not persisting, or redirects blocked
**Check:**
- Cisco Secure Client or other VPN/proxy
- Browser security settings
- Try incognito/private window

## Firebase-Specific Diagnostics

### Check Firebase Admin SDK

Server terminal should show:
```
[FIREBASE-ADMIN] Firebase Admin initialized
```

If you see errors:
- Check `.env.local` for `FIREBASE_SERVICE_ACCOUNT_KEY`
- Verify JSON is properly formatted (no extra quotes)
- Check `FIREBASE_PROJECT_ID` is set

### Check Firebase Client SDK

Browser console should show:
- No Firebase initialization errors
- `auth.currentUser` should be set after signin

### Firebase Console Logs

Check Firebase Console → Authentication → Users:
- Is user created?
- Is email verified?
- Any error logs?

## Next Steps

1. **Sign in** and capture:
   - Browser console logs (all `[CLIENT]` logs)
   - Server terminal logs (all `[VERIFY ROUTE]` and `[MIDDLEWARE]` logs)
   - Screenshot of `/debug/auth` page

2. **Check Network Tab:**
   - `/api/auth/firebase/verify` request
   - Status code
   - Response headers (especially `Set-Cookie`)
   - Response body

3. **Check Cookies:**
   - DevTools → Application → Cookies
   - Is `firebase-token` present?
   - What is its value?
   - What are its attributes (path, sameSite, etc.)?

4. **Share all findings** so we can pinpoint the exact issue.

