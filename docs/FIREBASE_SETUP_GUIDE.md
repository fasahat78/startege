# Firebase Authentication Setup Guide

## Prerequisites

1. **GCP Project**: You need a Google Cloud Platform project
2. **Firebase Project**: Create a Firebase project linked to your GCP project

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing GCP project
3. Enable Google Analytics (optional but recommended)
4. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Enable **Email/Password** sign-in method:
   - Click "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

3. (Optional) Enable **Google** sign-in:
   - Click "Google"
   - Toggle "Enable" to ON
   - Enter support email
   - Click "Save"

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app with nickname (e.g., "Startege Web")
5. Copy the Firebase configuration object

## Step 4: Get Service Account Key (for Admin SDK)

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. **IMPORTANT**: Keep this file secure! Never commit to git.

## Step 5: Update Environment Variables

Add these to your `.env.local`:

```bash
# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (Private)
# Option 1: Service Account Key (JSON string)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# Option 2: Use Application Default Credentials (for GCP environments)
FIREBASE_PROJECT_ID=your-project-id
```

### Getting Service Account Key as JSON String

If you downloaded the JSON file, convert it to a single-line string:

```bash
# On macOS/Linux
cat path/to/service-account-key.json | jq -c

# Or manually copy the entire JSON and remove newlines
```

Then paste it into `.env.local`:

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

## Step 6: Install Firebase Packages

```bash
npm install firebase firebase-admin
```

## Step 7: Update Database Schema

Add `firebaseUid` field to User model:

```prisma
model User {
  // ... existing fields
  firebaseUid String? @unique
  emailVerified Boolean @default(false)
}
```

Run migration:
```bash
npx prisma migrate dev --name add_firebase_fields
```

## Step 8: Test Authentication

1. Start your dev server: `npm run dev`
2. Go to `/auth/signup-firebase`
3. Create a test account
4. Check Firebase Console → Authentication to see the user

## Step 9: Set Up Custom Claims (for Subscription Tiers)

When a user's subscription changes, update their custom claims:

```typescript
import { setCustomClaims } from "@/lib/firebase-server";

// When user upgrades to premium
await setCustomClaims(user.firebaseUid, {
  subscriptionTier: "premium",
  planType: "annual",
});
```

## Step 10: Update Stripe Webhook

In your Stripe webhook handler, update custom claims when subscription changes:

```typescript
// In app/api/stripe/webhook/route.ts
import { setCustomClaims } from "@/lib/firebase-server";

// After subscription update
if (user.firebaseUid) {
  await setCustomClaims(user.firebaseUid, {
    subscriptionTier: isActive ? "premium" : "free",
    planType: planType || null,
  });
}
```

## Security Best Practices

1. **Never commit** `.env.local` or service account keys
2. **Use environment variables** for all Firebase config
3. **Enable Firebase App Check** in production (prevents abuse)
4. **Set up Firebase Security Rules** for Firestore/Storage if using
5. **Monitor** Firebase Console → Authentication → Users

## Troubleshooting

### "Firebase Admin SDK not configured"
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` or `FIREBASE_PROJECT_ID` is set
- Verify service account key JSON is valid

### "Invalid token"
- Check that token is being sent correctly
- Verify Firebase project ID matches in client and admin configs

### "User not found in database"
- Check `/api/auth/firebase/verify` route is working
- Verify user creation logic in verify route

## Next Steps

1. ✅ Complete Firebase setup
2. ✅ Test signup/signin flow
3. ✅ Migrate existing users (see migration script)
4. ✅ Update all API routes to use Firebase tokens
5. ✅ Deprecate NextAuth.js

