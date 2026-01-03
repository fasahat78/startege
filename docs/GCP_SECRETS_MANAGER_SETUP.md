# GCP Secrets Manager Setup Guide

## Why GCP Secrets Manager?

**You're absolutely right!** For production deployments on GCP, **GCP Secrets Manager** is the recommended approach:

✅ **Better Security**: Secrets stored securely in GCP  
✅ **Runtime Access**: Cloud Run can access secrets at runtime  
✅ **Secret Rotation**: Can rotate secrets without redeploying  
✅ **Audit Logging**: Track who accessed what secrets  
✅ **IAM Integration**: Fine-grained access control  
✅ **Best Practice**: Industry standard for GCP deployments  

## Two Approaches: When to Use Each

### GitHub Secrets (CI/CD Only)
- **Use for**: Build-time secrets needed during CI/CD
- **Examples**: GCP service account key for deployment
- **When**: Secrets needed by GitHub Actions to deploy

### GCP Secrets Manager (Runtime - Recommended)
- **Use for**: Application runtime secrets
- **Examples**: Database passwords, API keys, Firebase configs
- **When**: Secrets needed by your application running on Cloud Run

## Recommended Setup: Hybrid Approach

**Best Practice**: Use both!

1. **GitHub Secrets**: For CI/CD deployment credentials
   - `GCP_SA_KEY` (service account for deployment)

2. **GCP Secrets Manager**: For application runtime secrets
   - `DATABASE_URL`
   - `FIREBASE_SERVICE_ACCOUNT_KEY`
   - `STRIPE_SECRET_KEY`
   - All other application secrets

## Step-by-Step: Setting Up GCP Secrets Manager

### Step 1: Enable Secrets Manager API

1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Secret Manager API"**
3. Click **"Enable"**

### Step 2: Create Secrets

For each secret, create it in GCP Secrets Manager:

#### Example: Create DATABASE_URL Secret

1. Go to: https://console.cloud.google.com/security/secret-manager
2. Click **"CREATE SECRET"**
3. **Name**: `DATABASE_URL` (or `startege-database-url`)
4. **Secret value**: Paste your DATABASE_URL
   ```
   postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
   ```
5. Click **"CREATE SECRET"**

#### Repeat for All Secrets

Create secrets for:
- `DATABASE_URL`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (full JSON)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- All other application secrets

**Naming Convention**: Use `startege-` prefix for consistency:
- `startege-database-url`
- `startege-firebase-service-account`
- `startege-stripe-secret-key`
- etc.

### Step 3: Grant Cloud Run Access

1. Go to: https://console.cloud.google.com/run
2. Click on your service: `startege`
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. Under **"Secrets"**, click **"ADD SECRET VARIABLE"**
6. For each secret:
   - **Name**: Environment variable name (e.g., `DATABASE_URL`)
   - **Secret**: Select from dropdown (e.g., `startege-database-url`)
   - **Version**: `latest` (or specific version)
7. Click **"DEPLOY"**

### Step 4: Update GitHub Actions Workflow

Update `.github/workflows/deploy-gcp.yml` to use GCP Secrets Manager instead of GitHub Secrets for runtime secrets.

## Cloud Run Secret Configuration

### Via Console (Recommended)

1. Go to Cloud Run → Your service → Edit
2. **Variables & Secrets** tab
3. **Secrets** section → **ADD SECRET VARIABLE**
4. Map each secret:
   - **Name**: `DATABASE_URL`
   - **Secret**: `startege-database-url`
   - **Version**: `latest`

### Via gcloud CLI

```bash
gcloud run services update startege \
  --update-secrets DATABASE_URL=startege-database-url:latest \
  --update-secrets FIREBASE_SERVICE_ACCOUNT_KEY=startege-firebase-service-account:latest \
  --region us-central1
```

### Via GitHub Actions (Automated)

Update the workflow to reference GCP secrets instead of GitHub secrets for runtime variables.

## Benefits of GCP Secrets Manager

### 1. Security
- ✅ Secrets encrypted at rest
- ✅ Access controlled via IAM
- ✅ Audit logging of all access

### 2. Secret Rotation
- ✅ Rotate secrets without code changes
- ✅ Update secret version, Cloud Run picks up new version
- ✅ No redeployment needed for secret updates

### 3. Access Control
- ✅ Fine-grained IAM permissions
- ✅ Service accounts can access only needed secrets
- ✅ Principle of least privilege

### 4. Audit & Compliance
- ✅ Track who accessed secrets
- ✅ When secrets were accessed
- ✅ Compliance-ready logging

## Migration from GitHub Secrets

If you've already set up GitHub Secrets, you can migrate:

1. **Create secrets in GCP Secrets Manager** (as shown above)
2. **Update Cloud Run** to use GCP secrets
3. **Keep GitHub Secrets** only for CI/CD (like `GCP_SA_KEY`)
4. **Remove runtime secrets** from GitHub Secrets (optional, but recommended)

## Recommended Secret Structure

### GCP Secrets Manager (Runtime)
```
startege-database-url
startege-firebase-service-account
startege-stripe-secret-key
startege-stripe-webhook-secret
startege-openai-api-key
startege-firebase-api-key (NEXT_PUBLIC_*)
startege-firebase-auth-domain (NEXT_PUBLIC_*)
... (all application secrets)
```

### GitHub Secrets (CI/CD Only)
```
GCP_SA_KEY (for deployment)
```

## Cost

**GCP Secrets Manager Pricing:**
- **Storage**: $0.06 per secret per month
- **Access**: $0.03 per 10,000 operations
- **Very affordable**: ~$1-2/month for typical usage

## Next Steps

1. ✅ Enable Secrets Manager API
2. ✅ Create secrets in GCP Secrets Manager
3. ✅ Update Cloud Run to use GCP secrets
4. ✅ Update GitHub Actions workflow (optional - can still use GitHub Secrets for build)
5. ✅ Test deployment

## Summary

**You're right** - GCP Secrets Manager is the better approach for production! 

- **Use GCP Secrets Manager** for runtime application secrets
- **Use GitHub Secrets** only for CI/CD deployment credentials
- **Best Practice**: Hybrid approach gives you the best of both worlds

