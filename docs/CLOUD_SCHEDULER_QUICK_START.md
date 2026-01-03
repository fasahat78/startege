# Cloud Scheduler Quick Start Guide

**For**: Setting up automated Market Scan before domain is configured

---

## 🎯 Quick Answers

### Q1: What URL to use?

**Answer**: Use `https://startege.com/api/market-scan/scheduled`

**Note**: Domain is configured for Cloud Run production. Testing will be done in production environment.

---

### Q2: Where does the secret key go?

**Answer**: In TWO places (must match exactly):

#### Place 1: Your `.env` file
```bash
CLOUD_SCHEDULER_SECRET_KEY=your-generated-key-here
```

#### Place 2: Cloud Scheduler Job Headers
- Header name: `x-scheduler-key`
- Header value: `your-generated-key-here` (same exact value)

**⚠️ Important**: They must be identical!

---

## 🚀 Step-by-Step Setup

### Step 1: Generate Secret Key

```bash
openssl rand -hex 32
```

Copy the output (e.g., `a1b2c3d4e5f6...`)

---

### Step 2: Add to `.env`

```bash
# Add this line to your .env file
CLOUD_SCHEDULER_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

### Step 3: Create Cloud Scheduler Job

**In GCP Console**:

1. Go to **Cloud Scheduler**
2. Click **Create Job**

**Fill in**:
- **Name**: `daily-market-scan`
- **Region**: `us-central1` (or your region)
- **Schedule**: `0 2 * * *` (daily at 2 AM UTC)
- **Target Type**: HTTP
- **URL**: `https://startege.com/api/market-scan/scheduled`
- **HTTP Method**: POST
- **Headers**: 
  - Click **Add Header**
  - Name: `x-scheduler-key`
  - Value: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6` (your generated key)

3. Click **Create**

---

### Step 5: Test It

1. In Cloud Scheduler, click on your job
2. Click **Run Now**
3. Check the execution logs
4. Verify scan ran in your app logs

---

## ✅ Production Setup

**Domain**: `startege.com` is configured for Cloud Run production  
**Testing**: Will be done in production environment  
**URL**: `https://startege.com/api/market-scan/scheduled`

---

## ✅ Checklist

- [x] Secret key generated
- [x] Secret key added to `.env`
- [x] Domain configured (`startege.com` → Cloud Run)
- [ ] Cloud Scheduler job created (in production)
- [ ] Secret key added to job headers (same value as `.env`)
- [ ] Job tested with "Run Now" (in production)
- [ ] Verified scan executed successfully (in production)

---

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check secret key matches exactly in both `.env` and Cloud Scheduler headers
- No extra spaces or quotes

### "Connection Refused" Error
- Verify Cloud Run URL is correct
- Check service is deployed and running
- Verify `/api/market-scan/scheduled` endpoint exists

### Job Not Running
- Check schedule format: `0 2 * * *`
- Verify timezone: UTC
- Check job is not paused

---

**Need Help?** See full guide: `docs/CLOUD_SCHEDULER_SETUP.md`

