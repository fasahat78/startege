# Run Cloud Run Diagnostic

## Quick Diagnostic Script

I've created a diagnostic script that checks everything automatically.

### Step 1: Authenticate with gcloud

```bash
gcloud auth login
```

### Step 2: Set the project

```bash
gcloud config set project startege
```

### Step 3: Run the diagnostic

```bash
./scripts/quick-diagnose.sh
```

Or with TypeScript:

```bash
npx tsx scripts/diagnose-cloud-run.ts
```

## What It Checks

1. ✅ Cloud Run service exists and is accessible
2. ✅ Cloud SQL connection is configured
3. ✅ DATABASE_URL secret exists and is referenced
4. ✅ Cloud SQL instance is running
5. ✅ Health endpoint shows database as healthy

## Most Common Issue

If Cloud SQL connection is missing, the script will show you the exact command to fix it:

```bash
gcloud run services update startege \
  --add-cloudsql-instances=startege:us-central1:startege-db \
  --region=us-central1
```

## After Running Diagnostic

The script will tell you exactly what's wrong and how to fix it. Share the output if you need help interpreting it.

