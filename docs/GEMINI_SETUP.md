# Gemini AI Integration Setup Guide

## Overview

This guide explains how to set up Google's Gemini AI via Vertex AI for Startegizer.

---

## Prerequisites

1. **Google Cloud Platform (GCP) Account**
   - Sign up at https://cloud.google.com
   - Create a new project or use an existing one

2. **Enable Required APIs**
   - Vertex AI API
   - (Optional for Phase 7) Vertex AI Vector Search API

---

## Step 1: Create GCP Project

1. Go to [GCP Console](https://console.cloud.google.com)
2. Click "Create Project" or select an existing project
3. Note your **Project ID** (e.g., `my-startege-project`)

---

## Step 2: Enable Vertex AI API

1. In GCP Console, go to **APIs & Services** > **Library**
2. Search for "Vertex AI API"
3. Click **Enable**
4. Wait for the API to be enabled (may take a few minutes)

---

## Step 3: Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Fill in:
   - **Name**: `startegizer-gemini`
   - **Description**: `Service account for Startegizer Gemini AI integration`
4. Click **Create and Continue**
5. Grant role: **Vertex AI User**
6. Click **Continue** > **Done**

---

## Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON**
5. Click **Create**
6. The JSON file will download automatically
7. **Important**: Keep this file secure! Never commit it to version control.

---

## Step 5: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Vertex AI Configuration
GCP_PROJECT_ID=your-project-id-here
GCP_LOCATION=us-central1

# Service Account Key (choose one method)
# Option 1: Path to JSON file (recommended for local development)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json

# Option 2: Base64 encoded JSON (for production/Cloud Run)
# GOOGLE_APPLICATION_CREDENTIALS_BASE64=base64-encoded-json-string

# Optional: Custom Gemini model
# GEMINI_MODEL=gemini-1.5-pro
```

### For Local Development:

1. Place the service account JSON file in your project root (or a secure location)
2. Add the path to `.env.local`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   ```

### For Production (Cloud Run):

1. Upload the service account key to Google Cloud Storage
2. Or use Workload Identity (recommended)
3. Or set as environment variable in Cloud Run

---

## Step 6: Verify Installation

1. Make sure the SDK is installed:
   ```bash
   npm list @google-cloud/vertexai
   ```

2. Check your `.env.local` has the required variables:
   ```bash
   cat .env.local | grep GCP
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

---

## Step 7: Test Integration

1. Start your dev server
2. Navigate to `/startegizer`
3. Send a test message
4. Check server logs for:
   - `[GEMINI_NOT_CONFIGURED]` - Configuration missing
   - `[GEMINI_ERROR]` - Error occurred
   - `[GEMINI_FALLBACK]` - Fallback to mock response

If you see `[GEMINI_NOT_CONFIGURED]`, check your environment variables.

---

## Troubleshooting

### Error: "Could not load the default credentials"

**Solution**: 
- Check `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Verify the JSON file exists and is readable
- Ensure the service account has the correct permissions

### Error: "API not enabled"

**Solution**:
- Go to GCP Console > APIs & Services
- Enable "Vertex AI API"
- Wait a few minutes for propagation

### Error: "Permission denied"

**Solution**:
- Ensure service account has "Vertex AI User" role
- Check IAM permissions in GCP Console

### Mock responses still showing

**Solution**:
- Check server logs for `[GEMINI_NOT_CONFIGURED]` or `[GEMINI_ERROR]`
- Verify environment variables are loaded (restart dev server)
- Check `.env.local` is in project root
- Ensure no typos in variable names

---

## Cost Considerations

### Gemini 1.5 Pro Pricing (as of 2024):
- **Input**: ~$1.25 per 1M tokens
- **Output**: ~$5.00 per 1M tokens

### Estimated Costs:
- **Average query**: ~500 input tokens + ~500 output tokens = ~$0.003 per query
- **1000 queries/month**: ~$3/month
- **10,000 queries/month**: ~$30/month

### Cost Optimization:
- Use `gemini-1.5-flash` for simpler queries (cheaper)
- Implement caching for common questions
- Set token limits in generation config
- Monitor usage in GCP Console

---

## Next Steps

Once Gemini is configured:

1. ✅ **Phase 6 Complete**: Gemini AI integration
2. 🎯 **Phase 7**: Add RAG (Retrieval-Augmented Generation)
   - Set up Vector Search
   - Create embeddings
   - Implement knowledge retrieval

---

## Security Best Practices

1. **Never commit** service account keys to Git
2. Add `service-account-key.json` to `.gitignore`
3. Use environment variables for production
4. Rotate keys periodically
5. Use least-privilege IAM roles
6. Monitor API usage in GCP Console

---

## Support

If you encounter issues:

1. Check GCP Console for API status
2. Review server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Test with a simple query first

---

**Status**: Ready for Phase 6 implementation! 🚀

