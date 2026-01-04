# Debugging Firebase API Key Issues in Cloud Run

## Quick Debug Endpoints

### 1. Server-Side Firebase Config Check

**Endpoint**: `GET /api/debug/firebase`

**Usage**: Visit `https://your-cloud-run-url/api/debug/firebase`

**What it shows**:
- ✅ Whether all Firebase config variables are present
- ✅ API key format validation (starts with `AIza`, correct length)
- ✅ Server-side Firebase initialization test
- ✅ Detailed error messages if something is wrong

**Example Response** (Success):
```json
{
  "status": "ok",
  "config": {
    "apiKey": {
      "present": true,
      "length": 39,
      "startsWithAIza": true,
      "firstChars": "AIzaSyCQet",
      "lastChars": "_bats"
    },
    ...
  },
  "validation": {
    "allConfigPresent": true,
    "apiKeyFormatValid": true,
    "initializationSuccess": true
  },
  "recommendations": ["All checks passed! Firebase configuration is valid."]
}
```

**Example Response** (Error):
```json
{
  "status": "error",
  "config": {
    "apiKey": {
      "present": false
    }
  },
  "validation": {
    "allConfigPresent": false,
    "apiKeyFormatValid": false,
    "initializationSuccess": false
  },
  "recommendations": [
    "Missing required Firebase configuration variables"
  ]
}
```

---

## 2. Check Cloud Run Logs

### Method 1: GCP Console

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your `startege` service
3. Click **"Logs"** tab
4. Look for entries with `[FIREBASE]` prefix
5. Filter by:
   - `[FIREBASE]` - Firebase-related logs
   - `ERROR` - Error level logs
   - `api-key-not-valid` - API key errors

### Method 2: gcloud CLI

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege AND textPayload=~'FIREBASE'" --limit 50 --format json
```

### Method 3: Real-time Logs

```bash
gcloud run services logs tail startege --project=startege --region=us-central1
```

---

## 3. Check Browser Console (Client-Side)

1. Open your deployed app: `https://your-cloud-run-url`
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for Firebase errors:
   - `Firebase: Error (auth/api-key-not-valid...)`
   - `Firebase: Error (auth/invalid-api-key)`
   - `NEXT_PUBLIC_FIREBASE_API_KEY is not set`

5. Check what API key is being used:
   ```javascript
   // In browser console
   console.log(window.__NEXT_DATA__.env.NEXT_PUBLIC_FIREBASE_API_KEY);
   // Or check the page source for NEXT_PUBLIC_FIREBASE_API_KEY
   ```

---

## 4. Verify Build Used Correct Key

### Check Cloud Build Logs

1. Go to: https://console.cloud.google.com/cloud-build/builds?project=startege
2. Click on the latest build
3. Expand the **"build-image"** step
4. Look for this line:
   ```
   --build-arg=NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQet...
   ```
5. Verify it shows your correct API key (first 10 chars should match)

### Check Docker Build Args

In Cloud Build logs, you should see:
```
Step X/Y : ARG NEXT_PUBLIC_FIREBASE_API_KEY
Step X/Y : ENV NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
```

---

## 5. Common Issues & Solutions

### Issue 1: API Key Not in Build

**Symptom**: `/api/debug/firebase` shows `apiKey.present: false`

**Solution**:
1. Verify Cloud Build trigger has `_NEXT_PUBLIC_FIREBASE_API_KEY` substitution variable
2. Verify the value matches Firebase Console
3. Trigger a new build

### Issue 2: Wrong API Key Format

**Symptom**: `/api/debug/firebase` shows `apiKeyFormatValid: false`

**Solution**:
1. Check if key starts with `AIza` (not `Alza`)
2. Verify key length is ~39 characters
3. Copy key directly from Firebase Console (don't type it)

### Issue 3: Initialization Fails

**Symptom**: `/api/debug/firebase` shows `initializationSuccess: false`

**Possible Causes**:
- API key restrictions too strict
- Wrong Firebase project
- API key from different project

**Solution**:
1. Check API restrictions in GCP Console
2. Temporarily remove restrictions to test
3. Verify project ID matches

### Issue 4: Key Works Locally But Not in Cloud Run

**Symptom**: Local test passes, but Cloud Run fails

**Solution**:
1. Check Cloud Build logs - verify key was passed to build
2. Check `/api/debug/firebase` endpoint in Cloud Run
3. Compare local `.env.local` with Cloud Run env vars
4. Verify a new build was triggered after updating

---

## 6. Step-by-Step Debugging Workflow

1. **Check Server-Side Config**:
   ```
   curl https://your-cloud-run-url/api/debug/firebase
   ```
   Or visit in browser

2. **Check Cloud Run Logs**:
   - Look for `[FIREBASE]` entries
   - Check for initialization errors

3. **Check Browser Console**:
   - Open DevTools → Console
   - Look for Firebase errors
   - Check what API key is embedded in the page

4. **Verify Build**:
   - Check Cloud Build logs
   - Verify build args include correct key

5. **Compare Values**:
   - Firebase Console API key
   - Cloud Build substitution variable
   - Cloud Run environment variable
   - Local `.env.local`
   - All should match exactly

---

## 7. Quick Test Commands

### Test Debug Endpoint Locally
```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/debug/firebase
```

### Test Debug Endpoint in Cloud Run
```bash
curl https://your-cloud-run-url/api/debug/firebase
```

### Check Environment Variables in Cloud Run
```bash
gcloud run services describe startege \
  --project=startege \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

---

## 8. Enhanced Logging

The Firebase initialization now includes enhanced logging:

- `[FIREBASE] Initializing Firebase app...` - Start of initialization
- `[FIREBASE] Config: {...}` - Shows config (API key masked)
- `[FIREBASE] Firebase initialized successfully` - Success
- `[FIREBASE] Configuration Error: ...` - Missing config
- `[FIREBASE] API Key Format Error: ...` - Invalid format
- `[FIREBASE] Initialization Error: ...` - Initialization failed

All logs are prefixed with `[FIREBASE]` for easy filtering.

---

## Still Not Working?

1. **Share the debug endpoint response**: `curl https://your-cloud-run-url/api/debug/firebase`
2. **Share Cloud Run logs**: Filter by `[FIREBASE]`
3. **Share browser console errors**: Screenshot of DevTools Console
4. **Share Cloud Build logs**: The build step that shows the API key

This will help identify exactly where the issue is.

