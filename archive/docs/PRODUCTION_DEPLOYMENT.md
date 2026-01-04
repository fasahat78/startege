# Production Deployment Guide

## 🎯 Pre-Deployment Checklist

### 1. GCP Configuration ✅

- [x] Service account created
- [x] Service account key downloaded
- [ ] Vertex AI API enabled
- [ ] Service account has "Vertex AI User" role

### 2. Environment Variables

**Development (.env.local):**
```env
GCP_PROJECT_ID=startege
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./.secrets/gcp-service-account.json
```

**Production (Cloud Run / Vercel / etc.):**
- Use environment variables, NOT file paths
- Upload service account key to secure storage
- Or use Workload Identity (recommended for GCP)

---

## 🚀 Deployment Options

### Option 1: Google Cloud Run (Recommended)

**Why Cloud Run:**
- Native GCP integration
- Automatic scaling
- Pay-per-use pricing
- Easy service account access

**Steps:**

1. **Build Docker image:**
```bash
docker build -t gcr.io/startege/startege-app .
```

2. **Push to Container Registry:**
```bash
gcloud builds submit --tag gcr.io/startege/startege-app
```

3. **Deploy to Cloud Run:**
```bash
gcloud run deploy startege-app \
  --image gcr.io/startege/startege-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=startege,GCP_LOCATION=us-central1 \
  --service-account startegizer-gemini@startege.iam.gserviceaccount.com
```

**Environment Variables in Cloud Run:**
- Set via Cloud Run console or `--set-env-vars`
- Service account automatically authenticated (no key file needed!)

---

### Option 2: Vercel

**Steps:**

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Set environment variables in Vercel Dashboard:**
   - `GCP_PROJECT_ID=startege`
   - `GCP_LOCATION=us-central1`
   - `GOOGLE_APPLICATION_CREDENTIALS_BASE64=<base64-encoded-json>`

3. **Deploy:**
```bash
vercel --prod
```

**Note:** For Vercel, encode service account JSON as base64:
```bash
cat .secrets/gcp-service-account.json | base64
```

---

### Option 3: Other Platforms

**General Requirements:**
- Set `GCP_PROJECT_ID` and `GCP_LOCATION` as environment variables
- Either:
  - Set `GOOGLE_APPLICATION_CREDENTIALS` to file path (if file system access)
  - Or set `GOOGLE_APPLICATION_CREDENTIALS_BASE64` to base64-encoded JSON
  - Or use Workload Identity (GCP only)

---

## 🔐 Security Best Practices

### ✅ DO:
- Use environment variables for credentials
- Use Workload Identity in GCP (no keys needed)
- Rotate service account keys periodically
- Use least-privilege IAM roles
- Monitor API usage in GCP Console

### ❌ DON'T:
- Commit service account keys to Git
- Store keys in client-side code
- Use admin/service account keys unnecessarily
- Share keys between environments

---

## 📊 Monitoring & Costs

### Enable Monitoring:

1. **GCP Console > APIs & Services > Dashboard**
   - Monitor Vertex AI API usage
   - Set up alerts for quota limits

2. **Set Budget Alerts:**
   - GCP Console > Billing > Budgets & Alerts
   - Set monthly budget limit
   - Configure email alerts

### Cost Estimation:

**Gemini 1.5 Pro:**
- Input: ~$1.25 per 1M tokens
- Output: ~$5.00 per 1M tokens

**Example:**
- 1,000 queries/month (500 tokens each) = ~$3/month
- 10,000 queries/month = ~$30/month

---

## 🧪 Testing Before Production

1. **Test Gemini Integration:**
```bash
tsx scripts/test-gemini.ts
```

2. **Test in Development:**
- Start dev server: `npm run dev`
- Navigate to `/startegizer`
- Send test queries
- Check server logs for errors

3. **Load Testing:**
- Test with multiple concurrent requests
- Monitor response times
- Check error rates

---

## 🚨 Troubleshooting

### Error: "API not enabled"
**Solution:** Enable Vertex AI API in GCP Console

### Error: "Permission denied"
**Solution:** Ensure service account has "Vertex AI User" role

### Error: "Could not load credentials"
**Solution:** 
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Verify file exists and is readable
- Or use Workload Identity in production

### High Costs
**Solution:**
- Implement response caching
- Use `gemini-1.5-flash` for simpler queries
- Set token limits
- Monitor usage in GCP Console

---

## 📝 Post-Deployment

1. **Monitor:**
   - Check Cloud Run logs
   - Monitor API usage
   - Watch for errors

2. **Optimize:**
   - Implement caching
   - Fine-tune prompts
   - Adjust token limits

3. **Scale:**
   - Cloud Run auto-scales
   - Set min/max instances if needed
   - Configure concurrency limits

---

**Ready for production!** 🚀

