# Verify or Regenerate Firebase API Key

## Step 1: Find Your Current API Key in Firebase Console

1. **Go to Firebase Console**:
   - Open: https://console.firebase.google.com/project/startege/settings/general

2. **Find Your Web App**:
   - Scroll down to **"Your apps"** section
   - Look for your web app (should show as "Web" platform)
   - If you don't see one, click **"Add app"** → **"Web"** (</>) to create one

3. **Get the API Key**:
   - Click on your web app card
   - You'll see a config object like this:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats",
       authDomain: "startege.firebaseapp.com",
       projectId: "startege",
       // ... other config
     };
     ```
   - **Copy the `apiKey` value** - it should start with `AIza` (capital I, not lowercase L)

---

## Step 2: Verify the API Key is Correct

### Check 1: Format
- ✅ Should start with `AIza` (capital I, lowercase z, lowercase a)
- ✅ Should be about 39 characters long
- ✅ Should NOT start with `Alza` (lowercase L) - that's a typo

### Check 2: API Restrictions (Optional but Recommended)
1. Go to: https://console.cloud.google.com/apis/credentials?project=startege
2. Find your Firebase API key (starts with `AIza...`)
   - Look for: **"Browser key (auto created by Firebase)"**
3. Click on the API key name to edit it
4. You'll see two sections:

   **A. API restrictions** (top section):
   - Should include: **"Identity Toolkit API"** ✅ (I can see this in your list)
   - Should include: **"Firebase Authentication API"** (if available)
   - Your list shows 24 APIs which is fine

   **B. Application restrictions** (bottom section):
   - Scroll down past the API restrictions list
   - You'll see a section labeled **"Application restrictions"**
   - Current setting options:
     - **"None"** - No restrictions (easiest for testing)
     - **"HTTP referrers (web sites)"** - Requires adding your URLs
     - **"IP addresses (web servers, cron jobs, etc.)"** - For server-side
     - **"Android apps"** - For Android
     - **"iOS apps"** - For iOS
   
   **For Cloud Run deployment, you have two options:**
   
   **Option 1: Set to "None" (Recommended for testing)**
   - Select **"None"** from the dropdown
   - Click **"Save"**
   - This removes all application restrictions
   - ⚠️ Less secure but easier to debug
   
   **Option 2: Set to "HTTP referrers" (More secure)**
   - Select **"HTTP referrers (web sites)"**
   - Click **"+ Add an item"**
   - Add these URLs (one per line):
     ```
     https://startege-*.us-central1.run.app/*
     https://startege-785373873454.us-central1.run.app/*
     http://localhost:3000/*
     ```
   - Click **"Save"**

---

## Step 3: Generate a New API Key (If Needed)

If you want to generate a new API key:

### Option A: Create a New Web App (Recommended)
1. Go to: https://console.firebase.google.com/project/startege/settings/general
2. Scroll to **"Your apps"** section
3. Click **"Add app"** → **"Web"** (</>)
4. Register the app:
   - **App nickname**: `startege-web-production` (or any name)
   - **Firebase Hosting**: Leave unchecked (unless you're using it)
5. Click **"Register app"**
6. Copy the new `apiKey` from the config

### Option B: Regenerate Existing Key (Not Recommended)
**Note**: Regenerating will invalidate the old key immediately. Only do this if you're sure.

1. Go to: https://console.cloud.google.com/apis/credentials?project=startege
2. Find your Firebase API key
3. Click on it
4. Click **"Regenerate key"** at the top
5. Copy the new key

---

## Step 4: Update the API Key Everywhere

After getting the correct API key, update it in **ALL** these places:

### 1. Cloud Build Trigger Substitution Variable
1. Go to: https://console.cloud.google.com/cloud-build/triggers
2. Click on your `startege` trigger
3. Click **"EDIT"**
4. Scroll to **"Substitution variables"**
5. Find `_NEXT_PUBLIC_FIREBASE_API_KEY`
6. **Replace the value** with your new API key
7. Click **"SAVE"**

### 2. Cloud Run Environment Variables
1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your `startege` service
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. Find `NEXT_PUBLIC_FIREBASE_API_KEY`
6. **Replace the value** with your new API key
7. Click **"DEPLOY"**

### 3. Local `.env.local` File (For Development)
1. Open `.env.local` in your project root
2. Find `NEXT_PUBLIC_FIREBASE_API_KEY`
3. **Replace the value** with your new API key
4. Save the file

---

## Step 5: Verify the Key is Working

### Test Locally
1. Make sure `.env.local` has the correct key
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Go to: http://localhost:3000/auth/signin-firebase
4. Try to sign in - should work without API key errors

### Test in Production
1. **Trigger a new Cloud Build**:
   - Go to: https://console.cloud.google.com/cloud-build/triggers
   - Click on your trigger → **"RUN TRIGGER"**
   - Or push a commit to trigger it automatically

2. **Wait for deployment** to complete (check Cloud Build logs)

3. **Test the deployed app**:
   - Go to your Cloud Run URL
   - Try to sign in
   - Open browser DevTools (F12) → Console tab
   - Should NOT see Firebase API key errors

---

## Step 6: Debugging

If you're still getting errors after updating:

### Check 1: Verify Key Format
- Open browser DevTools (F12) → Console tab
- Type: `console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)`
- Should show your API key starting with `AIza`

### Check 2: Check Cloud Run Logs
1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your service → **"Logs"** tab
3. Look for Firebase initialization errors

### Check 3: Verify Build Used New Key
1. Go to: https://console.cloud.google.com/cloud-build/builds
2. Check the latest build logs
3. Look for the Docker build step
4. Verify the `--build-arg` shows your new API key

### Check 4: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

---

## Quick Checklist

- [ ] API key copied from Firebase console (not typed manually)
- [ ] API key starts with `AIza` (capital I, not lowercase L)
- [ ] API key is about 39 characters long
- [ ] Updated in Cloud Build trigger substitution variable
- [ ] Updated in Cloud Run environment variables
- [ ] Updated in local `.env.local` file
- [ ] Triggered a new build after updating
- [ ] Cleared browser cache
- [ ] Tested locally (works)
- [ ] Tested in production (works)

---

## Still Not Working?

1. **Double-check the key**:
   - Copy directly from Firebase console (don't type it)
   - Verify no extra spaces or quotes
   - Verify it matches exactly in all 3 places

2. **Check API restrictions**:
   - Temporarily remove all restrictions
   - Test if it works
   - If it works, add restrictions back one by one

3. **Try a completely new API key**:
   - Create a new web app in Firebase
   - Use that new API key
   - Update everywhere

4. **Check Firebase project**:
   - Make sure you're using the `startege` Firebase project
   - Make sure Authentication is enabled
   - Make sure the web app is registered

