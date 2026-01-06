# Apple Sign-In Setup Guide

This guide walks you through setting up Apple Sign-In with Firebase Authentication for your web application.

## Prerequisites

1. **Apple Developer Account** ($99/year) - Required for Sign in with Apple
2. **Firebase Project** - Already set up
3. **Domain** - Your production domain (e.g., `startege-785373873454.us-central1.run.app`)

## Step 1: Apple Developer Portal Setup

### 1.1 Enable Sign In with Apple for Your App

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click on **Identifiers** → **App IDs**
4. Find or create your App ID (e.g., `com.startege.app`)
5. Edit the App ID and enable **Sign In with Apple** capability
6. Save the changes

### 1.2 Create a Service ID

1. In Apple Developer Portal, go to **Identifiers** → **Services IDs**
2. Click the **+** button to create a new Service ID
3. Fill in:
   - **Description**: `Startege Web Authentication`
   - **Identifier**: `com.startege.web.auth` (or similar, must be unique)
4. Enable **Sign In with Apple**
5. Click **Configure** next to Sign In with Apple
6. Configure:
   - **Primary App ID**: Select your App ID from step 1.1
   - **Website URLs**:
     - **Domains**: Add all your domains (one per line):
       - `startege-785373873454.us-central1.run.app` (Cloud Run domain)
       - `startege.com` (custom domain)
       - `www.startege.com` (custom domain with www)
     - **Return URLs**: Add all your return URLs (one per line):
       - `https://startege.firebaseapp.com/__/auth/handler` (Firebase callback URL - REQUIRED)
       - `https://startege-785373873454.us-central1.run.app`
       - `https://startege-785373873454.us-central1.run.app/auth/signin-firebase`
       - `https://startege-785373873454.us-central1.run.app/auth/signup-firebase`
       - `https://startege.com`
       - `https://startege.com/auth/signin-firebase`
       - `https://startege.com/auth/signup-firebase`
       - `https://www.startege.com`
       - `https://www.startege.com/auth/signin-firebase`
       - `https://www.startege.com/auth/signup-firebase`
7. Click **Save** and then **Continue** → **Register**

### 1.3 Create a Key for Sign In with Apple

1. In Apple Developer Portal, go to **Keys**
2. Click the **+** button to create a new key
3. Fill in:
   - **Key Name**: `Startege Apple Sign-In Key`
   - Enable **Sign In with Apple**
4. Click **Continue** → **Register**
5. **IMPORTANT**: Download the `.p8` key file immediately (you can only download it once!)
6. Note your **Key ID** (shown after creation)
7. Note your **Team ID** (found in the top right of Apple Developer Portal)

## Step 2: Firebase Console Configuration

### 2.1 Enable Apple Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`startege`)
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Apple** provider
5. Toggle **Enable** to ON
6. Fill in the following:

   **OAuth code flow configuration:**
   - **Services ID**: Enter the Service ID from Step 1.2 (e.g., `com.startege.web.auth`)
   - **Apple Team ID**: Enter your Team ID from Step 1.3
   - **Key ID**: Enter the Key ID from Step 1.3
   - **Private Key**: Upload the `.p8` file from Step 1.3 (or paste its contents)

7. Click **Save**

### 2.2 Configure Authorized Domains

1. In Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Ensure all your domains are listed:
   - `startege-785373873454.us-central1.run.app` (Cloud Run domain)
   - `startege.com` (custom domain)
   - `www.startege.com` (custom domain with www)
   - `*.us-central1.run.app` (wildcard for Cloud Run - may already be there)
4. If any are missing, click **Add domain** and add them one by one
5. **Note**: Firebase automatically adds `localhost` for development

## Step 3: Verify Code Implementation

The code is already implemented! Verify these files exist:

- ✅ `lib/firebase-auth.ts` - Contains `signInWithApple()` function
- ✅ `app/auth/signin-firebase/page.tsx` - Has Apple sign-in button
- ✅ `app/auth/signup-firebase/page.tsx` - Has Apple sign-in button

## Step 4: Testing

### 4.1 Test in Development

1. Start your local development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signin-firebase`
3. Click the **Apple** button
4. You should see the Apple Sign-In popup
5. Sign in with your Apple ID
6. You should be redirected to the dashboard

### 4.2 Test in Production

1. Deploy to production
2. Navigate to `https://startege-785373873454.us-central1.run.app/auth/signin-firebase`
3. Click the **Apple** button
4. Complete the Apple Sign-In flow
5. Verify you're logged in and redirected correctly

## Common Issues & Troubleshooting

### Issue: "Invalid client" error

**Solution:**
- Verify the Service ID in Firebase matches the one in Apple Developer Portal
- Check that the domain in Apple Service ID configuration matches your production domain exactly

### Issue: "Popup blocked" error

**Solution:**
- Ensure popups are allowed for your domain
- Try using redirect flow instead (already implemented as `signInWithAppleRedirect()`)

### Issue: Apple Sign-In button doesn't appear

**Solution:**
- Check browser console for errors
- Verify Firebase config is loaded correctly
- Ensure Apple provider is enabled in Firebase Console

### Issue: "Domain not authorized" error

**Solution:**
- Add your domain to Firebase Authorized Domains
- Add your domain to Apple Service ID Return URLs
- Ensure domains match exactly (including protocol: `https://`)

### Issue: Key file not working

**Solution:**
- Ensure you're using the correct `.p8` key file
- Verify Key ID matches in both Apple Developer Portal and Firebase
- Check that the key has "Sign In with Apple" capability enabled

## Security Notes

1. **Private Key Security**: Never commit the `.p8` key file to Git. Store it securely.
2. **Service ID**: Keep your Service ID private and don't expose it in client-side code.
3. **Domain Validation**: Apple validates domains strictly - ensure exact matches.

## Additional Resources

- [Firebase Apple Sign-In Documentation](https://firebase.google.com/docs/auth/web/apple)
- [Apple Sign In with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Apple Developer Portal](https://developer.apple.com/account/)

## Checklist

- [ ] Apple Developer Account active
- [ ] App ID created with Sign In with Apple enabled
- [ ] Service ID created and configured
- [ ] Key created and downloaded (.p8 file)
- [ ] Team ID noted
- [ ] Key ID noted
- [ ] Firebase Console: Apple provider enabled
- [ ] Firebase Console: Service ID, Team ID, Key ID, and Private Key entered
- [ ] Firebase Console: Authorized domains configured
- [ ] Apple Developer Portal: Return URLs configured
- [ ] Tested in development
- [ ] Tested in production

## Next Steps

After completing the setup:

1. Test the Apple Sign-In flow end-to-end
2. Monitor Firebase Console → Authentication → Users for new Apple sign-ins
3. Verify user data is syncing correctly to your database
4. Test the logout flow works correctly
5. Consider adding Apple Sign-In to your marketing materials

