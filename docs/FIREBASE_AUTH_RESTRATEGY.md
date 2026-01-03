# Firebase Authentication Restrategy

## Current Problems

1. **Redirect Loop**: User signs in → redirects to `/onboarding/persona` → redirects back to signin
2. **Cookie Not Readable**: Cookie is set but server components can't read it
3. **Persistent Logs Not Saving**: Logging system not working
4. **Middleware Headers**: `x-user-id` and `x-user-email` show as "none"

## Root Cause Analysis

### What Works ✅
- Firebase authentication (sign-in succeeds)
- Token generation and verification
- Cookie is set (visible in browser DevTools)
- Verify route returns `redirectUrl`

### What Doesn't Work ❌
- Cookie not accessible to server components (`getCurrentUser()`)
- Middleware not reading cookie correctly
- Redirect loop (likely because onboarding page can't read cookie)

## Proposed Solution: Simplified Flow

### Phase 1: Fix Cookie Setting
**Problem**: Cookie might not be set with correct attributes for server-side reading.

**Solution**:
1. Ensure cookie is set with:
   - `httpOnly: false` (for client-side debugging, but we need server-side access)
   - `sameSite: "lax"` (allows cross-site navigation)
   - `secure: false` (for localhost)
   - `path: "/"` (available on all routes)
   - `maxAge: 60 * 60 * 24 * 7` (7 days)

2. **CRITICAL**: Next.js server components use `cookies()` from `next/headers`, which reads cookies differently than middleware. We need to ensure the cookie is readable by both.

### Phase 2: Simplify Redirect Flow
**Current Flow**:
1. Client signs in → gets token
2. Client calls `/api/auth/firebase/verify`
3. Server sets cookie + returns `redirectUrl` in JSON
4. Client reads `redirectUrl` and does `window.location.replace()`
5. New page loads → middleware checks cookie → server component checks cookie
6. **PROBLEM**: Cookie might not be available immediately after redirect

**Proposed Flow**:
1. Client signs in → gets token
2. Client calls `/api/auth/firebase/verify`
3. Server sets cookie + returns **302 redirect** (not JSON)
4. Browser follows redirect automatically
5. Cookie is guaranteed to be set before page loads

### Phase 3: Fix Server Component Cookie Reading
**Problem**: `getCurrentUser()` uses `cookies()` from `next/headers`, which might not see the cookie immediately.

**Solution**:
1. Add retry logic in `getCurrentUser()`
2. Or: Use middleware to set headers, then read headers in server components
3. Or: Use a session store (Redis/database) instead of cookies

## Implementation Plan

### Option A: Server-Side Redirect (Recommended)
**Pros**:
- Cookie is guaranteed to be set before redirect
- Simpler client code
- Standard HTTP pattern

**Cons**:
- Requires server-side redirect (302)
- Client can't easily handle errors

**Implementation**:
```typescript
// In verify route
const response = NextResponse.redirect(redirectUrl);
response.cookies.set("firebase-token", idToken, {
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax",
  httpOnly: false, // Allow server-side reading
  secure: process.env.NODE_ENV === "production",
});
return response;
```

### Option B: Client-Side Redirect with Delay
**Pros**:
- More control over error handling
- Can show loading states

**Cons**:
- Timing issues
- Cookie might not be set when page loads

**Implementation**:
```typescript
// In client
await fetch("/api/auth/firebase/verify", ...);
// Wait longer for cookie to be set
await new Promise(resolve => setTimeout(resolve, 1000));
window.location.replace(redirectUrl);
```

### Option C: Use Session Store
**Pros**:
- No cookie timing issues
- More reliable
- Can store more data

**Cons**:
- Requires database/Redis
- More complex
- Not stateless

## Recommended Approach

**Go with Option A (Server-Side Redirect)** because:
1. It's the simplest and most reliable
2. Cookie is guaranteed to be set before redirect
3. Standard HTTP pattern
4. No timing issues

## Steps to Implement

1. **Update verify route** to return 302 redirect instead of JSON
2. **Fix cookie attributes** to ensure server-side readability
3. **Update client** to handle redirect (remove JSON parsing)
4. **Test** cookie reading in server components
5. **Add fallback** error handling

## Testing Checklist

- [ ] Sign in → redirects to onboarding
- [ ] Onboarding page can read cookie
- [ ] `getCurrentUser()` returns user
- [ ] Middleware sets headers correctly
- [ ] No redirect loops
- [ ] Works after page refresh
- [ ] Works in incognito mode
- [ ] Works after browser restart

