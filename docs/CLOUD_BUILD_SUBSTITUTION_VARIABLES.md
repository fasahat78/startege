# Cloud Build Substitution Variables Setup

## Problem
`NEXT_PUBLIC_*` environment variables need to be available **at build time** because Next.js embeds them into the client-side bundle during `npm run build`. Cloud Run environment variables are only available at runtime, so they won't work for `NEXT_PUBLIC_*` variables.

## Solution
Add these variables as **substitution variables** in your Cloud Build trigger. They will be passed to Docker as build arguments during the build process.

---

## Step-by-Step Instructions

### 1. Go to Cloud Build Triggers

1. Open: https://console.cloud.google.com/cloud-build/triggers
2. Find your trigger: `startege` (or whatever you named it)
3. Click on the trigger name to edit it

### 2. Go to Advanced Settings

1. Scroll down to the **"Advanced"** section
2. Find **"Substitution variables"** section

### 3. Add Substitution Variables

Click **"+ Add variable"** for each of these variables:

#### Firebase Variables:
1. **Variable**: `_NEXT_PUBLIC_FIREBASE_API_KEY`
   **Value**: `AlzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats` (your Firebase API key)

2. **Variable**: `_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   **Value**: `startege.firebaseapp.com`

3. **Variable**: `_NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   **Value**: `startege`

4. **Variable**: `_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   **Value**: `startege.firebasestorage.app`

5. **Variable**: `_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   **Value**: `785373873454`

6. **Variable**: `_NEXT_PUBLIC_FIREBASE_APP_ID`
   **Value**: `1:785373873454:web:ea2aa58440389c78eda6bf`

#### Stripe Variables:
7. **Variable**: `_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   **Value**: `pk_test_51RryBeBEA7DCjdkmevVE4GulsASfu6SE` (your Stripe publishable key)

#### GCP Variables:
8. **Variable**: `_NEXT_PUBLIC_GCP_PROJECT_ID`
   **Value**: `startege`

9. **Variable**: `_NEXT_PUBLIC_GCP_LOCATION`
   **Value**: `us-central1`

#### Application Variables:
10. **Variable**: `_NEXT_PUBLIC_APP_URL`
    **Value**: `https://startege-785373873454.us-central1.run.app` (your Cloud Run URL - update after first deployment)

### 4. Save the Trigger

1. Click **"SAVE"** at the bottom
2. The variables are now saved

---

## How It Works

1. **Cloud Build** reads substitution variables from the trigger
2. **cloudbuild.yaml** passes them as `--build-arg` to Docker
3. **Dockerfile** accepts them as `ARG` and sets them as `ENV`
4. **Next.js build** (`npm run build`) reads them from environment and embeds them into the client bundle
5. **Cloud Run** also has these variables set at runtime (for consistency)

---

## Important Notes

### Variable Naming Convention
- Cloud Build substitution variables use `_` prefix: `_NEXT_PUBLIC_FIREBASE_API_KEY`
- Docker build args remove the `_` prefix: `NEXT_PUBLIC_FIREBASE_API_KEY`
- This is why we use `_NEXT_PUBLIC_*` in substitution variables

### Security
- `NEXT_PUBLIC_*` variables are **public** by design (embedded in client-side code)
- It's safe to store them as substitution variables (they're not secrets)
- Never put secrets (like `STRIPE_SECRET_KEY`) in substitution variables - use Secrets Manager instead

### Updating Variables
- If you need to update a value, edit the trigger and change the substitution variable
- The next build will use the new value
- No need to redeploy the Cloud Run service (unless you also update runtime env vars)

---

## Verification

After adding the variables and triggering a build:

1. Check build logs - you should see the build args being passed
2. Check the deployed app - it should load without the "NEXT_PUBLIC_FIREBASE_API_KEY is not set" error
3. Verify in browser console - Firebase should initialize correctly

---

## Troubleshooting

### Issue: Variables not being passed
- **Check**: Make sure variable names start with `_` in Cloud Build trigger
- **Check**: Variable names match exactly (case-sensitive)
- **Check**: Values don't have extra spaces or quotes

### Issue: Build still fails
- **Check**: Build logs to see if variables are being passed correctly
- **Check**: Dockerfile has the corresponding `ARG` declarations
- **Check**: Values are correct (no typos)

### Issue: App works but shows old values
- **Solution**: Clear browser cache
- **Solution**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Note**: Client-side bundle is cached, so changes may take a refresh to appear

