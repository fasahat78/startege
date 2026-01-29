# Gemini AI Troubleshooting Guide

If Gemini isn't working even though Vertex AI API is enabled, check these common issues:

## 1. Check Service Account Permissions

Cloud Run needs a service account with proper permissions:

```bash
# Check which service account Cloud Run is using
gcloud run services describe startege --region=us-central1 --format="value(spec.template.spec.serviceAccountName)"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding startege \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@startege.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

## 2. Verify Project ID Format

Vertex AI SDK can accept either:
- **Project Name**: `startege` (recommended)
- **Project Number**: `785373873454` (may work but less reliable)

**Check your current setting:**
```bash
# In Cloud Run, check GCP_PROJECT_ID value
# Should be either "startege" or "785373873454"
```

**Try setting project name instead:**
- Update Cloud Run environment variable:
  - `GCP_PROJECT_ID=startege` (instead of the number)

## 3. Check Model Availability

The default model is `gemini-2.0-flash-exp`. Try a different model:

**Set in Cloud Run environment variable:**
```
GEMINI_MODEL=gemini-1.5-flash
```

**Available models:**
- `gemini-1.5-flash` (most stable)
- `gemini-1.5-pro` (more capable)
- `gemini-2.0-flash-exp` (experimental)

## 4. Check Region Availability

Gemini models may not be available in all regions. Default is `us-central1`.

**Verify region:**
```bash
# Check if models are available in your region
gcloud ai models list --region=us-central1 --project=startege
```

**Set region explicitly:**
```
GCP_LOCATION=us-central1
```

## 5. Check API Quotas

Vertex AI has quotas. Check if you've hit limits:

1. Go to [GCP Console → Vertex AI → Quotas](https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/quotas?project=startege)
2. Check "Generate content requests" quota
3. Request increase if needed

## 6. Check Logs for Specific Errors

After making a request, check Cloud Run logs:

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege" \
  --limit 50 \
  --format json \
  --project=startege
```

**Look for:**
- `[GEMINI_ERROR]` - Shows the actual error
- `[GEMINI] Initializing Vertex AI` - Confirms initialization
- `Permission Denied` - Service account issue
- `Not Found` - Project ID or API issue
- `Unavailable` - Service outage

## 7. Test Authentication

Test if your service account can access Vertex AI:

```bash
# Test Vertex AI access
gcloud ai models list --region=us-central1 --project=startege
```

If this fails, there's an authentication/permission issue.

## 8. Common Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 7 | PERMISSION_DENIED | Grant `roles/aiplatform.user` to service account |
| 5 | NOT_FOUND | Check project ID, enable Vertex AI API |
| 14 | UNAVAILABLE | Service temporarily down, try again later |
| 3 | INVALID_ARGUMENT | Check project ID format, region, model name |
| 8 | RESOURCE_EXHAUSTED | Quota exceeded, request increase |

## 9. Fallback to OpenAI

If Gemini continues to fail, OpenAI is automatically used as fallback (if `OPENAI_API_KEY` is configured).

**To force OpenAI only:**
- Remove `GCP_PROJECT_ID` from Cloud Run
- Keep `OPENAI_API_KEY` configured

## 10. Quick Diagnostic Script

Run this to check your setup:

```bash
# Check environment variables
echo "GCP_PROJECT_ID: $GCP_PROJECT_ID"
echo "GCP_LOCATION: $GCP_LOCATION"

# Check service account
gcloud run services describe startege --region=us-central1 \
  --format="value(spec.template.spec.serviceAccountName)"

# Test Vertex AI access
gcloud ai models list --region=us-central1 --project=startege --limit=5
```

## Still Not Working?

1. **Check Cloud Run logs** for `[GEMINI_ERROR]` messages
2. **Verify service account** has Vertex AI User role
3. **Try OpenAI fallback** - it should work automatically if configured
4. **Contact support** with the error message from logs
