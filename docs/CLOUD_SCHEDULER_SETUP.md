# Cloud Scheduler Setup for Market Scan

**Purpose**: Automate daily Market Scan runs  
**Frequency**: Daily (configurable)  
**Endpoint**: `/api/market-scan/scheduled`

---

## 📋 Prerequisites

1. **GCP Project** with billing enabled
2. **Cloud Scheduler API** enabled
3. **Service Account** with appropriate permissions
4. **Next.js API** deployed and accessible

---

## 🔧 Setup Methods

### Method 1: GCP Console (Recommended for First Time)

#### Step 1: Enable Cloud Scheduler API

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for "Cloud Scheduler API"
4. Click **Enable**

#### Step 2: Create Service Account (Optional but Recommended)

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `market-scan-scheduler`
4. Description: "Service account for Market Scan automation"
5. Click **Create and Continue**
6. Skip role assignment (not needed for HTTP targets)
7. Click **Done**

#### Step 3: Create Cloud Scheduler Job

1. Go to **Cloud Scheduler** in GCP Console
2. Click **Create Job**

**Job Configuration**:
- **Name**: `daily-market-scan`
- **Description**: "Daily automated Market Scan"
- **Region**: `us-central1` (or your app's region)
- **Frequency**: `0 2 * * *` (2 AM daily, UTC)
  - Format: `minute hour day month day-of-week`
  - Examples:
    - `0 2 * * *` - Daily at 2 AM UTC
    - `0 9 * * 1-5` - Weekdays at 9 AM UTC
    - `0 */6 * * *` - Every 6 hours

**Target Configuration**:
- **Target Type**: HTTP
- **URL**: `https://startege.com/api/market-scan/scheduled`
  - **Note**: Domain is configured for Cloud Run production
  - **Testing**: Will be done in production environment
- **HTTP Method**: POST
- **Headers** (REQUIRED for security):
  - Click **Add Header**
  - **Header name**: `x-scheduler-key`
  - **Header value**: `your-secret-key-here` (same value as in your `.env` file)
  
  **⚠️ Important**: The secret key must match exactly in both places:
  1. Your `.env` file: `CLOUD_SCHEDULER_SECRET_KEY=your-secret-key-here`
  2. Cloud Scheduler job header: `x-scheduler-key: your-secret-key-here`
  
- **Auth Header** (optional - only if using OIDC):
  - If using service account, select **Add OIDC token**
  - Service account: `market-scan-scheduler@your-project.iam.gserviceaccount.com`
  - Audience: `https://startege.com` (or your current deployment URL)

**Advanced Options**:
- **Retry Configuration**:
  - Retry count: `3`
  - Retry window: `3600s` (1 hour)
- **Timeout**: `540s` (9 minutes - scan can take time)

4. Click **Create**

---

### Method 2: gcloud CLI (Faster for Updates)

#### Step 1: Set Environment Variables

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export APP_URL="https://your-domain.com"
export SCHEDULER_KEY="your-secret-key"  # Optional but recommended
```

#### Step 2: Create the Job

```bash
gcloud scheduler jobs create http daily-market-scan \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="0 2 * * *" \
  --uri="$APP_URL/api/market-scan/scheduled" \
  --http-method=POST \
  --headers="x-scheduler-key=$SCHEDULER_KEY" \
  --time-zone="UTC" \
  --attempt-deadline=540s \
  --max-retry-attempts=3 \
  --max-retry-duration=3600s
```

#### Step 3: Test the Job

```bash
# Test immediately
gcloud scheduler jobs run daily-market-scan \
  --project=$PROJECT_ID \
  --location=$REGION
```

---

## 🔐 Security Setup

### Option 1: Secret Key (Simplest)

1. Generate a secure random key:
   ```bash
   openssl rand -hex 32
   ```

2. Add to your `.env`:
   ```
   CLOUD_SCHEDULER_SECRET_KEY=your-generated-key-here
   ```

3. Add the same key to Cloud Scheduler job headers:
   - Header name: `x-scheduler-key`
   - Header value: `your-generated-key-here`

### Option 2: OIDC Token (More Secure)

1. Create service account (see Step 2 above)
2. Grant service account permission to invoke your API
3. In Cloud Scheduler job:
   - Select **Add OIDC token**
   - Service account: `market-scan-scheduler@your-project.iam.gserviceaccount.com`
   - Audience: `https://your-domain.com`

---

## 🧪 Testing

### Test the Endpoint Directly

```bash
# With secret key
curl -X POST https://your-domain.com/api/market-scan/scheduled \
  -H "x-scheduler-key: your-secret-key" \
  -H "Content-Type: application/json"

# Health check
curl https://your-domain.com/api/market-scan/scheduled
```

### Test via Cloud Scheduler

1. Go to Cloud Scheduler in GCP Console
2. Click on your job (`daily-market-scan`)
3. Click **Run Now**
4. Check logs:
   ```bash
   gcloud scheduler jobs describe daily-market-scan \
     --project=$PROJECT_ID \
     --location=$REGION
   ```

---

## 📊 Monitoring

### View Job History

1. Go to **Cloud Scheduler** → Your job
2. Click **History** tab
3. View execution logs and status

### Set Up Alerts

1. Go to **Monitoring** → **Alerting**
2. Create alert policy for:
   - Metric: `cloudscheduler.googleapis.com/job/execution_count`
   - Condition: Failed executions > 0
   - Notification: Email/Slack

### Check Application Logs

```bash
# View logs from your Next.js app
gcloud logging read "resource.type=cloud_run_revision AND textPayload=~'SCHEDULED_SCAN'" \
  --project=$PROJECT_ID \
  --limit=50
```

---

## ⚙️ Configuration

### Schedule Formats

Common cron schedules:
- `0 2 * * *` - Daily at 2 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1-5` - Weekdays at 9 AM UTC
- `0 0 * * 0` - Weekly on Sunday at midnight

### Time Zones

- Default: UTC
- To use a specific timezone:
  ```bash
  gcloud scheduler jobs update http daily-market-scan \
    --time-zone="America/New_York"
  ```

---

## 🔄 Updating the Job

### Update Schedule

```bash
gcloud scheduler jobs update http daily-market-scan \
  --schedule="0 3 * * *" \
  --project=$PROJECT_ID \
  --location=$REGION
```

### Update URL

```bash
gcloud scheduler jobs update http daily-market-scan \
  --uri="https://new-domain.com/api/market-scan/scheduled" \
  --project=$PROJECT_ID \
  --location=$REGION
```

### Pause/Resume

```bash
# Pause
gcloud scheduler jobs pause daily-market-scan \
  --project=$PROJECT_ID \
  --location=$REGION

# Resume
gcloud scheduler jobs resume daily-market-scan \
  --project=$PROJECT_ID \
  --location=$REGION
```

---

## 🐛 Troubleshooting

### Job Not Running

1. **Check job status**:
   ```bash
   gcloud scheduler jobs describe daily-market-scan \
     --project=$PROJECT_ID \
     --location=$REGION
   ```

2. **Check execution history**:
   - Go to Cloud Scheduler → Job → History tab
   - Look for error messages

3. **Verify endpoint is accessible**:
   ```bash
   curl https://your-domain.com/api/market-scan/scheduled
   ```

### Authentication Errors

- Verify `CLOUD_SCHEDULER_SECRET_KEY` matches in both:
  - Environment variable (`.env`)
  - Cloud Scheduler job headers

### Timeout Errors

- Increase `attempt-deadline`:
  ```bash
  gcloud scheduler jobs update http daily-market-scan \
    --attempt-deadline=900s \
    --project=$PROJECT_ID \
    --location=$REGION
  ```

---

## 📝 Environment Variables

### Step 1: Generate Secret Key

Generate a secure random key:
```bash
openssl rand -hex 32
```

This will output something like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### Step 2: Add to `.env` File

Add to your `.env` file:
```bash
# Cloud Scheduler Configuration
CLOUD_SCHEDULER_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Your app URL (for reference)
# Use your Cloud Run URL until startege.com is set up
# Find it in: GCP Console → Cloud Run → Your service → URL
NEXT_PUBLIC_APP_URL=https://your-service-name-xxxxx-uc.a.run.app
```

### Step 3: Use Same Key in Cloud Scheduler

**Copy the exact same key** and paste it in Cloud Scheduler job headers:
- Header name: `x-scheduler-key`
- Header value: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

**⚠️ Important**: The key must be identical in both places!

---

## ✅ Verification Checklist

- [ ] Cloud Scheduler API enabled
- [ ] Service account created (optional)
- [ ] Job created in Cloud Scheduler
- [ ] Secret key set in environment and job headers
- [ ] Endpoint accessible and responding
- [ ] Test run successful
- [ ] Monitoring/alerts configured
- [ ] Schedule verified

---

## 🎯 Next Steps

After setup:
1. Run a test execution
2. Verify scan runs successfully
3. Check logs for any issues
4. Set up monitoring/alerts
5. Document the schedule for your team

---

**Status**: Ready for setup  
**Estimated Setup Time**: 15-30 minutes  
**Maintenance**: Minimal (monitor logs periodically)

