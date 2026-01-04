# Cloud Build Migration Setup - Complete Guide

## ✅ What's Been Done

1. ✅ Created `cloudbuild-migrations.yaml` configuration
2. ✅ Created `scripts/run-migrations-cloud-build.sh` script
3. ✅ Fixed region to `us-central1` (matching Cloud SQL)
4. ✅ Committed and pushed files to GitHub

## ⚠️ Required: Grant Cloud Build Permissions

The Cloud Build service account needs `Cloud SQL Client` role to connect to Cloud SQL.

### Option 1: Via Console (Easiest)

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=startege
2. Find service account: `785373873454@cloudbuild.gserviceaccount.com`
3. Click **"Edit"** (pencil icon) next to it
4. Click **"+ ADD ANOTHER ROLE"**
5. Select **"Cloud SQL Client"**
6. Click **"SAVE"**

### Option 2: Via gcloud CLI

```bash
gcloud projects add-iam-policy-binding startege \
  --member="serviceAccount:785373873454@cloudbuild.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

**Note:** You need to run this with an account that has `Project IAM Admin` or `Owner` role.

---

## 🚀 Running Migrations

After granting permissions, run:

```bash
./scripts/run-migrations-cloud-build.sh
```

Or manually:

```bash
gcloud builds submit \
  --config=cloudbuild-migrations.yaml \
  --project=startege \
  --region=us-central1 \
  --substitutions=_CLOUD_SQL_CONNECTION_NAME="startege:us-central1:startege-db",_DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege"
```

---

## 📊 Check Build Status

### Via Console
- https://console.cloud.google.com/cloud-build/builds;region=us-central1?project=startege
- Click on the latest build to see logs

### Via CLI
```bash
# List recent builds
gcloud builds list --project=startege --region=us-central1 --limit=5

# Get specific build logs (if you have permissions)
gcloud builds log BUILD_ID --project=startege --region=us-central1
```

---

## 🔍 Troubleshooting

### Build Fails with "Permission denied" or "Can't reach database"

**Cause:** Cloud Build service account doesn't have Cloud SQL Client role.

**Fix:** Grant the role as described above, then retry.

### Build Fails with "Cloud SQL Proxy error"

**Possible causes:**
1. Cloud SQL instance name is incorrect
2. Cloud SQL instance is not running
3. Network connectivity issues

**Check:**
- Verify Cloud SQL instance: `startege-db` in `us-central1`
- Ensure instance is running: https://console.cloud.google.com/sql/instances?project=startege

### Build Succeeds but Migrations Don't Run

**Check:**
- Verify `prisma/schema.prisma` exists in the repository
- Check that `prisma/migrations/` directory is included
- Review build logs for Prisma errors

---

## ✅ Verify Migrations Applied

After successful build:

1. **Check Cloud SQL Tables:**
   - https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
   - Click on `startege` database → **"Tables"** tab
   - Should see: `User`, `Challenge`, `ConceptCard`, `Badge`, `Domain`, etc.

2. **Test Application:**
   - Visit Cloud Run URL
   - Try signing in
   - Should work without "table does not exist" errors

---

## 📝 Build Configuration Details

The `cloudbuild-migrations.yaml` file:
- Starts Cloud SQL Proxy on port 5432
- Installs npm dependencies
- Generates Prisma client
- Runs `prisma migrate deploy`

**Connection Details:**
- **Cloud SQL Instance:** `startege:us-central1:startege-db`
- **Database:** `startege`
- **User:** `postgres`
- **Connection Method:** Cloud SQL Proxy (via TCP on 127.0.0.1:5432)

---

## 🔄 Re-running Migrations

If you need to run migrations again (e.g., after schema changes):

1. Commit and push your Prisma schema changes
2. Run the script again:
   ```bash
   ./scripts/run-migrations-cloud-build.sh
   ```

The `prisma migrate deploy` command is idempotent - it only applies pending migrations.

