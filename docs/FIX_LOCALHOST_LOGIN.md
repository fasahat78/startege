# Fix Localhost Login Issue

## Problem
User cannot log in on localhost. The session cookie is not being set or read properly.

## Root Cause
The baseUrl detection logic was excluding `localhost` from using `NEXT_PUBLIC_APP_URL`, and the header priority wasn't optimal for form POSTs.

## Changes Made

### 1. Fixed baseUrl Detection (`app/api/auth/firebase/verify/route.ts`)

**Before:**
- Excluded `localhost` from `NEXT_PUBLIC_APP_URL` check
- Prioritized `x-forwarded-host` over `origin` header
- No fallback for localhost in development

**After:**
- Allow `localhost` in `NEXT_PUBLIC_APP_URL` (needed for local development)
- Prioritize `origin` header (most reliable for form POSTs)
- Fallback to `http://localhost:3000` in development if no headers available

### 2. Improved Header Priority

New priority order:
1. `NEXT_PUBLIC_APP_URL` (if set and not `0.0.0.0`)
2. `origin` header (most reliable for form POSTs)
3. `host` header (if not `0.0.0.0` or `localhost:8080`)
4. `x-forwarded-host` header (for Cloud Run)
5. `referer` header (last resort)
6. Development fallback: `http://localhost:3000`
7. Production fallback: Cloud Run URL

## Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Try to sign in:**
   - Go to `http://localhost:3000/auth/signin-firebase`
   - Enter credentials and sign in
   - Check browser console for logs:
     - `[CLIENT] ===== STARTING VERIFY =====`
     - `[CLIENT] Form created, submitting...`
   - Check server console for logs:
     - `[VERIFY ROUTE] Using origin header: localhost:3000`
     - `[VERIFY ROUTE] Redirect URL (full): http://localhost:3000/dashboard`
     - `[VERIFY ROUTE] Cookie set in response`

3. **Verify cookie is set:**
   - Open browser DevTools → Application → Cookies
   - Check for `firebase-session` cookie
   - Should have:
     - Name: `firebase-session`
     - Domain: `localhost`
     - Path: `/`
     - HttpOnly: ✓
     - Secure: ✗ (in development)
     - SameSite: `Lax`

4. **Check if session is read:**
   - After redirect, check server logs:
     - `[FIREBASE AUTH HELPER] Session cookie present: true`
     - `[FIREBASE AUTH HELPER] Session cookie verified`

## Troubleshooting

### Cookie Not Set
- Check server logs for `[VERIFY ROUTE] Cookie set in response`
- Verify redirect URL is correct (should be `http://localhost:3000/...`)
- Check browser console for any errors during form submission

### Cookie Set But Not Read
- Check cookie domain matches current domain (`localhost`)
- Verify cookie path is `/`
- Check if cookie is HttpOnly (should be `true`)
- Verify `secure` flag is `false` in development

### Wrong Redirect URL
- Check server logs for `[VERIFY ROUTE] Using origin header:` or `[VERIFY ROUTE] Using host header:`
- Verify the detected host is `localhost:3000`
- If not, check if `origin` header is being sent (should be for form POSTs)

## Environment Variables

For localhost development, you can optionally set:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

But it's not required - the code will detect it from headers automatically.

