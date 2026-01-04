# Firebase API Key Verification Checklist

## ✅ Confirmed
- **API Key**: `AIzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats` ✅ (correct format)
- **API Restrictions**: 24 APIs including Identity Toolkit API ✅
- **Application Restrictions**: None (unrestricted) ✅

## 🔍 Now Verify These Match

### 1. Cloud Build Trigger Substitution Variable

1. Go to: https://console.cloud.google.com/cloud-build/triggers
2. Click on your `startege` trigger
3. Click **"EDIT"**
4. Scroll to **"Substitution variables"** section
5. Find `_NEXT_PUBLIC_FIREBASE_API_KEY`
6. **Verify the value is exactly**: `AIzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats`
   - ✅ Should match exactly
   - ❌ If different, click "Edit" and update it
7. Click **"SAVE"** if you made changes

### 2. Cloud Run Environment Variables

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your `startege` service
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. Scroll to find `NEXT_PUBLIC_FIREBASE_API_KEY`
6. **Verify the value is exactly**: `AIzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats`
   - ✅ Should match exactly
   - ❌ If different, click the edit icon and update it
7. Click **"DEPLOY"** if you made changes

### 3. Local `.env.local` File (For Testing)

1. Open `.env.local` in your project root
2. Find `NEXT_PUBLIC_FIREBASE_API_KEY`
3. **Verify the value is exactly**: `AIzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats`
   - ✅ Should match exactly
   - ❌ If different, update it

---

## 🧪 Test the Key Locally

Run this command to test if the key works:

```bash
tsx scripts/test-firebase-api-key.ts
```

Expected output:
```
✅ API key is set
✅ API key format is correct (starts with AIza)
✅ Firebase initialized successfully!
```

If you see errors, share them.

---

## 🚀 After Verification

Once all three places match:

1. **Trigger a new Cloud Build**:
   - Go to: https://console.cloud.google.com/cloud-build/triggers
   - Click on your trigger → **"RUN TRIGGER"**
   - Or push a commit to trigger automatically

2. **Wait for deployment** (check Cloud Build logs)

3. **Test the deployed app**:
   - Go to your Cloud Run URL
   - Try to sign in
   - Open browser DevTools (F12) → Console tab
   - Should NOT see Firebase API key errors

---

## 🐛 If Still Not Working

### Check 1: Verify Build Used New Key
1. Go to: https://console.cloud.google.com/cloud-build/builds
2. Click on the latest build
3. Expand the **"build-image"** step
4. Look for `--build-arg=NEXT_PUBLIC_FIREBASE_API_KEY=...`
5. Verify it shows your correct key

### Check 2: Check Browser Console
1. Open your deployed app
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Look for any Firebase errors
5. Share the error message if you see one

### Check 3: Check Cloud Run Logs
1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your service → **"Logs"** tab
3. Look for Firebase initialization errors
4. Share any errors you see

---

## Quick Checklist

- [ ] API key matches in Cloud Build trigger (`_NEXT_PUBLIC_FIREBASE_API_KEY`)
- [ ] API key matches in Cloud Run env vars (`NEXT_PUBLIC_FIREBASE_API_KEY`)
- [ ] API key matches in local `.env.local`
- [ ] Test script passes locally (`tsx scripts/test-firebase-api-key.ts`)
- [ ] New build triggered after updating
- [ ] Browser cache cleared
- [ ] Tested in production (no errors)

