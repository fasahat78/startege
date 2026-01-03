# Fix Artifact Registry Permissions for Cloud Run Deployment

## Problem

When deploying to Cloud Run using `gcloud run deploy --source .`, you get this error:

```
ERROR: Permission denied while accessing Artifact Registry. Artifact Registry access is required to deploy from source.
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: Permission 'artifactregistry.repositories.get' denied
```

This happens because the service account needs permission to push Docker images to Artifact Registry.

## Solution: Add Artifact Registry Permissions

### Step 1: Go to Service Accounts

1. Open: https://console.cloud.google.com/iam-admin/serviceaccounts?project=startege
2. Make sure your project (`startege`) is selected in the top dropdown

### Step 2: Edit Service Account Permissions

1. Find the service account: **`startege-github-actions-deploy`**
2. Click on the service account email/name

### Step 3: Add Artifact Registry Role

1. Click the **"PERMISSIONS"** tab (at the top)
2. Click **"GRANT ACCESS"** button
3. In the **"New principals"** field, enter:
   ```
   startege-github-actions-deploy@startege.iam.gserviceaccount.com
   ```
4. Click **"SELECT A ROLE"** dropdown
5. Search for and select: **"Artifact Registry Writer"** (`roles/artifactregistry.writer`)
6. Click **"SAVE"**

### Step 4: Verify Permissions

The service account should now have these roles:
- ✅ **Cloud Run Admin** (`roles/run.admin`)
- ✅ **Service Account User** (`roles/iam.serviceAccountUser`)
- ✅ **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)
- ✅ **Artifact Registry Writer** (`roles/artifactregistry.writer`) ← **NEW**

### Step 5: Enable Artifact Registry API (if not already enabled)

1. Go to: https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=startege
2. If not enabled, click **"ENABLE"**
3. Wait for confirmation (~30 seconds)

### Step 6: Retry Deployment

After adding the permissions, GitHub Actions will automatically retry on the next push, or you can manually trigger it:

1. Go to: https://github.com/fasahat78/startege/actions
2. Click **"Deploy to Google Cloud Run"**
3. Click **"Run workflow"** → Select `main` → Click **"Run workflow"**

## Alternative: Use Pre-built Docker Image

If you prefer not to use Artifact Registry, you can:

1. Build the Docker image locally or in CI
2. Push to Container Registry (legacy) or Artifact Registry manually
3. Deploy using: `gcloud run deploy startege --image gcr.io/startege/startege:latest`

However, using `--source .` with Artifact Registry is the recommended approach for automated deployments.

## Troubleshooting

### Still Getting Permission Errors?

1. **Wait 1-2 minutes** - IAM changes can take a moment to propagate
2. **Check the service account email** - Make sure it matches exactly:
   ```
   startege-github-actions-deploy@startege.iam.gserviceaccount.com
   ```
3. **Verify Artifact Registry API is enabled**:
   - Go to: https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=startege
   - Should show "API enabled"

### Need More Permissions?

If you still get errors, you might need:
- **Artifact Registry Admin** (`roles/artifactregistry.admin`) - Full access (more than needed, but works)
- **Storage Admin** (`roles/storage.admin`) - If using Cloud Storage buckets

## Summary

The service account needs **Artifact Registry Writer** role to push Docker images when deploying from source. This is automatically handled by Cloud Build when you use `gcloud run deploy --source .`.

