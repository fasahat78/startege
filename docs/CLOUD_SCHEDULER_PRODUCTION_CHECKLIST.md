# Cloud Scheduler Production Checklist

**Domain**: `startege.com`  
**Status**: Ready for production setup  
**Testing**: Will be done in production environment

---

## ✅ Pre-Production (Complete)

- [x] Secret key generated (`openssl rand -hex 32`)
- [x] Secret key added to `.env` file
- [x] Domain configured (`startege.com` → Cloud Run)
- [x] Scheduled endpoint created (`/api/market-scan/scheduled`)
- [x] Security verification implemented

---

## 🎯 Production Setup (When Ready)

### Step 1: Verify Environment Variables

Ensure these are set in your production environment (Cloud Run):
- `CLOUD_SCHEDULER_SECRET_KEY` (same value as in `.env`)
- All other required environment variables

---

### Step 2: Create Cloud Scheduler Job

**In GCP Console**:

1. Go to **Cloud Scheduler**
2. Click **Create Job**

**Configuration**:
- **Name**: `daily-market-scan`
- **Description**: "Daily automated Market Scan"
- **Region**: `us-central1` (or your Cloud Run region)
- **Schedule**: `0 2 * * *` (Daily at 2 AM UTC)
- **Timezone**: UTC

**Target**:
- **Target Type**: HTTP
- **URL**: `https://startege.com/api/market-scan/scheduled`
- **HTTP Method**: POST
- **Headers**:
  - Click **Add Header**
  - **Name**: `x-scheduler-key`
  - **Value**: `your-secret-key-from-env` (exact match required)

**Advanced**:
- **Retry Count**: 3
- **Retry Window**: 3600s (1 hour)
- **Timeout**: 540s (9 minutes)

3. Click **Create**

---

### Step 3: Test the Job

1. In Cloud Scheduler, click on `daily-market-scan`
2. Click **Run Now**
3. Wait for execution (check status)
4. Verify in execution logs:
   - Status: Success
   - Response: `{"success": true, ...}`

---

### Step 4: Verify Scan Execution

1. **Check Application Logs**:
   - Look for `[SCHEDULED_SCAN]` log entries
   - Verify scan completed successfully

2. **Check Database**:
   - Verify new articles were added
   - Check `ScanJob` table for recent entries

3. **Check Market Scan UI**:
   - Visit `/market-scan` page
   - Verify new articles appear

---

## 📊 Monitoring

### Cloud Scheduler Monitoring

1. **Execution History**:
   - Go to Cloud Scheduler → Job → History tab
   - Monitor success/failure rates

2. **Set Up Alerts**:
   - Create alert for failed executions
   - Notification: Email/Slack

### Application Monitoring

1. **Logs**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND textPayload=~'SCHEDULED_SCAN'" \
     --project=your-project-id \
     --limit=50
   ```

2. **Metrics**:
   - Monitor scan execution time
   - Track articles added per scan
   - Monitor error rates

---

## 🔧 Troubleshooting

### Job Not Running

- Check job is not paused
- Verify schedule format: `0 2 * * *`
- Check timezone setting

### "Unauthorized" Error

- Verify `CLOUD_SCHEDULER_SECRET_KEY` matches exactly:
  - Production environment variable
  - Cloud Scheduler header value
- No extra spaces or quotes

### "Connection Refused" Error

- Verify `startege.com` is accessible
- Check Cloud Run service is running
- Verify endpoint exists: `/api/market-scan/scheduled`

### Scan Failing

- Check application logs for errors
- Verify database connection
- Check API quotas/limits
- Verify environment variables are set

---

## 📝 Notes

- **Schedule**: Daily at 2 AM UTC (adjust if needed)
- **Secret Key**: Must match exactly in both places
- **Testing**: Done in production environment
- **Monitoring**: Set up alerts for failures

---

## ✅ Post-Setup Verification

After setup, verify:
- [ ] Job created successfully
- [ ] Test run completed successfully
- [ ] Articles are being added to database
- [ ] Monitoring/alerts configured
- [ ] Team notified of schedule

---

**Status**: Ready for production setup  
**Next**: Create Cloud Scheduler job when ready

