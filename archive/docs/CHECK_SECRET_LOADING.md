# Check if DATABASE_URL Secret is Loaded at Runtime

## The Problem

Even though everything is configured correctly, Prisma reports "empty host" error. This suggests the secret might not be loaded when Prisma initializes.

## Quick Check: View Runtime DATABASE_URL

After the next deployment, check Cloud Run logs:

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on `startege` service → **"Logs"** tab
3. Look for logs starting with `[PRISMA]`
4. You should see:
   ```
   [PRISMA] DATABASE_URL present: {
     length: 89,
     startsWith: "postgresql://postgres:",
     hasCloudSql: true,
     hasEmptyHost: true,
     masked: "postgresql://postgres:***@/startege?.../startege-db"
   }
   ```

If you see `[PRISMA] ❌ DATABASE_URL is not set!`, then the secret isn't being loaded.

## Alternative: Use Debug Endpoint

After deployment, visit:
```
https://startege-785373873454.us-central1.run.app/api/debug/database
```

This will show:
- If DATABASE_URL is present
- The format (masked)
- Prisma parsing errors
- Connection test results

## If Secret Isn't Loaded

### Option 1: Use Explicit Secret Version

Instead of `latest`, use version `1`:

```bash
gcloud run services update startege \
  --update-secrets DATABASE_URL=DATABASE_URL:1 \
  --region=us-central1 \
  --project=startege
```

### Option 2: Verify Secret Exists

```bash
gcloud secrets versions access latest --secret=DATABASE_URL --project=startege
```

Should output your connection string.

### Option 3: Check Secret Permissions

Verify Cloud Run service account can access the secret:
- Service account: `785373873454-compute@developer.gserviceaccount.com`
- Role needed: `Secret Manager Secret Accessor`

## Most Likely Issue

Based on the error pattern, the secret is likely:
1. **Not being loaded** - Check logs for `[PRISMA]` messages
2. **Loaded but empty** - Secret value might be empty or malformed
3. **Loaded but wrong format** - Extra characters or encoding issues

The new logging will help identify which one it is.

