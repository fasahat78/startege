# OpenAI Setup Guide for Startegizer

This guide explains how to configure OpenAI as an alternative to Gemini AI for Startegizer.

## Quick Setup

### Option 1: Using OpenAI (Recommended if Gemini is unavailable)

1. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Set Environment Variable**
   
   **For Local Development:**
   ```bash
   # Add to .env.local
   OPENAI_API_KEY=sk-your-api-key-here
   ```

   **For Cloud Run (Production):**
   - Go to Cloud Run → Your Service → Edit & Deploy New Revision
   - Add environment variable:
     - Name: `OPENAI_API_KEY`
     - Value: `sk-your-api-key-here` (or use Secret Manager)
   - Or add to Cloud Build secrets/substitutions

3. **Optional: Choose Model**
   ```bash
   # Default is gpt-4o-mini (cost-effective)
   # Other options: gpt-4o, gpt-4-turbo, gpt-3.5-turbo
   OPENAI_MODEL=gpt-4o-mini
   ```

### Option 2: Fix Gemini Configuration

If you prefer to use Gemini:

1. **Set GCP Project ID**
   ```bash
   GCP_PROJECT_ID=your-project-id
   GCP_LOCATION=us-central1
   ```

2. **Enable Vertex AI API**
   - Go to GCP Console → APIs & Services → Enable APIs
   - Enable "Vertex AI API"

3. **Verify Service Account Permissions**
   - Ensure service account has "Vertex AI User" role

## How It Works

Startegizer will automatically:
1. **Try Gemini first** (if `GCP_PROJECT_ID` is set)
2. **Fallback to OpenAI** (if Gemini fails and `OPENAI_API_KEY` is set)
3. **Use mock response** (if neither is configured)

## Cost Comparison

### OpenAI Pricing (as of 2024)
- **gpt-4o-mini**: ~$0.15/$0.60 per 1M input/output tokens
- **gpt-4o**: ~$2.50/$10 per 1M input/output tokens
- **gpt-4-turbo**: ~$10/$30 per 1M input/output tokens

### Gemini Pricing (as of 2024)
- **gemini-2.0-flash-exp**: ~$0.075/$0.30 per 1M input/output tokens
- **gemini-1.5-pro**: ~$1.25/$5 per 1M input/output tokens

**Recommendation**: Use `gpt-4o-mini` for cost-effective option, similar to Gemini Flash.

## Security Best Practices

### Using Secret Manager (Recommended for Production)

1. **Create Secret**
   ```bash
   echo -n "sk-your-api-key" | gcloud secrets create openai-api-key --data-file=-
   ```

2. **Grant Access**
   ```bash
   gcloud secrets add-iam-policy-binding openai-api-key \
     --member="serviceAccount:YOUR_SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Reference in Cloud Run**
   - Add environment variable:
     - Name: `OPENAI_API_KEY`
     - Value: `projects/PROJECT_ID/secrets/openai-api-key/versions/latest`
     - Check "Reference a secret"

## Testing

After setup, test Startegizer:
1. Ask a question like "define NIST"
2. Check server logs for `[STARTEGIZER_CHAT] Using AI provider: openai`
3. Verify response is generated (not mock)

## Troubleshooting

### OpenAI not working?
- Check `OPENAI_API_KEY` is set correctly
- Verify API key is valid and has credits
- Check server logs for `[OPENAI_ERROR]`

### Still seeing mock responses?
- Check logs for which provider is being used
- Verify environment variables are set in Cloud Run
- Ensure secrets are properly referenced

### Want to force OpenAI?
- Remove `GCP_PROJECT_ID` to disable Gemini
- Set `OPENAI_API_KEY` to use OpenAI only

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (for OpenAI) | Your OpenAI API key |
| `OPENAI_MODEL` | No | Model to use (default: `gpt-4o-mini`) |
| `GCP_PROJECT_ID` | Yes (for Gemini) | GCP project ID for Gemini |
| `GCP_LOCATION` | No | GCP location (default: `us-central1`) |

## Next Steps

1. Set `OPENAI_API_KEY` in your environment
2. Deploy to Cloud Run
3. Test Startegizer
4. Monitor costs in OpenAI dashboard
