# Market Scan Setup Guide

This guide explains how to set up and run the Market Scan feature in production.

## Overview

Market Scan automatically fetches articles from RSS feeds and news sources related to AI governance, compliance, and regulation. Articles are verified using AI (Gemini) and stored in the database.

## Prerequisites

1. **Database Tables**: Ensure market scan tables are created in production
   - Run the SQL script: `scripts/create-market-scan-tables-cloud-sql.sql` in Cloud SQL Studio
   - Or use Prisma migrations if available

2. **Environment Variables**: Ensure these are set in production:
   - `DATABASE_URL` - Production database connection string
   - `GOOGLE_APPLICATION_CREDENTIALS` or service account key for Vertex AI
   - `GCP_PROJECT_ID` - Google Cloud Project ID
   - `GCP_LOCATION` - GCP region (e.g., `us-central1`)

## Initial Setup: Populate Production Database

### Option 1: Run Script Locally with Cloud SQL Proxy

1. Start Cloud SQL Proxy:
   ```bash
   cloud-sql-proxy startege:us-central1:startege-db --port=5436
   ```

2. Set production database URL:
   ```bash
   export DATABASE_URL="postgresql://startege-db:PASSWORD@localhost:5436/startege?host=/cloudsql/startege:us-central1:startege-db"
   ```

3. Run the scan script:
   ```bash
   npm run market-scan:prod
   ```

### Option 2: Run via Admin Interface

1. Deploy the latest code to production
2. Log in as admin
3. Navigate to `/admin/market-scan`
4. Click "Trigger Scan" button
5. Wait for scan to complete (may take 5-10 minutes)

### Option 3: Run via API Endpoint

```bash
curl -X POST https://your-production-url.com/api/market-scan/run \
  -H "Cookie: your-session-cookie"
```

## Automated Monthly Scans: Cloud Scheduler Setup

Set up Cloud Scheduler to automatically run market scans monthly.

### Step 1: Create Cloud Scheduler Job

```bash
gcloud scheduler jobs create http market-scan-monthly \
  --schedule="0 0 1 * *" \
  --uri="https://startege-785373873454.us-central1.run.app/api/market-scan/run" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --oidc-service-account-email=YOUR_SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com \
  --oidc-token-audience=https://startege-785373873454.us-central1.run.app \
  --time-zone="America/Los_Angeles" \
  --description="Monthly market scan for AI governance articles"
```

### Step 2: Create API Route for Cloud Scheduler

The API route at `/api/market-scan/run` needs to accept Cloud Scheduler requests. Update it to check for Cloud Scheduler authentication:

```typescript
// In app/api/market-scan/run/route.ts
export async function POST(request: NextRequest) {
  // Check if request is from Cloud Scheduler
  const authHeader = request.headers.get('Authorization');
  const isCloudScheduler = authHeader?.startsWith('Bearer ');
  
  if (!isCloudScheduler) {
    // Existing user authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ... rest of user auth logic
  }
  
  // Run scan
  const result = await runDailyScan();
  return NextResponse.json({ success: true, ...result });
}
```

### Step 3: Alternative: Cloud Run Job (Recommended)

Instead of HTTP endpoint, use Cloud Run Jobs for better reliability:

1. **Create a Cloud Run Job**:
   ```bash
   gcloud run jobs create market-scan-job \
     --image=gcr.io/PROJECT_ID/startege \
     --region=us-central1 \
     --command="npm,run,market-scan:prod" \
     --set-env-vars="DATABASE_URL=your-db-url"
   ```

2. **Create Cloud Scheduler to trigger the job**:
   ```bash
   gcloud scheduler jobs create http market-scan-monthly \
     --schedule="0 0 1 * *" \
     --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/PROJECT_ID/jobs/market-scan-job:run" \
     --http-method=POST \
     --oauth-service-account-email=YOUR_SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com \
     --time-zone="America/Los_Angeles"
   ```

## Admin Interface

Admins can manage market scans via the admin dashboard:

1. Navigate to `/admin/market-scan`
2. View scan history and statistics
3. Trigger manual scans
4. Monitor scan status and errors

## Monitoring

### Check Scan Status

- **Via Admin UI**: `/admin/market-scan`
- **Via Database**: Query `ScanJob` table:
  ```sql
  SELECT * FROM "ScanJob" 
  ORDER BY "startedAt" DESC 
  LIMIT 10;
  ```

### Check Article Count

```sql
SELECT COUNT(*) FROM "MarketScanArticle" WHERE "isActive" = true;
```

### View Recent Articles

```sql
SELECT "title", "source", "publishedAt", "relevanceScore" 
FROM "MarketScanArticle" 
WHERE "isActive" = true 
ORDER BY "publishedAt" DESC 
LIMIT 20;
```

## Troubleshooting

### No Articles Showing

1. **Check if tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('MarketScanArticle', 'ScanJob');
   ```

2. **Check if scan has run**:
   ```sql
   SELECT * FROM "ScanJob" ORDER BY "startedAt" DESC LIMIT 1;
   ```

3. **Run a manual scan** via admin interface or script

### Scan Failing

1. **Check Cloud Run logs**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege" --limit 50
   ```

2. **Common issues**:
   - Database connection issues
   - Gemini API quota exceeded (429 errors)
   - RSS feed URLs returning 404
   - Missing environment variables

### Gemini Quota Errors

If you see `429 Too Many Requests` errors:
1. Request quota increase: https://cloud.google.com/vertex-ai/docs/generative-ai/quotas-genai
2. The scan will continue with basic metadata extraction when verification fails

## Schedule Options

- **Monthly**: `0 0 1 * *` (1st of every month at midnight)
- **Weekly**: `0 0 * * 1` (Every Monday at midnight)
- **Daily**: `0 0 * * *` (Every day at midnight)
- **Custom**: Use cron syntax

## Cost Considerations

- **Gemini API**: ~$0.001-0.01 per article verification
- **Database Storage**: Minimal (articles are text)
- **Cloud Scheduler**: Free tier includes 3 free jobs
- **Cloud Run**: Pay per execution (minimal for monthly scans)

## Next Steps

1. ✅ Run initial scan to populate database
2. ✅ Set up Cloud Scheduler for monthly automation
3. ✅ Monitor scan results via admin interface
4. ✅ Adjust RSS sources as needed
5. ✅ Request Gemini quota increase if needed
