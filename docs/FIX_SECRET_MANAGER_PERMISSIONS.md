# Fix: Secret Manager Permission Denied Error

## Error Message

```
Permission denied on secret: projects/785373873454/secrets/DATABASE_URL/versions/latest 
for Revision service account 785373873454-compute@developer.gserviceaccount.com. 
The service account used must be granted the 'Secret Manager Secret Accessor' role 
(roles/secretmanager.secretAccessor) at the secret, project or higher level.
```

## Problem

Cloud Run's default service account doesn't have permission to read secrets from Secrets Manager.

## Solution: Grant Secret Accessor Role

### Method 1: Via IAM Console (Recommended)

1. **Go to IAM & Admin**:
   - Open: https://console.cloud.google.com/iam-admin/iam
   - Make sure your project (`startege`) is selected

2. **Find the Compute Service Account**:
   - Look for: `785373873454-compute@developer.gserviceaccount.com`
   - Or search for: `compute@developer.gserviceaccount.com`
   - This is the default service account used by Cloud Run

3. **Grant Permission**:
   - Click the **pencil icon** (Edit) next to the service account
   - Click **"+ ADD ANOTHER ROLE"**
   - Search for: **Secret Manager Secret Accessor**
   - Select: **Secret Manager Secret Accessor** (`roles/secretmanager.secretAccessor`)
   - Click **"SAVE"**

### Method 2: Via Grant Access Button

1. **Go to IAM & Admin**:
   - Open: https://console.cloud.google.com/iam-admin/iam

2. **Click "GRANT ACCESS"** button

3. **Add Principal**:
   - **New principals**: Enter `785373873454-compute@developer.gserviceaccount.com`
   - Replace `785373873454` with your project number if different

4. **Select Role**:
   - Click **"Select a role"** dropdown
   - Search for: **Secret Manager Secret Accessor**
   - Select: **Secret Manager Secret Accessor**

5. **Save**:
   - Click **"SAVE"**

### Method 3: Via gcloud CLI (If you have CLI access)

```bash
# Replace PROJECT_NUMBER with your project number (785373873454)
PROJECT_NUMBER=785373873454
PROJECT_ID=startege

# Grant Secret Manager Secret Accessor role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Verify Fix

After granting the role:

1. **Wait 1-2 minutes** for permissions to propagate

2. **Try deploying again**:
   - Go to Cloud Run → Your service → Edit
   - Click **"DEPLOY"** again
   - The error should be resolved

3. **Check Logs**:
   - Go to Cloud Run → Your service → Logs
   - Verify no permission errors

## Why This Happens

- Cloud Run uses the default Compute Engine service account by default
- This service account doesn't have Secrets Manager permissions by default
- You must explicitly grant the `Secret Manager Secret Accessor` role

## Alternative: Use Custom Service Account

If you prefer, you can create a custom service account for Cloud Run:

1. **Create Service Account**:
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Create: `startege-cloud-run` service account
   - Grant: `Secret Manager Secret Accessor` role

2. **Use in Cloud Run**:
   - Cloud Run → Your service → Edit
   - **Security** tab → **Service account**
   - Select your custom service account

## Quick Fix Checklist

- [ ] Go to IAM & Admin
- [ ] Find `PROJECT_NUMBER-compute@developer.gserviceaccount.com`
- [ ] Add role: **Secret Manager Secret Accessor**
- [ ] Wait 1-2 minutes
- [ ] Redeploy Cloud Run service
- [ ] Verify no errors

## Your Project Details

- **Project ID**: `startege`
- **Project Number**: `785373873454`
- **Service Account**: `785373873454-compute@developer.gserviceaccount.com`
- **Required Role**: `roles/secretmanager.secretAccessor`

