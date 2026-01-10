# Domain Setup Guide: startege.com & www.startege.com

This guide lists all places where you need to add your custom domains (`startege.com` and `www.startege.com`).

## 🔴 Critical: Firebase Authorized Domains (Fixes OAuth Errors!)

**This is the most important one** - it fixes both `auth/unauthorized-domain` and `auth/network-request-failed` errors.

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **startege**
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"** and add:
   - `startege.com` (without `https://`)
   - `www.startege.com` (without `https://`)
   - `localhost` (for local development - should already be there)

**Note:** Firebase automatically includes:
- `startege.firebaseapp.com` (your Firebase project domain)
- `startege.web.app` (Firebase hosting domain)

### ⚠️ Troubleshooting `net::ERR_NETWORK_CHANGED` Error

If you see `net::ERR_NETWORK_CHANGED` or `auth/network-request-failed` when signing in with OAuth:

1. **Verify Authorized Domains** (most common fix):
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Ensure both `startege.com` and `www.startege.com` are listed
   - Remove and re-add if they're already there (sometimes helps)

2. **Check API Key Restrictions**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to: **APIs & Services** → **Credentials**
   - Find your Firebase API key (starts with `AIza...`)
   - Click on it to edit
   - Under **"Application restrictions"**, check:
     - If set to "HTTP referrers", ensure your domains are listed:
       - `https://startege.com/*`
       - `https://www.startege.com/*`
       - `http://localhost:3000/*` (for development)
     - Or temporarily set to "None" to test (not recommended for production)

3. **Network Issues**:
   - Try refreshing the page and signing in again
   - Check your internet connection
   - Try from a different network/browser
   - Clear browser cache and cookies

4. **Browser Console Check**:
   - Open browser DevTools → Console
   - Look for any CORS errors or blocked requests
   - Check Network tab for failed requests to `identitytoolkit.googleapis.com`

---

## 1. Environment Variables

### GitHub Secrets (for Cloud Build)

Add/update these secrets in GitHub:
- Repository → Settings → Secrets and variables → Actions

**Required:**
```
NEXT_PUBLIC_APP_URL=https://startege.com
```

**Optional (if you want to support www):**
```
NEXT_PUBLIC_APP_URL_WWW=https://www.startege.com
```

### Local Development (.env.local)

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Cloud Run Environment Variables)

If you're setting env vars directly in Cloud Run:
```
NEXT_PUBLIC_APP_URL=https://startege.com
```

---

## 2. Next.js Configuration

### File: `next.config.js`

The CORS configuration already uses `NEXT_PUBLIC_APP_URL`, but verify it's correct:

```javascript
// Line 23 - should use NEXT_PUBLIC_APP_URL env var
value: process.env.NODE_ENV === "production" 
  ? process.env.NEXT_PUBLIC_APP_URL || "https://startege.com"
  : "*",
```

**No changes needed** - it already uses the env var correctly.

---

## 3. Stripe Configuration

### Stripe Checkout Redirect URLs

**Good news:** Stripe Checkout doesn't require domain whitelisting in settings. The redirect URLs are configured in code and will automatically use your domain once `NEXT_PUBLIC_APP_URL` is set.

The redirect URLs in `lib/stripe.ts` already use `NEXT_PUBLIC_APP_URL`, so they'll automatically work with:
- Success: `https://startege.com/dashboard?upgraded=true`
- Cancel: `https://startege.com/dashboard?upgraded=false`

### Stripe Webhook Configuration (if needed)

**Current webhook URL (Cloud Run default):**
```
https://startege-785373873454.us-central1.run.app/api/stripe/webhook
```

**Update to custom domain:**
```
https://startege.com/api/stripe/webhook
```

**To update webhook URL:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to: **Developers** → **Webhooks**
3. Click on your webhook (e.g., "Startege Prod")
4. Update the **Endpoint URL** field to: `https://startege.com/api/stripe/webhook`
5. Click **"Save destination"**

**⚠️ Important:** Only update the webhook URL **after** you've mapped the custom domain in Cloud Run. Otherwise, webhooks will fail until the domain is active.

### Stripe Customer Portal (Required - Your app uses this!)

**Your app uses Stripe Customer Portal** for subscription management. Users access it via:
- `/dashboard/billing` page → "Manage Subscription" button
- Payment methods management

**Portal Status:** ✅ Active (you can see the green "Active" badge)

**Important Configuration:**

1. **Expand "Business information"** section (click the dropdown arrow)
2. Configure the **Return URL**:
   - This is where users are redirected after managing their subscription
   - Set to: `https://startege.com/dashboard/billing`
   - Or: `https://www.startege.com/dashboard/billing` (if you prefer www)
3. **Optional:** Customize appearance (colors, logo) if desired
4. Click **"Save changes"** at the bottom

**About the Portal Link:**

- The link shown (`billing.stripe.com/p/login/...`) is a **direct link** - don't use this
- Your app generates **session-specific URLs** via `/api/stripe/create-portal-session`
- Users access the portal through your app's "Manage Subscription" button
- The return URL ensures users come back to your app after managing their subscription

**How it works:**
1. User clicks "Manage Subscription" in your app (`/dashboard/billing`)
2. Your API creates a portal session with the return URL
3. User is redirected to Stripe's portal
4. After managing subscription, user is redirected back to `https://startege.com/dashboard/billing`

---

## 4. Cloud Run Domain Mapping

