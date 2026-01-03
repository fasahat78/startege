# Singapore Region Setup for Gemini

## Current Status
- ✅ Location configured: `asia-southeast1`
- ⚠️ Model availability may be limited

## Check Model Availability

1. **Open Vertex AI Studio:**
   ```
   https://console.cloud.google.com/vertex-ai/generative/language/create/text?project=startege&location=asia-southeast1
   ```

2. **Check Model Dropdown:**
   - Look for available Gemini models
   - Common models: `gemini-pro`, `gemini-1.5-pro`, `gemini-1.5-flash`

3. **If Models Available:**
   - Note the exact model name
   - Update `.env.local`:
     ```env
     GEMINI_MODEL=<exact-model-name-from-studio>
     ```

## If No Models Available in Singapore

Singapore region (`asia-southeast1`) may not support Gemini models yet. Options:

### Option 1: Use US Region (Most Reliable)
```env
GCP_LOCATION=us-central1
GEMINI_MODEL=gemini-pro
```

### Option 2: Use US East
```env
GCP_LOCATION=us-east1
GEMINI_MODEL=gemini-pro
```

### Option 3: Wait for Singapore Support
- Check GCP release notes
- Monitor Vertex AI availability page

## Verify APIs Enabled

Ensure both APIs are enabled:

1. **Vertex AI API:**
   ```
   https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=startege
   ```

2. **Generative AI API:**
   ```
   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=startege
   ```

## Testing

After confirming model availability:

```bash
npx tsx scripts/test-gemini.ts
```

---

**Note:** Latency from Singapore to US regions is typically 150-200ms, which is acceptable for most use cases.

