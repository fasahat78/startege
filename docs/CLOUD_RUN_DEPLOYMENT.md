# Cloud Run Deployment Guide

**Purpose**: Deploy Startege to Cloud Run so Cloud Scheduler can call it  
**Status**: Ready for deployment

---

## 🎯 Quick Overview

You need to deploy your Next.js app to Cloud Run before Cloud Scheduler can call it.

**Current Status**:
- ✅ Secret key generated and added to `.env`
- ⏳ Cloud Run deployment needed
- ⏳ Cloud Scheduler setup (after deployment)

---

## 🚀 Deployment Options

### Option 1: Deploy via GCP Console (Easiest)

#### Step 1: Build Docker Image

1. **Create Dockerfile** (if not exists):
   ```dockerfile
   FROM node:20-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   ENV NEXT_TELEMETRY_DISABLED 1
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"
   
   CMD ["node", "server.js"]
   ```

2. **Update next.config.js** for standalone output:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone',
     // ... other config
   }
   ```

#### Step 2: Build and Push to Container Registry

```bash
# Set variables
export PROJECT_ID="your-project-id"
export SERVICE_NAME="startege"
export REGION="us-central1"

# Build image
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Or use Artifact Registry (recommended)
gcloud artifacts repositories create startege-repo \
  --repository-format=docker \
  --location=$REGION

gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/startege-repo/$SERVICE_NAME
```

#### Step 3: Deploy to Cloud Run

**Via Console**:
1. Go to **Cloud Run** in GCP Console
2. Click **Create Service**
3. **Container Image**: Select your image
4. **Service Name**: `startege`
5. **Region**: `us-central1`
6. **Authentication**: Allow unauthenticated invocations (for Cloud Scheduler)
7. **Environment Variables**: Add all your `.env` variables
8. Click **Create**

**Via CLI**:
```bash
gcloud run deploy $SERVICE_NAME \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/startege-repo/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="$(cat .env | grep -v '^#' | xargs | tr ' ' ',')"
```

---

### Option 2: Deploy via Cloud Build (Automated)

Create `cloudbuild.yaml`:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/startege', '.']
  
  # Push the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/startege']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'startege'
      - '--image'
      - 'gcr.io/$PROJECT_ID/startege'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/startege'
```

Then run:
```bash
gcloud builds submit --config cloudbuild.yaml
```

---

### Option 3: Use Vercel/Other Platform

If you're using Vercel or another platform:

1. Deploy your app
2. Get the deployment URL
3. Use that URL in Cloud Scheduler instead of Cloud Run URL

**Note**: Make sure the platform allows scheduled HTTP requests.

---

## 🔐 Environment Variables

When deploying, make sure to set all environment variables:

**Required**:
- `DATABASE_URL`
- `GCP_PROJECT_ID`
- `CLOUD_SCHEDULER_SECRET_KEY` (for Cloud Scheduler)
- Firebase config variables
- Stripe keys
- Gemini API keys
- etc.

**In Cloud Run Console**:
1. Go to your service
2. Click **Edit & Deploy New Revision**
3. Go to **Variables & Secrets** tab
4. Add all environment variables
5. Click **Deploy**

---

## ✅ After Deployment

Once deployed, you'll get a URL like:
```
https://startege-xxxxx-uc.a.run.app
```

**Use this URL** in Cloud Scheduler:
```
https://startege-xxxxx-uc.a.run.app/api/market-scan/scheduled
```

---

## 🧪 Test Deployment

1. **Health Check**:
   ```bash
   curl https://your-service-url-uc.a.run.app/api/market-scan/scheduled
   ```
   Should return: `{"status":"ok",...}`

2. **Test Scan** (with secret key):
   ```bash
   curl -X POST https://your-service-url-uc.a.run.app/api/market-scan/scheduled \
     -H "x-scheduler-key: your-secret-key"
   ```

---

## 📋 Next Steps After Deployment

1. ✅ Get your Cloud Run URL
2. ✅ Set up Cloud Scheduler (use the URL)
3. ✅ Test the scheduled job
4. ✅ Monitor first few executions

---

## 🐛 Common Issues

### "Service not found"
- Verify service is deployed
- Check service name matches

### "Unauthorized"
- Check environment variables are set
- Verify `CLOUD_SCHEDULER_SECRET_KEY` matches

### "Connection timeout"
- Check service is running
- Verify URL is correct
- Check firewall rules

---

**Need Help?** 
- Check GCP Console → Cloud Run → Logs
- Verify environment variables are set
- Test endpoint manually first