### Map Custom Domain to Cloud Run Service

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Select your service: **startege**
3. Click **"MANAGE CUSTOM DOMAINS"**
4. Add domains:
   - `startege.com`
   - `www.startege.com`

**Note:** You'll need to verify domain ownership via DNS records.

---

## 5. DNS Configuration

### DNS Records Needed

Add these DNS records in your domain registrar:

**For startege.com:**
```
Type: A or CNAME
Name: @
Value: [Cloud Run IP or CNAME target]
```

**For www.startege.com:**
```
Type: CNAME
Name: www
Value: [Cloud Run CNAME target]
```

**Firebase Hosting (if using):**
```
Type: A
Name: @
Value: [Firebase IP addresses]
```

---

## 6. Cloud Build Configuration

### File: `cloudbuild.yaml`

If you have a `cloudbuild.yaml` file, ensure it passes `NEXT_PUBLIC_APP_URL`:

```yaml
substitutions:
  _NEXT_PUBLIC_APP_URL: 'https://startege.com'
```

---

## 7. Dockerfile

### File: `Dockerfile`

The Dockerfile already accepts `NEXT_PUBLIC_APP_URL` as a build arg (line 37), so no changes needed.

---

## 8. Code References

### Files That Use NEXT_PUBLIC_APP_URL:

These files already use the env var correctly - just ensure it's set:

1. **`lib/stripe.ts`** - Stripe redirect URLs
2. **`next.config.js`** - CORS headers
3. **`Dockerfile`** - Build-time env vars

---

## 9. OAuth Providers (Google, Apple)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://startege.com`
   - `https://www.startege.com`
5. Add to **Authorized redirect URIs**:
   - `https://startege.com/api/auth/callback/google`
   - `https://www.startege.com/api/auth/callback/google`

### Apple Sign In

You're currently viewing the Services ID configuration page (`com.startege.web.auth`). Here's how to add your domains:

1. **Click the blue "Configure" button** next to "Sign In with Apple"
2. In the configuration modal, you'll see two sections:

   **Website URLs:**
   - **Domains and subdomains**: Add one per line:
     ```
     startege.com
     www.startege.com
     ```
   
   **Return URLs** (also called Redirect URLs):
   - Add these URLs (one per line):
     ```
     https://startege.firebaseapp.com/__/auth/handler
     https://startege.com
     https://www.startege.com
     https://startege.com/auth/signin-firebase
     https://www.startege.com/auth/signin-firebase
     https://startege.com/auth/signup-firebase
     https://www.startege.com/auth/signup-firebase
     ```

3. Click **"Save"** or **"Continue"** in the modal
4. Back on the main page, click **"Continue"** (blue button, top right)
5. Review and click **"Register"** or **"Save"** to finalize

**Important Notes:**
- The Firebase callback URL (`https://startege.firebaseapp.com/__/auth/handler`) is **required** - Firebase uses this to handle Apple authentication
- Add both `startege.com` and `www.startege.com` if you're using both domains
- Domains should be entered **without** `https://` in the "Domains" field
- Return URLs should include **full URLs with** `https://`

---

## 10. Verification Checklist

After making all changes:

- [ ] Firebase authorized domains added
- [ ] `NEXT_PUBLIC_APP_URL` set in GitHub Secrets
- [ ] `NEXT_PUBLIC_APP_URL` set in Cloud Run env vars
- [ ] Stripe webhook URL verified (if using webhooks)
- [ ] Cloud Run custom domains mapped
- [ ] DNS records configured
- [ ] Google OAuth domains added
- [ ] Apple Sign In domains added (if using)
- [ ] Test login at `https://startege.com/auth/signin-firebase`
- [ ] Test login at `https://www.startege.com/auth/signin-firebase`

---

## Quick Fix for Current Error

**Immediate action needed:**

1. **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
   - Add: `startege.com`
   - Add: `www.startege.com`

2. **Google Cloud Console** → **APIs & Services** → **Credentials** → **Firebase API Key**
   - Click **Edit** on your Firebase API key (starts with `AIza...`)
   - Under **Application restrictions** → Select **HTTP referrers (web sites)**
   - Add these referrers (one per line):
     ```
     http://localhost:3000/*
     http://localhost:3001/*
     http://localhost:3002/*
     http://127.0.0.1:3000/*
     http://127.0.0.1:3001/*
     http://127.0.0.1:3002/*
     https://startege.com/*
     https://www.startege.com/*
     https://startege.firebaseapp.com/*
     ```
   - Click **Save**

3. **GitHub Secrets** → Add/Update:
   ```
   NEXT_PUBLIC_APP_URL=https://startege.com
   ```

4. **Redeploy** via Cloud Build

This should fix the `auth/unauthorized-domain` and `auth/requests-from-referer-are-blocked` errors immediately.

---

## Testing

After setup, test these URLs:

```bash
# Main domain
https://startege.com/auth/signin-firebase

# WWW subdomain
https://www.startege.com/auth/signin-firebase

# Should redirect www to non-www (optional)
# Configure in Cloud Run or via DNS
```

---

## Notes

- **WWW vs Non-WWW**: Decide if you want `www.startege.com` to redirect to `startege.com` or vice versa
- **HTTPS**: Ensure SSL certificates are configured (Cloud Run handles this automatically)
- **Caching**: After domain changes, clear browser cache or use incognito mode for testing

