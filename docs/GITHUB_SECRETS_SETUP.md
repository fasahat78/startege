# Secrets and Variables Setup Guide

This guide clarifies where each variable should be stored: **GitHub Secrets** (CI/CD), **GCP Secrets Manager** (runtime secrets), or **Cloud Run Variables** (public/non-secret env vars).

## Three Storage Locations

### 1. GitHub Secrets (CI/CD Only)
**Purpose**: Secrets needed by GitHub Actions to deploy  
**Location**: https://github.com/fasahat78/startege/settings/secrets/actions  
**When**: Build-time secrets for CI/CD workflows  
**Cost**: Free

### 2. GCP Secrets Manager (Runtime Secrets)
**Purpose**: Sensitive secrets needed by your application at runtime  
**Location**: https://console.cloud.google.com/security/secret-manager  
**When**: Secrets needed by Cloud Run service  
**Cost**: ~$0.06 per secret per month

### 3. Cloud Run Variables (Public/Non-Secret)
**Purpose**: Public variables or non-sensitive configuration  
**Location**: Cloud Run → Your service → Edit → Variables & Secrets → Variables  
**When**: Public variables (NEXT_PUBLIC_*) or non-sensitive config  
**Cost**: Free

---

## Setup Checklist

### 🔐 GitHub Secrets (CI/CD - Required)

**Only 1 secret needed for deployment:**

- [ ] `GCP_SA_KEY`
  - **What**: Service account JSON key for GitHub Actions to deploy
  - **Where**: GitHub Secrets
  - **How**: Copy entire JSON from `startege-gcp-sa-key.json` file
  - **Purpose**: Allows GitHub Actions to authenticate and deploy to Cloud Run

**Setup:**
1. Go to: https://github.com/fasahat78/startege/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `GCP_SA_KEY`
4. Value: Paste entire JSON (without `[` and `]` brackets)
5. Click **"Add secret"**

---

### 🔒 GCP Secrets Manager (Runtime Secrets - Recommended)

**Create these secrets in GCP Secrets Manager:**

#### Database
- [ ] `startege-database-url` → Maps to `DATABASE_URL`
  - **Value**: `postgresql://postgres:PASSWORD@/startege?host=/cloudsql/startege:us-central1:startege-db`
  - **Why Secret**: Contains database password

#### Firebase Admin
- [ ] `startege-firebase-service-account` → Maps to `FIREBASE_SERVICE_ACCOUNT_KEY`
  - **Value**: Full Firebase service account JSON
  - **Why Secret**: Contains private keys

#### Stripe (Private Keys)
- [ ] `startege-stripe-secret-key` → Maps to `STRIPE_SECRET_KEY`
  - **Value**: Your Stripe secret key (starts with `sk_`)
  - **Why Secret**: Private API key

- [ ] `startege-stripe-webhook-secret` → Maps to `STRIPE_WEBHOOK_SECRET`
  - **Value**: Your Stripe webhook signing secret (starts with `whsec_`)
  - **Why Secret**: Webhook verification secret

#### OpenAI/ChatGPT
- [ ] `startege-openai-api-key` → Maps to `OPENAI_API_KEY` (or `CHATGPT_API_KEY`)
  - **Value**: Your OpenAI API key
  - **Why Secret**: Private API key

#### Other Private Secrets
- [ ] `startege-cloud-scheduler-secret` → Maps to `CLOUD_SCHEDULER_SECRET_KEY` (if using)
- [ ] `startege-upstash-redis-token` → Maps to `UPSTASH_REDIS_REST_TOKEN` (if using)
- [ ] `startege-upstash-redis-url` → Maps to `UPSTASH_REDIS_REST_URL` (if using)

**Setup:**
1. Enable Secrets Manager API: https://console.cloud.google.com/apis/library (search "Secret Manager API")
2. Go to: https://console.cloud.google.com/security/secret-manager
3. Click **"CREATE SECRET"** for each secret above
4. Use `startege-` prefix for naming consistency
5. Configure Cloud Run to use these secrets (see Cloud Run Variables section below)

**Total Secrets**: ~6-9 secrets  
**Cost**: ~$0.36-0.54/month

---

### 🌐 Cloud Run Variables (Public/Non-Secret)

**Add these as regular environment variables in Cloud Run:**

#### Firebase Client (Public - NEXT_PUBLIC_*)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

**Why Regular Variables**: These are public (exposed to browser), not secrets

#### Firebase Admin (Non-Secret Config)
- [ ] `FIREBASE_PROJECT_ID`
  - **Why Regular Variable**: Just a project ID, not sensitive

#### Stripe (Public/Non-Secret)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - **Why Regular Variable**: Public key, designed to be exposed

- [ ] `STRIPE_PRICE_MONTHLY`
- [ ] `STRIPE_PRICE_ANNUAL`
- [ ] `STRIPE_PRICE_LIFETIME`
- [ ] `STRIPE_PRICE_CREDITS_SMALL`
- [ ] `STRIPE_PRICE_CREDITS_STANDARD`
- [ ] `STRIPE_PRICE_CREDITS_LARGE`

**Why Regular Variables**: Price IDs are not secrets (just identifiers)

#### Google Cloud Platform (Public Config)
- [ ] `GCP_PROJECT_ID`
- [ ] `GCP_LOCATION`
- [ ] `NEXT_PUBLIC_GCP_PROJECT_ID`
- [ ] `NEXT_PUBLIC_GCP_LOCATION`
- [ ] `GCS_BUCKET_NAME` (if using Cloud Storage)

