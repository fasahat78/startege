# GitHub Secrets Setup Guide

This guide helps you set up all required GitHub Secrets for CI/CD and deployment.

## Quick Setup Script

You can use the GitHub CLI to set secrets programmatically, or set them manually via the GitHub web interface.

### Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not installed
# brew install gh (macOS)
# or download from https://cli.github.com/

# Authenticate
gh auth login

# Set secrets (replace values with your actual values)
gh secret set DATABASE_URL --body "postgresql://user:pass@host:5432/startege"
gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body "your-api-key"
# ... continue for all secrets
```

### Manual Setup via Web Interface

1. Go to: https://github.com/fasahat78/startege/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret one by one

## Required Secrets Checklist

### ✅ Database
- [ ] `DATABASE_URL`

### ✅ Firebase Client (NEXT_PUBLIC_*)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### ✅ Firebase Admin
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` (full JSON string)

### ✅ Stripe
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_MONTHLY`
- [ ] `STRIPE_PRICE_ANNUAL`
- [ ] `STRIPE_PRICE_LIFETIME`
- [ ] `STRIPE_PRICE_CREDITS_SMALL`
- [ ] `STRIPE_PRICE_CREDITS_STANDARD`
- [ ] `STRIPE_PRICE_CREDITS_LARGE`

### ✅ OpenAI/ChatGPT
- [ ] `OPENAI_API_KEY` (or `CHATGPT_API_KEY`)

### ✅ Google Cloud Platform
- [ ] `GCP_PROJECT_ID`
- [ ] `GCP_LOCATION`
- [ ] `NEXT_PUBLIC_GCP_PROJECT_ID`
- [ ] `NEXT_PUBLIC_GCP_LOCATION`
- [ ] `GCS_BUCKET_NAME` (recommended: `startege-storage` or `startege-{project-id}-storage`)
- [ ] `VECTOR_SEARCH_INDEX_ID` (recommended: `startege-vector-index`)
- [ ] `VECTOR_SEARCH_ENDPOINT_ID` (recommended: `startege-vector-endpoint`)
- [ ] `VECTOR_SEARCH_DEPLOYMENT_ID` (recommended: `startege-vector-deployment`)
- [ ] `CLOUD_SCHEDULER_SECRET_KEY`
- [ ] `GCP_SA_KEY` (service account JSON for `startege-github-actions-deploy`)

### ✅ Application
- [ ] `NEXT_PUBLIC_APP_URL`

### ⚠️ Optional (but recommended)
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

## Verification

After setting secrets, verify they're accessible:

1. Go to Actions tab
2. Run the CI workflow manually
3. Check that build succeeds

## Notes

- Secrets are encrypted and only visible during workflow execution
- Never commit secrets to the repository
- Update secrets when values change
- Use different secrets for different environments (staging/production)

