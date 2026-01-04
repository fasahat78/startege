# Fix Firebase "unauthorized-domain" Error

## Error: `Firebase: Error (auth/unauthorized-domain)`

This error means Firebase Authentication is trying to authenticate from a domain that hasn't been authorized in Firebase Console.

---

## Solution: Add Your Domain to Authorized Domains

### Step 1: Go to Firebase Console

1. Go to: https://console.firebase.google.com/project/startege/settings/general
2. Scroll down to **"Your apps"** section
3. Click on your **web app** (the one with the API key)

### Step 2: Find Authorized Domains

1. In the app settings, look for **"Authorized domains"** section
2. You should see a list like:
   - `localhost`
   - `startege.firebaseapp.com`
   - `startege.web.app`

### Step 3: Add Your Cloud Run Domain

1. Click **"+ Add domain"** button
2. Add your Cloud Run domain:
   ```
   startege-785373873454.us-central1.run.app
   ```
3. Click **"Add"**

### Step 4: Add Wildcard Domain (Optional but Recommended)

For better flexibility, also add:
```
*.us-central1.run.app
```

This allows any Cloud Run service in `us-central1` to work.

---

## Alternative: Add via Firebase Console Directly

1. Go to: https://console.firebase.google.com/project/startege/authentication/settings
2. Scroll to **"Authorized domains"** section
3. Click **"Add domain"**
4. Enter: `startege-785373873454.us-central1.run.app`
5. Click **"Add"**

---

## Complete List of Domains to Add

Add these domains to Firebase Authorized Domains:

1. **Your Cloud Run URL**:
   ```
   startege-785373873454.us-central1.run.app
   ```

2. **Wildcard for Cloud Run** (recommended):
   ```
   *.us-central1.run.app
   ```

3. **Localhost** (should already be there):
   ```
   localhost
   ```

4. **Firebase Hosting** (should already be there):
   ```
   startege.firebaseapp.com
   startege.web.app
   ```

---

## Verify It's Added

After adding:

1. Go back to Firebase Console → Authentication → Settings
2. Check **"Authorized domains"** list
3. You should see your Cloud Run domain listed

---

## Test After Adding

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Try signing in again** at your Cloud Run URL
3. The error should be gone

---

## Common Issues

### Issue 1: Domain Not Showing Up

**Solution**: 
- Make sure you clicked "Add" after entering the domain
- Refresh the Firebase Console page
- Check if you're in the correct Firebase project

### Issue 2: Still Getting Error After Adding

**Solution**:
- Clear browser cache completely
- Try in an incognito/private window
- Wait a few minutes (Firebase may take time to propagate)
- Verify the domain matches exactly (no trailing slash, correct subdomain)

### Issue 3: Multiple Cloud Run URLs

If you have multiple Cloud Run services or URLs:

**Solution**:
- Add each specific domain, OR
- Add the wildcard `*.us-central1.run.app` to cover all Cloud Run services

---

## Quick Checklist

- [ ] Added Cloud Run domain to Firebase Authorized Domains
- [ ] Added wildcard domain `*.us-central1.run.app` (optional)
- [ ] Verified domain appears in the list
- [ ] Cleared browser cache
- [ ] Tested sign-in again
- [ ] Error is resolved

---

## Still Not Working?

1. **Double-check the exact domain**:
   - Open your Cloud Run URL in browser
   - Copy the exact domain from the address bar
   - Make sure it matches exactly in Firebase Console

2. **Check Firebase project**:
   - Make sure you're adding domains to the correct Firebase project (`startege`)

3. **Check Authentication settings**:
   - Go to: https://console.firebase.google.com/project/startege/authentication/providers
   - Make sure your sign-in methods are enabled (Email/Password, Google, etc.)

