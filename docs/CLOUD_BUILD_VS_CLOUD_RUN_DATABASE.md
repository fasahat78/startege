# Cloud Build vs Cloud Run Database Connection

## Important Difference

**Cloud Run** and **Cloud Build** use **different connection methods** for Cloud SQL:

### Cloud Run (Runtime)
- ✅ **Unix Sockets** - Available via mounted filesystem
- Format: `postgresql://postgres:password@localhost/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE`
- No Cloud SQL Proxy needed
- Configured via `--add-cloudsql-instances` flag

### Cloud Build (Build Time)
- ❌ **Unix Sockets** - NOT available (no mounted filesystem)
- ✅ **TCP via Cloud SQL Proxy** - Required
- Format: `postgresql://postgres:password@127.0.0.1:5432/dbname`
- Must use Cloud SQL Proxy container step

---

## Current Configuration

### For Cloud Build (Migrations)
- Uses Cloud SQL Proxy container
- DATABASE_URL: `postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege`
- Connection name: `startege:us-central1:startege-db`

### For Cloud Run (Application Runtime)
- Uses Unix sockets
- DATABASE_URL: `postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db`
- Configured via Cloud Run service settings

---

## Troubleshooting Cloud Build Migrations

### Build Fails with "Can't reach database"

**Check:**
1. Cloud Build service account has `Cloud SQL Client` role:
   - Service account: `785373873454@cloudbuild.gserviceaccount.com`
   - Role needed: `roles/cloudsql.client`
   - Verify: https://console.cloud.google.com/iam-admin/iam?project=startege

2. Cloud SQL Proxy is running:
   - Check build logs for Cloud SQL Proxy errors
   - Verify connection name: `startege:us-central1:startege-db`

3. DATABASE_URL uses TCP format:
   - ✅ Correct: `postgresql://...@127.0.0.1:5432/startege`
   - ❌ Wrong: `postgresql://...@localhost/startege?host=/cloudsql/...`

### Build Succeeds but Tables Don't Exist

**Possible causes:**
1. Migrations ran but failed silently
2. Connected to wrong database
3. Prisma migrations directory missing or empty

**Check:**
- Verify `prisma/migrations/` exists in repository
- Check build logs for Prisma errors
- Verify database name in DATABASE_URL matches Cloud SQL database name

---

## Verify Migrations Applied

After successful build:

1. **Check Cloud SQL Console:**
   - https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
   - Click on `startege` database
   - Go to "Tables" tab
   - Should see: `User`, `Challenge`, `ConceptCard`, `Badge`, etc.

2. **Check Build Logs:**
   - Look for: `✅ Migrations completed successfully!`
   - Check for any Prisma errors

3. **Test Application:**
   - Visit Cloud Run URL
   - Try signing in
   - Should work without "table does not exist" errors

---

## Next Steps

If migrations still fail:

1. **Check build logs** in console:
   - https://console.cloud.google.com/cloud-build/builds;region=us-central1?project=startege
   - Click on failed build
   - Review logs for specific errors

2. **Verify Cloud SQL Client permissions:**
   - Ensure `785373873454@cloudbuild.gserviceaccount.com` has the role
   - May take a few minutes to propagate

3. **Try manual migration** via Cloud Run job (alternative method):
   - See: `docs/RUN_MIGRATIONS_CLOUD_RUN_JOB.md`

