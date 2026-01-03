# Where to Store GCP_SA_KEY?

## Short Answer

**No, `GCP_SA_KEY` should stay in GitHub Secrets**, not GCP Secrets Manager.

## Why?

### GitHub Actions Needs It

`GCP_SA_KEY` is used by **GitHub Actions** (CI/CD) to:
- Authenticate to Google Cloud Platform
- Deploy your application to Cloud Run
- Access GCP services during build/deployment

**GitHub Actions runs outside of GCP**, so it needs credentials to authenticate.

### The Chicken-and-Egg Problem

If you put `GCP_SA_KEY` in GCP Secrets Manager:
- ❌ GitHub Actions can't access it (needs credentials first!)
- ❌ You'd need credentials to get credentials (circular dependency)
- ❌ GitHub Actions runs outside GCP, so it can't directly access Secrets Manager

## Current Setup (Recommended)

### GitHub Secrets (CI/CD)
- ✅ `GCP_SA_KEY` - Service account JSON for deployment
- **Purpose**: Allows GitHub Actions to deploy to Cloud Run
- **Access**: GitHub Actions workflows

### GCP Secrets Manager (Runtime)
- ✅ `startege-database-url` → `DATABASE_URL`
- ✅ `startege-firebase-service-account` → `FIREBASE_SERVICE_ACCOUNT_KEY`
- ✅ `startege-stripe-secret-key` → `STRIPE_SECRET_KEY`
- ✅ All other **application runtime secrets**
- **Purpose**: Secrets needed by your application running on Cloud Run
- **Access**: Cloud Run service at runtime

## Alternative: Workload Identity Federation (Advanced)

If you want to avoid storing service account keys in GitHub Secrets, you can use **Workload Identity Federation**:

### How It Works

1. **No service account key needed**
2. GitHub Actions authenticates using OIDC tokens
3. GCP trusts GitHub's identity provider
4. More secure, but more complex setup

### Setup Steps (Advanced)

1. **Enable Workload Identity Federation**:
   - Go to: https://console.cloud.google.com/iam-admin/workload-identity-pools
   - Create workload identity pool
   - Configure GitHub as identity provider

2. **Create Service Account**:
   - Create service account for GitHub Actions
   - Grant necessary roles

3. **Configure GitHub Actions**:
   - Use `google-github-actions/auth@v2` with Workload Identity
   - No service account key needed

### Pros and Cons

**Pros**:
- ✅ No service account keys to manage
- ✅ More secure (no long-lived credentials)
- ✅ Automatic credential rotation

**Cons**:
- ❌ More complex setup
- ❌ Requires additional GCP configuration
- ❌ May not be necessary for most use cases

## Recommendation

**For most users**: Keep `GCP_SA_KEY` in GitHub Secrets.

**Why**:
- ✅ Simple and straightforward
- ✅ Works out of the box
- ✅ Secure (GitHub Secrets are encrypted)
- ✅ Easy to manage
- ✅ Standard practice

**Consider Workload Identity Federation if**:
- You have strict security requirements
- You want to avoid storing keys
- You're comfortable with advanced GCP configuration

## Security Best Practices

Even with GitHub Secrets:

1. ✅ **Rotate regularly**: Update service account keys periodically
2. ✅ **Least privilege**: Service account should only have necessary roles
3. ✅ **Monitor access**: Check GitHub Actions logs for unauthorized access
4. ✅ **Use separate accounts**: Different service accounts for dev/staging/prod
5. ✅ **Never commit**: Keys should never be in git (they're in `.gitignore`)

## Summary

| Secret | Storage | Purpose | Why |
|--------|---------|---------|-----|
| `GCP_SA_KEY` | GitHub Secrets | CI/CD deployment | GitHub Actions needs it to authenticate to GCP |
| `DATABASE_URL` | GCP Secrets Manager | Runtime secret | Application needs it at runtime |
| `STRIPE_SECRET_KEY` | GCP Secrets Manager | Runtime secret | Application needs it at runtime |
| Other app secrets | GCP Secrets Manager | Runtime secrets | Application needs them at runtime |

**Bottom line**: `GCP_SA_KEY` belongs in GitHub Secrets because GitHub Actions needs it to access GCP. Runtime secrets belong in GCP Secrets Manager because your application needs them at runtime.

