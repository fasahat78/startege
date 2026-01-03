# Firebase Authentication - Quick Start Guide

## Step 1: Enable Authentication

1. **In Firebase Console**, click on **"Build"** in the left sidebar
2. Click on **"Authentication"**
3. Click **"Get started"** (if you see this button)
4. You'll see a list of sign-in providers

## Step 2: Enable Email/Password Authentication

1. In the Authentication page, click on **"Sign-in method"** tab (at the top)
2. Find **"Email/Password"** in the list
3. Click on **"Email/Password"**
4. Toggle **"Enable"** to **ON**
5. Leave "Email link (passwordless sign-in)" as OFF for now
6. Click **"Save"**

## Step 3: Get Firebase Configuration (Client SDK)

1. Click the **gear icon** (⚙️) next to "Project Overview" in the left sidebar
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't have a web app yet:
   - Click the **Web icon** (`</>`)
   - Register app nickname: **"Startege Web"**
   - Click **"Register app"**
5. Copy the Firebase configuration object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "startege.firebaseapp.com",
  projectId: "startege",
  storageBucket: "startege.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Get Service Account Key (Admin SDK)

1. Still in **Project settings**
2. Click on **"Service accounts"** tab (at the top)
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the confirmation dialog
5. A JSON file will download - **SAVE THIS FILE SECURELY**
6. **DO NOT** commit this file to git!

## Step 5: Update .env.local

Open your `.env.local` file and add:

```bash
# Firebase Client SDK (Public - safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-from-step-3
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=startege.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=startege
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=startege.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (Private - keep secret!)
# Option 1: Service Account Key (JSON string)
# Convert the downloaded JSON to a single line:
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"startege","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# Option 2: Use Application Default Credentials (for GCP environments)
# FIREBASE_PROJECT_ID=startege
```

### Converting Service Account JSON to Single Line

**On macOS/Linux:**
```bash
cat path/to/service-account-key.json | jq -c
```

**Or manually:**
1. Open the downloaded JSON file
2. Copy all content
3. Remove all newlines (make it one line)
4. Wrap in single quotes: `FIREBASE_SERVICE_ACCOUNT_KEY='...'`

## Step 6: Run Database Migration

```bash
npx prisma migrate dev --name add_firebase_fields
npx prisma generate
```

## Step 7: Test Authentication

1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:3000/auth/signup-firebase`
3. Create a test account
4. Check Firebase Console → Authentication → Users to see your new user!

## Troubleshooting

### "Firebase Admin SDK not configured"
- Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
- Check that the JSON is valid (no syntax errors)
- Ensure it's wrapped in single quotes

### "Invalid API key"
- Double-check `NEXT_PUBLIC_FIREBASE_API_KEY` matches Firebase Console
- Make sure all `NEXT_PUBLIC_*` variables are set

### "User not found in database"
- Check that `/api/auth/firebase/verify` route is working
- Check browser console for errors
- Verify token is being sent correctly

## Next Steps After Setup

1. ✅ Test signup flow
2. ✅ Test signin flow  
3. ✅ Test password reset
4. ✅ Migrate existing users (optional): `npx tsx scripts/migrate-users-to-firebase.ts`
5. ✅ Update Stripe webhook to set custom claims

