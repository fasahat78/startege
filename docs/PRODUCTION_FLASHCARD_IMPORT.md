# Production Flashcard Import Guide

## Quick Answer
**The import you just ran was likely for your LOCAL database.** You need to import to PRODUCTION separately.

## How to Import to Production

### Method 1: Via Cloud SQL Proxy (Recommended)

1. **Start Cloud SQL Proxy** (in a separate terminal):
   ```bash
   cloud-sql-proxy startege:us-central1:startege-db --port=5432
   ```

2. **Set Production DATABASE_URL**:
   ```bash
   export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/startege'
   ```
   Replace `YOUR_PASSWORD` with your actual Cloud SQL password.

3. **Run Migration** (if not already done):
   ```bash
   npx prisma db push
   ```

4. **Run Import Script**:
   ```bash
   npm run import-flashcards
   ```

5. **Verify**:
   ```bash
   # Check count
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"AIGPFlashcard\";"
   ```

### Method 2: Via SQL Studio (Manual)

1. **Create the table** using SQL Studio:
   ```sql
   -- Run the migration SQL (from Prisma migration)
   ```

2. **Import data** - You can either:
   - Use the import script with production DATABASE_URL set
   - Or manually insert data via SQL Studio

### Method 3: Via Cloud Build / Cloud Run Job

Create a one-time Cloud Run job that runs the import script:

```yaml
# cloudbuild-import-flashcards.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/flashcard-importer', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/flashcard-importer']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'jobs'
      - 'create'
      - 'import-flashcards'
      - '--image=gcr.io/$PROJECT_ID/flashcard-importer'
      - '--region=us-central1'
      - '--set-env-vars=DATABASE_URL=$_DATABASE_URL'
```

## Verification

After importing to production, verify:

1. **Check count**:
   ```sql
   SELECT COUNT(*) FROM "AIGPFlashcard";
   ```
   Should show 133 flashcards.

2. **Check by domain**:
   ```sql
   SELECT domain, COUNT(*) FROM "AIGPFlashcard" GROUP BY domain;
   ```

3. **Test API**:
   Visit `/api/aigp-exams/flashcards` and check the response.
   It should say `"source": "database"` instead of `"source": "json"`.

## Notes

- The import script is idempotent - it's safe to run multiple times
- It will update existing flashcards if they already exist
- Only ACTIVE flashcards are imported
- The API automatically uses the database if flashcards exist there

