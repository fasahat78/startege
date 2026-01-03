# Firebase Authentication Redirect Issue - Complete Scenario

## Problem Statement

**Goal**: After user signs in with Firebase, redirect them to `/onboarding/persona` (or `/dashboard` if onboarding is complete), with authentication cookie properly set and readable by server components.

**Current Behavior**: User signs in successfully, but:
- No redirect happens (stays on signin page)
- OR redirects but loops back to signin
- Cookie may or may not be set (inconsistent)
- Server components can't read cookie even when it's set

**URL**: `http://localhost:3000/auth/signin-firebase?redirect=%2Fonboarding%2Fpersona`

## Technical Stack

- **Framework**: Next.js 16.0.10 (App Router, Turbopack)
- **Authentication**: Firebase Authentication (replacing NextAuth.js)
- **Database**: PostgreSQL with Prisma ORM
- **Environment**: Local development (localhost:3000)
- **Browser**: Chrome (may have VPN/proxy like Cisco Secure Client)

## Architecture Overview

### Authentication Flow (Intended)

1. User enters email/password → Firebase `signInWithEmailAndPassword()`
2. Get Firebase ID token → `getIdToken()`
3. Call `/api/auth/firebase/verify` with token
4. Server verifies token, syncs user to DB, sets cookie, returns redirect
5. Browser follows redirect to `/onboarding/persona`
6. Middleware reads cookie, verifies token, sets headers
7. Server component (`getCurrentUser()`) reads cookie, loads user
8. Page renders

### Current Implementation

**Client Side** (`app/auth/signin-firebase/page.tsx`):
- Uses Firebase client SDK (`firebase/auth`)
- Gets ID token after sign-in
- Creates form with `idToken` and `redirect` fields
- Submits form to `/api/auth/firebase/verify`
- Form submission should trigger browser redirect

**Server Side** (`app/api/auth/firebase/verify/route.ts`):
- Receives POST request (JSON or form data)
- Verifies Firebase ID token using Firebase Admin SDK
- Creates/updates user in PostgreSQL database
- Checks onboarding status
- Sets `firebase-token` cookie
- Returns `NextResponse.redirect()` (302) to `/onboarding/persona` or `/dashboard`

**Middleware** (`middleware.ts`):
- Runs on every request
- Reads `firebase-token` cookie
- Verifies token using Firebase Admin SDK
- Sets `x-user-id`, `x-user-email`, `x-subscription-tier` headers
- Redirects to signin if no token

**Server Components** (`lib/firebase-auth-helpers.ts`):
- `getCurrentUser()` function
- Uses `cookies()` from `next/headers`
- Reads `firebase-token` cookie
- Verifies token, looks up user in DB
- Returns user object or null

## What We've Tried

### Attempt 1: JSON Response + Client-Side Redirect
- **Approach**: Server returns JSON with `redirectUrl`, client reads it and does `window.location.replace()`
- **Problem**: Cookie timing issue - cookie set but server component can't read it immediately
- **Result**: Redirect happens but loops back to signin

### Attempt 2: Server-Side Redirect (302)
- **Approach**: Server returns `NextResponse.redirect()` with cookie set
- **Problem**: `fetch()` with `redirect: "manual"` returns `opaqueredirect` (status 0) - can't read Location header
- **Result**: Can't detect redirect, error thrown

### Attempt 3: Form POST
- **Approach**: Create form, submit it, browser follows redirect naturally
- **Problem**: Form submits but no redirect happens
- **Result**: Stays on signin page

## Current Code State

### Client Signin (`app/auth/signin-firebase/page.tsx`)

```typescript
// After Firebase sign-in and getting ID token:
const form = document.createElement("form");
form.method = "POST";
form.action = "/api/auth/firebase/verify";
form.style.display = "none";

const idTokenInput = document.createElement("input");
idTokenInput.type = "hidden";
idTokenInput.name = "idToken";
idTokenInput.value = idToken;
form.appendChild(idTokenInput);

const redirectInput = document.createElement("input");
redirectInput.type = "hidden";
redirectInput.name = "redirect";
redirectInput.value = targetRedirect;
form.appendChild(redirectInput);

document.body.appendChild(form);
form.submit();
return; // Exit early
```

### Server Verify Route (`app/api/auth/firebase/verify/route.ts`)

```typescript
// Verifies token, syncs user, checks onboarding status
const redirectUrl = "/onboarding/persona"; // or "/dashboard"

const redirectResponse = NextResponse.redirect(redirectUrlFull, { status: 302 });
redirectResponse.cookies.set("firebase-token", idToken, {
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax",
  httpOnly: false, // Must be false for server components to read
  secure: process.env.NODE_ENV === "production",
});

return redirectResponse;
```

### Middleware (`middleware.ts`)

