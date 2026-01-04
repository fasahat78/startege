# Firebase API Key Troubleshooting

## Error: "auth/api-key-not-valid.-please-pass-a-valid-api-key."

This error means Firebase is rejecting the API key. Here's how to fix it:

---

## Step 1: Verify API Key in Firebase Console

1. Go to: https://console.firebase.google.com/project/startege/settings/general
2. Scroll down to **"Your apps"** section
3. Find your web app (or create one if it doesn't exist)
4. Click the **gear icon** → **"Project settings"**
5. Scroll to **"Your apps"** → Click on your web app
6. Find **"API Key"** in the config - it should look like: `AIzaSy...` (starts with `AIza`, not `Alza`)

**Important**: Firebase API keys typically start with `AIza` (capital I, not lowercase L).

---

## Step 2: Check API Key Format

Firebase API keys:
- ✅ Start with `AIza` (capital I)
- ✅ Are about 39 characters long
- ✅ Example: `AIzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats`

If your key starts with `Alza` (lowercase L), that's likely a typo or OCR error.

---

## Step 3: Verify API Key Restrictions

1. Go to: https://console.cloud.google.com/apis/credentials?project=startege
2. Find your Firebase API key (starts with `AIza...`)
3. Click on it to edit
4. Check **"API restrictions"**:
   - Should include: **"Firebase Authentication API"**
   - Should include: **"Identity Toolkit API"**
5. Check **"Application restrictions"**:
   - If set to "HTTP referrers", make sure your Cloud Run URL is added
   - Or set to "None" for testing (less secure but easier)

---

## Step 4: Verify Substitution Variable Value

1. Go to: https://console.cloud.google.com/cloud-build/triggers
2. Click on your `startege` trigger
3. Scroll to **"Substitution variables"**
4. Check `_NEXT_PUBLIC_FIREBASE_API_KEY`:
   - Value should match exactly what's in Firebase console
   - No extra spaces or quotes
   - Should start with `AIza` (capital I)

---

## Step 5: Verify Cloud Run Environment Variables

Even though `NEXT_PUBLIC_*` variables are baked into the build, also verify they're set in Cloud Run:

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your `startege` service
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. Verify `NEXT_PUBLIC_FIREBASE_API_KEY` matches Firebase console

---

## Step 6: Rebuild After Fixing

After fixing the API key:

1. **Update substitution variable** in Cloud Build trigger
2. **Update environment variable** in Cloud Run (if different)
3. **Trigger a new build** - the new API key will be baked into the build
4. **Wait for deployment** to complete
5. **Clear browser cache** and try again

---

## Common Issues

### Issue 1: API Key Typo
- **Symptom**: Key starts with `Alza` instead of `AIza`
- **Fix**: Copy the key directly from Firebase console (don't type it)

### Issue 2: Wrong Project
- **Symptom**: API key is from a different Firebase project
- **Fix**: Make sure you're using the API key from the `startege` Firebase project

### Issue 3: API Restrictions Too Strict
- **Symptom**: Key is correct but still rejected
- **Fix**: Temporarily remove API restrictions, test, then add them back

### Issue 4: Build Used Old Key
- **Symptom**: Fixed the key but still getting error
- **Fix**: Trigger a new build - old builds have the old key baked in

### Issue 5: Browser Cache
- **Symptom**: Fixed everything but still seeing error
- **Fix**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) or clear cache

---

## Quick Verification Checklist

- [ ] API key copied from Firebase console (not typed)
- [ ] API key starts with `AIza` (capital I)
- [ ] API key matches exactly in:
  - [ ] Firebase console
  - [ ] Cloud Build substitution variable
  - [ ] Cloud Run environment variable
- [ ] API restrictions allow Firebase Authentication API
- [ ] New build triggered after fixing
- [ ] Browser cache cleared

---

## Still Not Working?

1. **Check Cloud Run logs**:
   - Go to Cloud Run → Your service → **"Logs"** tab
   - Look for Firebase initialization errors

2. **Check browser console**:
   - Open browser DevTools (F12)
   - Go to **Console** tab
   - Look for Firebase errors

3. **Verify Firebase project**:
   - Make sure Firebase project `startege` exists
   - Make sure Authentication is enabled
   - Make sure the web app is registered in Firebase

4. **Test with a fresh build**:
   - Create a new revision with updated variables
   - Deploy and test

