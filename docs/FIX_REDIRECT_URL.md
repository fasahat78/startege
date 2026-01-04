# Fix Redirect URL Issue

## Problem

After Firebase authentication, redirect goes to `0.0.0.0:8080` instead of the Cloud Run URL.

## Root Cause

1. `NEXT_PUBLIC_APP_URL` needs to be set at **BUILD TIME** (in Cloud Build trigger), not just runtime
2. The redirect code was using `request.url` which returns the internal container URL (`0.0.0.0:8080`)

## Solution

### Step 1: Add NEXT_PUBLIC_APP_URL to Cloud Build Trigger

1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=startege
2. Click on your trigger (likely named `startege`)
3. Click **"EDIT"**
4. Scroll to **"Substitution variables"**
5. Add or update:
   - **Key:** `_NEXT_PUBLIC_APP_URL`
   - **Value:** `https://startege-785373873454.us-central1.run.app`
6. Click **"SAVE"**

### Step 2: Trigger a New Build

After updating the trigger, push a commit or manually trigger a build:

```bash
# Or just push any commit to trigger the build
git commit --allow-empty -m "Trigger build with NEXT_PUBLIC_APP_URL"
git push
```

### Step 3: Verify

After deployment, test authentication:
1. Sign in with Firebase
2. Should redirect to: `https://startege-785373873454.us-central1.run.app/onboarding/persona`
3. NOT to: `0.0.0.0:8080/onboarding/persona`

## Code Fix Applied

The code now:
1. ✅ Uses `NEXT_PUBLIC_APP_URL` if available (and valid)
2. ✅ Falls back to `x-forwarded-host` header
3. ✅ Falls back to `host` header
4. ✅ Falls back to `origin` header
5. ✅ Falls back to `referer` header
6. ✅ Last resort: hardcoded Cloud Run URL

This ensures redirects work even if `NEXT_PUBLIC_APP_URL` isn't set correctly.

## Why Build Time Matters

`NEXT_PUBLIC_*` variables are:
- Embedded into the JavaScript bundle at **build time**
- Not available at runtime
- Must be set in Cloud Build trigger substitution variables

Runtime environment variables in Cloud Run won't work for `NEXT_PUBLIC_*` variables.