**Why Regular Variables**: Project IDs and locations are not secrets

#### Application (Public Config)
- [ ] `NEXT_PUBLIC_APP_URL`
  - **Value**: Your Cloud Run service URL (e.g., `https://startege-xxxxx-uc.a.run.app`)
  - **Why Regular Variable**: Public URL

#### Optional Analytics (Public)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (if using Sentry)
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (if using Google Analytics)
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (if using Plausible)

**Why Regular Variables**: These are public client-side configuration

**Setup:**
1. Go to: https://console.cloud.google.com/run
2. Click on your service: `startege`
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab

**For Regular Variables:**
- Under **"Variables"** section, click **"ADD VARIABLE"**
- Add each variable name and value
- Click **"DEPLOY"**

**For Secrets (from GCP Secrets Manager):**
- Under **"Secrets"** section, click **"ADD SECRET VARIABLE"**
- **Name**: Environment variable name (e.g., `DATABASE_URL`)
- **Secret**: Select from dropdown (e.g., `startege-database-url`)
- **Version**: `latest`
- Click **"DEPLOY"**

**Total Variables**: ~20-25 variables  
**Cost**: $0/month

---

## Quick Reference Table

| Variable | Storage Location | Type | Cost |
|----------|----------------|------|------|
| `GCP_SA_KEY` | GitHub Secrets | CI/CD Secret | Free |
| `DATABASE_URL` | GCP Secrets Manager | Runtime Secret | $0.06/month |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | GCP Secrets Manager | Runtime Secret | $0.06/month |
| `STRIPE_SECRET_KEY` | GCP Secrets Manager | Runtime Secret | $0.06/month |
| `STRIPE_WEBHOOK_SECRET` | GCP Secrets Manager | Runtime Secret | $0.06/month |
| `OPENAI_API_KEY` | GCP Secrets Manager | Runtime Secret | $0.06/month |
| `NEXT_PUBLIC_FIREBASE_*` (6 vars) | Cloud Run Variables | Public | Free |
| `STRIPE_PRICE_*` (7 vars) | Cloud Run Variables | Non-Secret | Free |
| `NEXT_PUBLIC_APP_URL` | Cloud Run Variables | Public | Free |
| Other `NEXT_PUBLIC_*` | Cloud Run Variables | Public | Free |

---

## Decision Tree

```
Is it needed by GitHub Actions to deploy?
├─ Yes → GitHub Secrets ✅
└─ No → Is it sensitive/secret?
    ├─ Yes → GCP Secrets Manager ✅
    └─ No → Cloud Run Variables ✅
```

**More specifically:**

```
Is it GCP_SA_KEY?
├─ Yes → GitHub Secrets ✅
└─ No → Is it a password, API key, or private key?
    ├─ Yes → GCP Secrets Manager ✅
    └─ No → Is it NEXT_PUBLIC_* or a price ID?
        ├─ Yes → Cloud Run Variables ✅
        └─ No → Cloud Run Variables ✅ (non-secret config)
```

---

## Step-by-Step Setup Order

### 1. First: GitHub Secrets (CI/CD)
- Set up `GCP_SA_KEY` in GitHub Secrets
- This allows GitHub Actions to deploy

### 2. Second: GCP Secrets Manager (Runtime Secrets)
- Enable Secrets Manager API
- Create all runtime secrets
- These will be used by Cloud Run

### 3. Third: Cloud Run Configuration
- Deploy your service (can use GitHub Actions or manual)
- Configure Cloud Run Variables (public/non-secret)
- Map GCP Secrets Manager secrets to environment variables

---

## Cost Summary

- **GitHub Secrets**: Free
- **GCP Secrets Manager**: ~$0.36-0.54/month (6-9 secrets × $0.06)
- **Cloud Run Variables**: Free
- **Total**: ~$0.36-0.54/month

---

## Verification

After setup, verify:

1. **GitHub Secrets**: 
   - Go to: https://github.com/fasahat78/startege/settings/secrets/actions
   - Should see: `GCP_SA_KEY`

2. **GCP Secrets Manager**:
   - Go to: https://console.cloud.google.com/security/secret-manager
   - Should see: All `startege-*` secrets

3. **Cloud Run Variables**:
   - Go to: Cloud Run → Your service → Edit → Variables & Secrets
   - **Variables**: Should see all `NEXT_PUBLIC_*` and non-secret vars
   - **Secrets**: Should see mappings from GCP Secrets Manager

---

## Related Documentation

- [GCP Secrets Manager Setup](./GCP_SECRETS_MANAGER_SETUP.md) - Detailed guide for Secrets Manager
- [Secrets Organization Guide](./SECRETS_ORGANIZATION_GUIDE.md) - Understanding what goes where
- [Stripe Secrets Guide](./STRIPE_SECRETS_GUIDE.md) - Stripe-specific breakdown
- [GCP Deployment Guide](./GCP_DEPLOYMENT.md) - Full deployment instructions

---

## Notes

- **Never commit** secrets to git (they're in `.gitignore`)
- **Rotate secrets** regularly for security
- **Use different values** for dev/staging/production
- **Monitor costs** - Secrets Manager charges per secret
- **Update documentation** when adding new secrets
