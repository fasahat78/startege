# Fix Gemini 429 Error (Quota Exhausted)

Gemini is returning **429 "Resource Exhausted"** errors. This means you've hit the quota/rate limit.

## Quick Solution: OpenAI Fallback

OpenAI is already configured and should automatically be used when Gemini fails. The system will:
1. Try Gemini → Get 429 error
2. Automatically fallback to OpenAI ✅
3. Use mock only if both fail

## Verify OpenAI is Working

### Check Logs
After making a request, look for:
- `[STARTEGIZER_CHAT] Gemini failed (429 quota), trying OpenAI as fallback...`
- `[STARTEGIZER_CHAT] OpenAI response received`
- `[STARTEGIZER_CHAT] Using AI provider: openai`

If you see `[GEMINI_FALLBACK] Falling back to mock response (OpenAI not configured)`, OpenAI secret isn't accessible.

## Fix OpenAI Secret Access

### GCP Console Steps:
1. Go to: https://console.cloud.google.com/run/detail/us-central1/startege
2. Click **"EDIT & DEPLOY NEW REVISION"**
3. Go to **"Variables & Secrets"** tab
4. In **"Secrets exposed as environment variables"**:
   - Verify `OPENAI_API_KEY` is listed
   - If missing, click **"+ Add secret"**:
     - Name: `OPENAI_API_KEY`
     - Secret: Select `OPENAI_API_KEY`
     - Version: `latest`
5. Click **"DEPLOY"**

## Fix Gemini Quota (Optional)

If you want to use Gemini instead of OpenAI:

### Request Quota Increase
1. Go to: https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/quotas
2. Find quota: **"Generate content requests per minute"**
3. Click **"Edit Quotas"**
4. Request increase (e.g., from 60 to 300 requests/minute)
5. Wait for approval (usually 24-48 hours)

### Or Use Different Model
Some models have different quotas:
- `gemini-1.5-flash` - Higher quota
- `gemini-1.5-pro` - Lower quota

Set in Cloud Run:
- Variable: `GEMINI_MODEL`
- Value: `gemini-1.5-flash`

## Current Status

✅ **OpenAI is configured** - Should work automatically
⚠️ **Gemini quota exhausted** - Will fallback to OpenAI
✅ **System handles fallback** - No user action needed

## Verify It's Working

After deployment, test Startegizer:
1. Ask a question
2. Check logs for `Using AI provider: openai`
3. Should get real AI response (not mock)
