# Fix: User Logged Out After Stripe Redirect

## Problem
After a successful Stripe purchase (subscription or credits), the user is redirected back to the app but is logged out.

## Root Cause
The Firebase session cookie (`firebase-session`) is not being preserved when Stripe redirects back to your application. This happens because:

1. **Cookie domain not set**: In production, cookies need the correct domain to persist across redirects
2. **STRIPE_SUCCESS_URL might be wrong**: If it's pointing to localhost instead of production URL
3. **Cookie SameSite settings**: Need to ensure cookies are sent on redirects

## Solution

### Step 1: Verify STRIPE_SUCCESS_URL in Cloud Run

1. Go to: https://console.cloud.google.com/run/detail/us-central1/startege/variables-and-secrets?project=startege
2. Check if `STRIPE_SUCCESS_URL` is set
3. Should be: `https://startege-785373873454.us-central1.run.app/dashboard?upgraded=true`
4. If not set or wrong, add/update it

### Step 2: Verify Cookie Settings (Already Fixed)

The code has been updated to:
- Set cookie `domain` in production (extracted from `NEXT_PUBLIC_APP_URL`)
- Use `sameSite: "lax"` (allows cookies on top-level navigations like Stripe redirects)
- Use `secure: true` in production (HTTPS only)

### Step 3: Test the Fix

1. Make a test purchase
2. After Stripe redirects back, you should remain logged in
3. Check browser DevTools → Application → Cookies
4. Verify `firebase-session` cookie is present

## How It Works Now

1. **User purchases** → Stripe Checkout
2. **Stripe redirects** → `https://startege-785373873454.us-central1.run.app/dashboard?upgraded=true`
3. **Cookie is sent** → Because domain is set correctly
4. **User stays logged in** → `getCurrentUser()` finds the session cookie ✅

## Troubleshooting

### Still Getting Logged Out?

1. **Check browser console** for cookie errors
2. **Check Cloud Run logs** for authentication errors:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege AND textPayload=~'SESSION'" --limit 20 --project=startege
   ```
3. **Verify cookie in browser**:
   - DevTools → Application → Cookies
   - Look for `firebase-session` cookie
   - Check domain, path, SameSite, Secure flags

### Cookie Not Appearing?

- Make sure `NEXT_PUBLIC_APP_URL` is set correctly in Cloud Run
- Should be: `https://startege-785373873454.us-central1.run.app`
- The domain is extracted from this URL

## Additional Notes

- The fix sets the cookie `domain` attribute in production
- This ensures the cookie persists across redirects from Stripe
- `sameSite: "lax"` allows cookies to be sent on top-level navigations (like redirects)
- `secure: true` ensures cookies are only sent over HTTPS (required in production)

