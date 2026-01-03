# Firebase Authentication Fix Summary

## Root Causes Identified

### 1. **ID Token Expiry Issue** (CRITICAL)
- **Problem**: ID tokens expire in ~1 hour, but we were storing them in cookies with 7-day expiry
- **Impact**: Middleware/server verification fails after 1 hour → redirect loop
- **Fix**: Use Firebase Admin **session cookies** instead (can last 7 days)

### 2. **httpOnly Misunderstanding**
- **Problem**: Set `httpOnly: false` thinking server components couldn't read it
- **Reality**: Server components **CAN** read httpOnly cookies (only client JS is blocked)
- **Fix**: Set `httpOnly: true` for security

### 3. **Redirect Status Code**
- **Problem**: Using 302 for POST redirects
- **Fix**: Use **303** (correct semantic for POST → redirect)

### 4. **Form POST Redirect**
- **Problem**: Form POST returns 303 but browser wasn't following redirect
- **Likely Cause**: Middleware was redirecting back (cookie not readable yet)
- **Fix**: Session cookies + 303 status should resolve this

## Changes Implemented

### 1. Session Cookie Functions (`lib/firebase-server.ts`)
```typescript
// Added:
- createSessionCookie(idToken, expiresIn)
- verifySessionCookie(sessionCookie, checkRevoked)
```

### 2. Verify Route (`app/api/auth/firebase/verify/route.ts`)
- Creates session cookie from ID token (7 days)
- Returns 303 redirect (not 302)
- Sets `firebase-session` cookie with `httpOnly: true`

### 3. Middleware (`middleware.ts`)
- Reads `firebase-session` cookie (not `firebase-token`)
- Verifies session cookie using `verifySessionCookie()`
- Deletes invalid/expired cookies

### 4. Server Components (`lib/firebase-auth-helpers.ts`)
- Reads `firebase-session` cookie
- Verifies using `verifySessionCookie()`

### 5. Diagnostic Route (`app/api/auth/firebase/diagnose/route.ts`)
- Updated to check `firebase-session` cookie

## Cookie Comparison

| Aspect | Old (ID Token) | New (Session Cookie) |
|--------|----------------|---------------------|
| **Expiry** | ~1 hour | 7 days |
| **Cookie Name** | `firebase-token` | `firebase-session` |
| **httpOnly** | false | true |
| **Verification** | `verifyIdToken()` | `verifySessionCookie()` |
| **Use Case** | Client-side auth | SSR/middleware |

## Testing Checklist

- [ ] Sign in → redirects to `/onboarding/persona`
- [ ] Cookie `firebase-session` is set
- [ ] Middleware can read cookie
- [ ] Server components can read cookie
- [ ] Onboarding page loads (doesn't redirect back)
- [ ] Works after page refresh
- [ ] Works after 1+ hour (session cookie still valid)

## Expected Flow Now

1. User signs in → Firebase ID token obtained
2. Form POST to `/api/auth/firebase/verify`
3. Server creates session cookie (7 days)
4. Server returns **303 redirect** to `/onboarding/persona`
5. Browser follows redirect automatically
6. Middleware reads `firebase-session` cookie
7. Middleware verifies session cookie
8. Server component reads cookie via `getCurrentUser()`
9. Page renders successfully ✅

## If Still Not Working

Check Network tab for:
1. POST `/api/auth/firebase/verify` → Status **303**
2. GET `/onboarding/persona` → Status **200** (not 302 back to signin)
3. Set-Cookie header present in 303 response

If GET `/onboarding/persona` returns 302 back to signin:
- Middleware can't verify session cookie
- Check server logs for verification errors
- Cookie might not be set correctly

