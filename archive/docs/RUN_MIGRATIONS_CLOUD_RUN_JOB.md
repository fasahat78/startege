# Run Migrations via Cloud Run Job

## Why Cloud Run Job?

- ✅ Uses Unix socket connection (already configured)
- ✅ No IP authorization needed
- ✅ Runs in the same environment as your app
- ✅ Can be automated in CI/CD

---

## Option 1: Create Job via Script (Recommended)

Run the automated script:

```bash
./scripts/create-migration-job.sh
```

This will:
1. Create the Cloud Run job (if it doesn't exist)
2. Execute it immediately
3. Wait for completion
4. Show logs

---

## Option 2: Create Job via Console

### Step 1: Create the Job

1. Go to: https://console.cloud.google.com/run/jobs?project=startege
2. Click **"CREATE JOB"**
3. **Job name**: `startege-migrations`
4. **Region**: `us-central1`
5. Click **"NEXT"**

### Step 2: Configure Container

1. **Container image URL**: `node:20-alpine`
2. **Command**: `sh`
3. **Arguments**: `-c`, `npm install -g prisma && prisma migrate deploy`
4. Click **"NEXT"**

### Step 3: Configure Environment

1. Go to **"Variables & Secrets"** tab
2. Click **"+ ADD VARIABLE"**
3. **Name**: `DATABASE_URL`
4. **Value**: `postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db`
5. Click **"NEXT"**

### Step 4: Configure Connections

1. Go to **"Connections"** tab
2. Under **"Cloud SQL connections"**, click **"+ ADD CLOUD SQL CONNECTION"**
3. Select `startege-db`
4. Click **"NEXT"**

### Step 5: Configure Resources

1. **Memory**: `2 Gi`
2. **CPU**: `2`
3. **Timeout**: `600 seconds` (10 minutes)
4. **Max retries**: `1`
5. Click **"CREATE"**

### Step 6: Execute the Job

1. After creation, click **"EXECUTE JOB"**
2. Click **"EXECUTE"**
3. Wait for completion (check logs)

---

## Option 3: Create Job via gcloud CLI

```bash
gcloud run jobs create startege-migrations \
  --project=startege \
  --region=us-central1 \
  --image=node:20-alpine \
  --command=sh,-c \
  --args="npm install -g prisma && prisma migrate deploy" \
  --set-env-vars="DATABASE_URL=postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db" \
  --add-cloudsql-instances=startege:us-central1:startege-db \
  --memory=2Gi \
  --cpu=2 \
  --timeout=600 \
  --max-retries=1 \
  --task-timeout=600
```

Then execute it:

```bash
gcloud run jobs execute startege-migrations \
  --project=startege \
  --region=us-central1 \
  --wait
```

---

## Verify Migrations Applied

After the job completes, verify tables exist:

### Option A: Check via Cloud SQL Console

1. Go to: https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
2. Click on `startege` database
3. Go to **"Tables"** tab
4. You should see tables like `User`, `Challenge`, `ConceptCard`, etc.

### Option B: Check via Cloud Run Logs

```bash
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=startege-migrations" \
  --project=startege \
  --limit=50 \
  --format=json
```

Look for:
- `✅ Migrations completed successfully`
- No errors about missing tables

### Option C: Test Your Application

Once migrations are applied, your app should work without the `table does not exist` error.

---

## Re-running Migrations

If you need to run migrations again (e.g., after schema changes):

```bash
# Execute the existing job
gcloud run jobs execute startege-migrations \
  --project=startege \
  --region=us-central1 \
  --wait
```

Or via console:
1. Go to: https://console.cloud.google.com/run/jobs/startege-migrations?project=startege
2. Click **"EXECUTE JOB"** → **"EXECUTE"**

---

## Troubleshooting

### Job Fails with "Can't reach database server"

- Verify Cloud SQL connection is configured in the job
- Check that `startege-db` is listed under "Cloud SQL connections"
- Verify DATABASE_URL uses Unix socket format (`host=/cloudsql/...`)

### Job Fails with "Permission denied"

- Ensure Cloud Run service account has `Cloud SQL Client` role:
  ```bash
  gcloud projects add-iam-policy-binding startege \
    --member="serviceAccount:785373873454-compute@developer.gserviceaccount.com" \
    --role="roles/cloudsql.client"
  ```

### Job Times Out

- Increase timeout in job configuration
- Check Cloud SQL instance is running and accessible
- Review logs for specific errors

---

## Next Steps

After migrations complete:
1. ✅ Verify tables exist
2. ✅ Test your application
3. ✅ Seed initial data if needed (domains, categories, badges, etc.)


