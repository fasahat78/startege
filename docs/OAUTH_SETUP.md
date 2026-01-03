# OAuth Authentication Setup Guide

## Overview

The Startege application now supports OAuth authentication with Google and Apple. Users can sign in or sign up using their Google or Apple accounts.

## What Was Implemented

### 1. Firebase Auth Library Updates (`lib/firebase-auth.ts`)
- Added `signInWithGoogle()` - Sign in with Google using popup
- Added `signInWithApple()` - Sign in with Apple using popup
- Added `signInWithGoogleRedirect()` - Sign in with Google using redirect flow
- Added `signInWithAppleRedirect()` - Sign in with Apple using redirect flow
- Added `handleRedirectResult()` - Handle OAuth redirect results

### 2. Sign-In Page Updates (`app/auth/signin-firebase/page.tsx`)
- Added OAuth buttons for Google and Apple
- Added OAuth sign-in handler
- Added loading states for OAuth providers
- Improved error handling for OAuth flows

### 3. Sign-Up Page Updates (`app/auth/signup-firebase/page.tsx`)
- Added OAuth buttons for Google and Apple
- Added OAuth sign-up handler
- Added loading states for OAuth providers
- Improved error handling for OAuth flows

### 4. Verify Route Updates (`app/api/auth/firebase/verify/route.ts`)
- Enhanced to handle OAuth provider display names
- Improved name extraction from OAuth tokens
- Better handling of OAuth user creation and updates

## Firebase Console Configuration Required

### Google Sign-In Setup

1. **Enable Google Provider:**
   - Go to Firebase Console → Authentication → Sign-in method
   - Click on "Google" provider
   - Toggle "Enable" to ON
   - Add your project's support email
   - Click "Save"

2. **Configure OAuth Consent Screen (if needed):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Navigate to APIs & Services → OAuth consent screen
   - Configure the consent screen with your app details
   - Add authorized domains if needed

### Apple Sign-In Setup

1. **Enable Apple Provider:**
   - Go to Firebase Console → Authentication → Sign-in method
   - Click on "Apple" provider
   - Toggle "Enable" to ON
   - Configure OAuth client ID and secret (see below)

2. **Apple Developer Account Setup:**
   - You need an Apple Developer account ($99/year)
   - Go to [Apple Developer Portal](https://developer.apple.com/)
   - Create an App ID for your application
   - Create a Service ID for Sign in with Apple
   - Configure domains and redirect URLs
   - Create a Key for Sign in with Apple
   - Download the key file (.p8)

3. **Configure in Firebase:**
   - In Firebase Console → Authentication → Sign-in method → Apple
   - Enter your OAuth client ID (Service ID)
   - Enter your OAuth client secret (JWT created from the key)
   - Add authorized domains

### LinkedIn Sign-In (Not Currently Implemented)

**Note:** Firebase does not natively support LinkedIn as an OAuth provider. To add LinkedIn authentication, you would need to:

1. Use a custom OAuth provider implementation
2. Use a third-party service like Auth0 or Okta
3. Implement LinkedIn OAuth manually using their API

If you want LinkedIn support, we can implement it as a custom solution, but it will require additional setup and configuration.

## Testing OAuth Authentication

### Testing Google Sign-In

1. Navigate to `/auth/signin-firebase` or `/auth/signup-firebase`
2. Click the "Google" button
3. A popup should appear asking for Google account selection
4. After selecting an account, you should be redirected to the dashboard or onboarding

### Testing Apple Sign-In

1. Navigate to `/auth/signin-firebase` or `/auth/signup-firebase`
2. Click the "Apple" button
3. A popup should appear for Apple Sign-In
4. After authentication, you should be redirected to the dashboard or onboarding

## Troubleshooting

### Popup Blocked Error
- Ensure popups are allowed for your domain
- Check browser settings
- Try using redirect flow instead of popup

### OAuth Provider Not Enabled
- Verify the provider is enabled in Firebase Console
- Check that all required configuration is complete
- Ensure your Firebase project is properly set up

### Apple Sign-In Not Working
- Verify Apple Developer account is active
- Check that Service ID is properly configured
- Ensure domains are authorized in Apple Developer Portal
- Verify OAuth client secret (JWT) is correctly generated

### User Creation Issues
- Check that the verify route is working correctly
- Verify database connection
- Check server logs for errors

## Security Considerations

1. **HTTPS Required:** OAuth providers require HTTPS in production
2. **Authorized Domains:** Ensure all domains are properly configured
3. **Token Validation:** All tokens are validated server-side
4. **Session Management:** Session cookies are httpOnly and secure

## Next Steps

1. Configure Google and Apple providers in Firebase Console
2. Test OAuth flows in development
3. Configure production domains and redirect URLs
4. Test end-to-end user flows
5. Consider implementing LinkedIn if needed (requires custom solution)

## Code References

- OAuth Functions: `lib/firebase-auth.ts`
- Sign-In Page: `app/auth/signin-firebase/page.tsx`
- Sign-Up Page: `app/auth/signup-firebase/page.tsx`
- Verify Route: `app/api/auth/firebase/verify/route.ts`

