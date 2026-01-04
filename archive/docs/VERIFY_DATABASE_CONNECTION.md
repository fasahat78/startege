# Verify Database Connection Setup

## What I Can See From Your Screenshots

✅ **DATABASE_URL Secret**: Correctly configured in Secret Manager
✅ **Cloud Run Secret Reference**: DATABASE_URL is referenced from secret
✅ **Secret Value Format**: Looks correct

## Potential Issues to Check

### Issue 1: Cloud Run Cloud SQL Connection Permission

Even though DATABASE_URL is set, Cloud Run needs permission to connect to Cloud SQL.

**Check this:**

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your `startege` service
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Connections"** tab (or look for "Cloud SQL connections" section)
5. Under **"Cloud SQL connections"**, check if `startege-db` is listed
6. If NOT listed:
   - Click **"+ ADD CLOUD SQL CONNECTION"**
   - Select: `startege-db`
   - Click **"SELECT"**
   - Click **"DEPLOY"**

**This is CRITICAL** - Cloud Run needs explicit permission to connect to Cloud SQL, even if DATABASE_URL is set correctly.

---

### Issue 2: Cloud SQL Instance Status

Verify the Cloud SQL instance is running:

1. Go to: https://console.cloud.google.com/sql/instances?project=startege
2. Find instance: `startege-db`
3. Check **Status** column - should be **"Running"** (green)
4. If it's stopped, click on it → **"START"**

---

### Issue 3: Connection Name Format

Verify the connection name matches exactly:

**Expected**: `startege:us-central1:startege-db`

**Check**:
1. Go to: https://console.cloud.google.com/sql/instances/startege-db/overview?project=startege
2. Look for **"Connection name"** - should be exactly: `startege:us-central1:startege-db`
3. Compare with your DATABASE_URL: `host=/cloudsql/startege:us-central1:startege-db`

---

### Issue 4: Secret Access Permissions

Verify Cloud Run service account can access the secret:

1. Go to: https://console.cloud.google.com/security/secret-manager/secret/DATABASE_URL/permissions?project=startege
2. Check if this service account has access:
   - `785373873454-compute@developer.gserviceaccount.com`
   - Should have role: **Secret Manager Secret Accessor**

If not:
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=startege
2. Find: `785373873454-compute@developer.gserviceaccount.com`
3. Click **pencil icon** (Edit)
4. Click **"+ ADD ANOTHER ROLE"**
5. Select: **Secret Manager Secret Accessor**
6. Click **"SAVE"**

---

## Quick Diagnostic: Test Health Endpoint

After checking the above, test:

```bash
curl https://startege-785373873454.us-central1.run.app/api/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    }
  }
}
```

**If database shows unhealthy**, check the message - it will tell you what's wrong.

---

## Most Likely Issue: Missing Cloud SQL Connection

Based on the error "empty host in database URL", the most common cause is:

**Cloud Run doesn't have Cloud SQL connection configured**

Even though DATABASE_URL is set correctly, Cloud Run needs explicit permission to connect to Cloud SQL via the Unix socket.

**Fix**:
1. Edit Cloud Run service
2. Go to **"Connections"** tab
3. Add Cloud SQL connection: `startege-db`
4. Deploy new revision

---

## Complete Checklist

- [ ] DATABASE_URL secret exists and has correct value
- [ ] DATABASE_URL referenced in Cloud Run secrets
- [ ] Cloud Run has Cloud SQL connection configured (Connections tab)
- [ ] Cloud SQL instance is running
- [ ] Connection name matches: `startege:us-central1:startege-db`
- [ ] Cloud Run service account has Secret Manager access
- [ ] Health endpoint shows database as healthy

---

## If Still Not Working

1. **Check Cloud Run logs**:
   - Go to Cloud Run → Your service → **"Logs"** tab
   - Filter by: `DATABASE_URL` or `database`
   - Look for connection errors

2. **Check Secret value**:
   - Verify the secret value doesn't have extra spaces or quotes
   - Copy it exactly as shown in Secret Manager

3. **Try direct environment variable** (temporary test):
   - Instead of secret reference, add DATABASE_URL as direct env var
   - This will help isolate if it's a secret access issue
   - **Remove it after testing** (for security)

