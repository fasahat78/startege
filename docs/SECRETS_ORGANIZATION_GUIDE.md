# Secrets Organization Guide

## Understanding NEXT_PUBLIC_* Variables

**Important**: `NEXT_PUBLIC_*` variables are **public** - they're exposed to the browser/client-side.

### Are They Secrets?

**No** - `NEXT_PUBLIC_*` variables are:
- ✅ Exposed in the browser
- ✅ Visible in client-side JavaScript
- ✅ Not sensitive/secret information
- ✅ Safe to be environment variables (not secrets)

**However**: They still need to be configured in Cloud Run.

## Recommended Approach

### Option 1: Regular Environment Variables (Recommended for NEXT_PUBLIC_*)

Since `NEXT_PUBLIC_*` variables are public anyway, use **regular environment variables** in Cloud Run:

1. **Cloud Run Console**:
   - Go to Cloud Run → Your service → Edit
   - **Variables & Secrets** tab
   - **Variables** section (not Secrets)
   - Add each `NEXT_PUBLIC_*` variable directly

2. **No Secrets Manager needed** for `NEXT_PUBLIC_*` variables

**Benefits**:
- ✅ Simpler setup
- ✅ No cost (Secrets Manager charges per secret)
- ✅ Appropriate since they're public anyway
- ✅ Easier to manage

### Option 2: Separate Secrets (If You Prefer Consistency)

If you want everything in Secrets Manager for consistency:

**Create separate secrets for each:**
- `startege-firebase-api-key` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `startege-firebase-auth-domain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `startege-firebase-project-id` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `startege-firebase-storage-bucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `startege-firebase-messaging-sender-id` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `startege-firebase-app-id` → `NEXT_PUBLIC_FIREBASE_APP_ID`

**Cost**: ~$0.36/month (6 secrets × $0.06)

### Option 3: Combined Secret (JSON Format)

Create one secret with all Firebase config:

**Secret Name**: `startege-firebase-config`

**Secret Value** (JSON):
```json
{
  "NEXT_PUBLIC_FIREBASE_API_KEY": "your-api-key",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "your-auth-domain",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "your-project-id",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "your-bucket",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "your-sender-id",
  "NEXT_PUBLIC_FIREBASE_APP_ID": "your-app-id"
}
```

**Then in your app**: Parse JSON and set environment variables

**Cost**: ~$0.06/month (1 secret)

**Downside**: Requires code changes to parse JSON

## Recommended Organization

### Use Secrets Manager For (Actual Secrets):
✅ `startege-database-url` → `DATABASE_URL`  
✅ `startege-firebase-service-account` → `FIREBASE_SERVICE_ACCOUNT_KEY`  
✅ `startege-stripe-secret-key` → `STRIPE_SECRET_KEY` (private key, must be secret)  
✅ `startege-stripe-webhook-secret` → `STRIPE_WEBHOOK_SECRET` (webhook signing secret, must be secret)  
✅ `startege-openai-api-key` → `OPENAI_API_KEY`  
✅ Any other **private** API keys or credentials  

### Use Regular Environment Variables For (Public Variables):
✅ `NEXT_PUBLIC_FIREBASE_API_KEY`  
✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`  
✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  
✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`  
✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`  
✅ `NEXT_PUBLIC_FIREBASE_APP_ID`  
✅ `NEXT_PUBLIC_APP_URL`  
✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (public key, safe to expose)  
✅ `NEXT_PUBLIC_GCP_PROJECT_ID`  
✅ `NEXT_PUBLIC_GCP_LOCATION`  
✅ `NEXT_PUBLIC_GA_MEASUREMENT_ID`  
✅ `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`  
✅ `NEXT_PUBLIC_SENTRY_DSN`  
✅ `STRIPE_PRICE_MONTHLY` (price ID, not secret)  
✅ `STRIPE_PRICE_ANNUAL` (price ID, not secret)  
✅ `STRIPE_PRICE_LIFETIME` (price ID, not secret)  
✅ `STRIPE_PRICE_CREDITS_SMALL` (price ID, not secret)  
✅ `STRIPE_PRICE_CREDITS_STANDARD` (price ID, not secret)  
✅ `STRIPE_PRICE_CREDITS_LARGE` (price ID, not secret)  

## Summary

### Answer: Do You Create Separate Secrets?

**For NEXT_PUBLIC_* variables**: **No, use regular environment variables**

**For actual secrets**: **Yes, create separate secrets in GCP Secrets Manager**

### Quick Decision Tree

```
Is it NEXT_PUBLIC_*?
├─ Yes → Regular Environment Variable (Cloud Run Variables)
└─ No → Is it sensitive/secret?
    ├─ Yes → GCP Secrets Manager (separate secret)
    └─ No → Regular Environment Variable
```

## Cost Comparison

### Option 1: Regular Env Vars for NEXT_PUBLIC_* (Recommended)
- **Cost**: $0/month
- **Setup**: Simple, direct in Cloud Run
- **Best for**: Public variables

### Option 2: Separate Secrets for Each
- **Cost**: ~$0.36/month (6 secrets)
- **Setup**: More complex
- **Best for**: Consistency (but unnecessary)

### Option 3: Combined Secret (JSON)
- **Cost**: ~$0.06/month (1 secret)
- **Setup**: Requires code changes
- **Best for**: Cost savings (but adds complexity)

## Recommendation

**Use regular environment variables for `NEXT_PUBLIC_*` variables** - they're public anyway, so no need for Secrets Manager.

**Use GCP Secrets Manager only for actual secrets** (database passwords, API keys, service account keys).

