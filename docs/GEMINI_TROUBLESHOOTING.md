# Gemini AI Troubleshooting Guide

## Error: "Publisher Model was not found"

### Cause
The Gemini model is not available in your project/region. This can happen if:
1. Generative AI API is not enabled
2. Region doesn't support Gemini models
3. Project needs allowlisting (for newer models)

### Solutions

#### Solution 1: Enable Generative AI API (Most Common)

1. **Enable the API:**
   ```
   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=startege
   ```
   - Click **ENABLE**
   - Wait 1-2 minutes

2. **Test again:**
   ```bash
   npx tsx scripts/test-gemini.ts
   ```

#### Solution 2: Try Different Region

Some regions don't support all Gemini models. Try changing the region:

1. **Update .env.local:**
   ```env
   GCP_LOCATION=us-east1
   ```
   Or try: `europe-west1`, `asia-southeast1`

2. **Test again**

#### Solution 3: Use Different Model Name

Try these model names in order:

1. `gemini-1.0-pro` (most widely available)
2. `gemini-pro` 
3. `gemini-1.5-pro-001` (if allowlisted)

Update `.env.local`:
```env
GEMINI_MODEL=gemini-1.0-pro
```

#### Solution 4: Check Model Availability

1. Go to Vertex AI Studio:
   ```
   https://console.cloud.google.com/vertex-ai/generative/language/create/text?project=startege
   ```

2. Check which models are available in your region
3. Use that model name in your config

---

## Error: "Permission denied"

### Cause
Service account doesn't have the right permissions.

### Solution

1. **Verify IAM role:**
   - Go to: https://console.cloud.google.com/iam-admin/iam?project=startege
   - Find: `startegizer-gemini@startege.iam.gserviceaccount.com`
   - Ensure role: **Vertex AI User**

2. **If missing, add it:**
   - Click "GRANT ACCESS"
   - Add principal: `startegizer-gemini@startege.iam.gserviceaccount.com`
   - Select role: **Vertex AI User**
   - Save

---

## Error: "API not enabled"

### Solution

Enable both APIs:

1. **Vertex AI API:**
   ```
   https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=startege
   ```

2. **Generative AI API:**
   ```
   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=startege
   ```

---

## Quick Diagnostic Commands

```bash
# Check environment variables
cat .env.local | grep GCP

# Test configuration
npx tsx scripts/test-gemini.ts

# Check service account key
node -e "const key = require('./.secrets/gcp-service-account.json'); console.log('Project:', key.project_id);"
```

---

## Still Having Issues?

1. **Check GCP Console Logs:**
   - Go to: https://console.cloud.google.com/logs/query?project=startege
   - Filter by service account email

2. **Verify Service Account Key:**
   - Ensure file exists: `.secrets/gcp-service-account.json`
   - Check permissions: `ls -la .secrets/`

3. **Test with gcloud CLI:**
   ```bash
   gcloud auth activate-service-account --key-file=.secrets/gcp-service-account.json
   gcloud config set project startege
   ```

---

**Most Common Fix:** Enable Generative AI API! 🎯