```typescript
const idToken = request.cookies.get("firebase-token")?.value;

if (!idToken && !isPublicRoute) {
  return NextResponse.redirect(signInUrl);
}

if (idToken) {
  const decodedToken = await verifyIdToken(idToken);
  // Set headers...
  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

### Server Component Helper (`lib/firebase-auth-helpers.ts`)

```typescript
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const firebaseToken = cookieStore.get("firebase-token")?.value;
  
  if (!firebaseToken) {
    return null;
  }
  
  const decodedToken = await verifyIdToken(firebaseToken);
  const user = await prisma.user.findUnique({
    where: { firebaseUid: decodedToken.uid },
  });
  
  return user;
}
```

## Error Messages & Logs

### Browser Console (When Form Submits)
- No errors visible
- Form submits successfully
- No redirect happens
- Page stays on `/auth/signin-firebase`

### Server Terminal
- `[VERIFY ROUTE] Route handler called`
- `[VERIFY ROUTE] Token verified successfully`
- `[VERIFY ROUTE] User found/created`
- `[VERIFY ROUTE] Redirect URL: /onboarding/persona`
- `[VERIFY ROUTE] Cookie set: true`
- `[VERIFY ROUTE] Using server-side redirect (302)`

### Network Tab
- POST to `/api/auth/firebase/verify` → Status 302
- Location header present: `/onboarding/persona`
- Set-Cookie header present: `firebase-token=...`
- But browser doesn't follow redirect

## Key Observations

1. **Form submission works**: Server receives request, processes it, returns 302
2. **Cookie is set**: Set-Cookie header is present in response
3. **Redirect URL is correct**: Location header shows `/onboarding/persona`
4. **Browser doesn't follow redirect**: Form submission doesn't trigger navigation

## Possible Root Causes

### 1. Form Submission in React/Next.js
- Form submission might be intercepted by React
- Event propagation might be blocked
- Form might need `enctype` attribute

### 2. Cookie Attributes
- `sameSite: "lax"` might not work for form POST redirects
- `httpOnly: false` might be required but causing issues
- Cookie domain/path might be wrong

### 3. Next.js App Router Behavior
- Server-side redirects from API routes might not work with form POSTs
- Middleware might be interfering
- Server components might be rendering before cookie is readable

### 4. Browser/VPN Issues
- VPN/proxy (Cisco Secure Client) might block redirects
- Browser security settings
- CORS issues

### 5. Timing Issues
- Cookie set but not immediately readable
- Race condition between cookie set and page load
- Server component renders before cookie is available

## Environment Variables

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_KEY={...}
FIREBASE_PROJECT_ID=...
```

## Database Schema

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  firebaseUid     String?   @unique
  emailVerified   Boolean   @default(false)
  emailVerifiedAt DateTime?
  subscriptionTier String   @default("free")
  // ... other fields
}
```

## Questions for Other Agents

1. **Why doesn't form submission trigger browser redirect?**
   - Form POST to API route returns 302, but browser doesn't navigate
   - Is this a Next.js App Router limitation?
   - Should we use a different approach?

2. **Cookie not readable by server components**
   - Cookie is set (visible in browser DevTools)
   - But `cookies()` from `next/headers` returns null
   - Is there a timing issue?
   - Are cookie attributes correct?

3. **Alternative approaches?**
   - Should we use Next.js Server Actions instead?
   - Should we use a different auth pattern?
   - Should we use session storage instead of cookies?

4. **Form POST redirect behavior**
   - Does Next.js handle form POST redirects differently?
   - Should we use `window.location.href` instead of form submit?
   - Should we use a different redirect mechanism?

## Files to Review

- `app/auth/signin-firebase/page.tsx` - Client signin form
- `app/api/auth/firebase/verify/route.ts` - Server verify route
- `middleware.ts` - Request middleware
- `lib/firebase-auth-helpers.ts` - Server component helpers
- `lib/firebase-server.ts` - Firebase Admin SDK wrapper
- `lib/firebase.ts` - Firebase client SDK initialization

## Test Cases to Verify

1. ✅ Firebase sign-in works (user authenticated)
2. ✅ ID token obtained successfully
3. ✅ Server receives verify request
4. ✅ Token verification succeeds
5. ✅ User created/updated in database
6. ✅ Cookie set in response headers
7. ✅ Redirect URL is correct
8. ❌ Browser doesn't follow redirect
9. ❌ Cookie not readable by server components
10. ❌ Page doesn't load after redirect

## Next Steps

1. Investigate why form POST doesn't trigger redirect
2. Check if cookie attributes are correct
3. Consider alternative approaches (Server Actions, different redirect method)
4. Test in different browsers/environments
5. Check Next.js documentation for form POST redirect behavior

