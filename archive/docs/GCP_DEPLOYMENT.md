# Google Cloud Platform Deployment Guide (Console-Based)

This guide covers deploying Startege to Google Cloud Run via GitHub Actions using the Google Cloud Console web interface.

## Prerequisites

1. **Google Cloud Project** with billing enabled
2. **GitHub Repository** with code pushed (✅ Done)
3. **GitHub Secrets** configured (see `GITHUB_SECRETS_SETUP.md`)

## Naming Conventions

All GCP resources use the `startege-` prefix to differentiate from other projects:

- **Service Account**: `startege-github-actions-deploy`
- **Cloud Run Service**: `startege`
- **Cloud SQL Instance**: `startege-db`
- **Database Name**: `startege`
- **Storage Bucket**: `startege-storage` or `startege-{project-id}-storage` (if using Cloud Storage)

**Note**: Vertex AI is used only for Gemini (LLM), not for vector search. Semantic search is not implemented - the app uses cost-effective keyword search instead.

## Step 1: Enable Required APIs

### Via Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/library
2. Search for and enable each of the following APIs:
   - **Cloud Run API** (`run.googleapis.com`)
   - **Cloud Build API** (`cloudbuild.googleapis.com`)
   - **Cloud SQL Admin API** (`sqladmin.googleapis.com`) - if using Cloud SQL
   - **Cloud Resource Manager API** (`cloudresourcemanager.googleapis.com`)

**Steps for each API:**
1. Search for the API name in the search bar
2. Click on the API
3. Click **"Enable"** button
4. Wait for confirmation

## Step 2: Create Service Account

### Via Google Cloud Console

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Select your project from the dropdown at the top
3. Click **"+ CREATE SERVICE ACCOUNT"**

**Service Account Details:**
- **Service account name**: `startege-github-actions-deploy`
- **Service account ID**: `startege-github-actions-deploy` (auto-filled)
- **Description**: `Startege service account for GitHub Actions to deploy to Cloud Run`
- Click **"CREATE AND CONTINUE"**

**Grant Roles:**
Add the following roles (click **"+ ADD ANOTHER ROLE"** for each):
- **Cloud Run Admin** (`roles/run.admin`)
- **Service Account User** (`roles/iam.serviceAccountUser`)
- **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)
- **Storage Admin** (`roles/storage.admin`) - if using Cloud Storage

Click **"CONTINUE"**

**Grant Access (Optional):**
- Skip this step (no users need access)
- Click **"DONE"**

## Step 3: Create Service Account Key

### Via Google Cloud Console

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Find the service account you just created: `startege-github-actions-deploy`
3. Click on the service account email
4. Go to the **"KEYS"** tab
5. Click **"ADD KEY"** → **"Create new key"**
6. Select **JSON** format
7. Click **"CREATE"**
8. **Download the JSON file** - this is your `startege-gcp-sa-key.json`
9. **Save this file securely** - you'll need it for GitHub Secrets

⚠️ **Important**: Keep this file secure. Never commit it to GitHub.

## Step 4: Configure Cloud SQL (If Using)

### Via Google Cloud Console

1. Go to: https://console.cloud.google.com/sql/instances
2. If you don't have a Cloud SQL instance:
   - Click **"CREATE INSTANCE"**
   - Select **PostgreSQL**
   - Configure:
     - **Instance ID**: `startege-db`
     - **Password**: Set a strong password (save it!)
     - **Region**: `us-central1` (or your preferred region)
     - **Database version**: PostgreSQL 15 (or PostgreSQL 17 if available)
     - **Edition**: Select **Enterprise** (Standard edition may not be available - Enterprise with Development preset is cost-effective)
     - **Edition preset**: Select **Development** (most cost-effective option)
     - **Machine type**: Choose **db-custom-1-3840** (1 vCPU, 3.75 GB RAM) or customize as needed
     - **Storage**: Set to **20-50 GB** (recommended, not 10 GB)
     - **Network**: Select **Private IP** (more secure than Public IP)
     - **Availability**: Single zone (can upgrade to High Availability later)
     - **Backups**: Enable **Automated backups**
     - **Point-in-time recovery**: Enable (recommended)
   - Click **"CREATE"**
   - Wait for instance to be created (5-10 minutes)

3. **Configure Private IP (Recommended for Security):**
   - Check the **"Private IP"** checkbox
   - **Choose a private connection method**: Select **"Private Service Access (PSA)"**
     - This is the recommended option for connecting Cloud Run to Cloud SQL
     - Works with single VPC networks (which is what you need)
   - **VPC Network**: Select **"default"** (or your project's default VPC)
   - **Allocated IP range**: Select **"Automatic"** (Google will allocate the IP range automatically)
   - Click **"Confirm network setup"** button
     - This will:
       - Enable the Service Networking API (if not already enabled)
       - Allocate an IP range in your VPC network
       - Typically takes 1-2 minutes
   - Wait for the setup to complete

   **Note**: If you see "Service Networking API" as "Not enabled", clicking "Confirm network setup" will enable it automatically.

4. **Get Connection Name:**
   - After instance is created, click on your instance
   - In the **"Overview"** tab, find **"Connection name"**
   - Copy this value (format: `PROJECT_ID:REGION:INSTANCE_NAME`)
   - You'll need this for Cloud Run configuration

5. **Create Database:**
   - Go to **"DATABASES"** tab
   - Click **"CREATE DATABASE"**
   - **Database name**: `startege`
   - Click **"CREATE"**

## Step 5: Set Up Secrets

**Recommended Approach**: Use **GCP Secrets Manager** for runtime secrets (better security, secret rotation, audit logging).

See: [GCP Secrets Manager Setup Guide](./GCP_SECRETS_MANAGER_SETUP.md)

### Option A: GCP Secrets Manager (Recommended for Production)

1. **Enable Secrets Manager API**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search for: **"Secret Manager API"**
   - Click **"Enable"**

2. **Create Secrets**:
   - Go to: https://console.cloud.google.com/security/secret-manager
   - Click **"CREATE SECRET"**
   - Create secrets with `startege-` prefix:
     - `startege-database-url`
     - `startege-firebase-service-account`
     - `startege-stripe-secret-key`
     - etc.

3. **Configure Cloud Run to Use Secrets**:
   - Go to Cloud Run → Your service → Edit
   - **Variables & Secrets** tab → **Secrets** section
   - Click **"ADD SECRET VARIABLE"**
   - Map each secret to environment variable

See detailed guide: [GCP Secrets Manager Setup](./GCP_SECRETS_MANAGER_SETUP.md)

### Option B: GitHub Secrets (Alternative - for CI/CD only)

**Note**: GitHub Secrets are better for CI/CD build-time secrets. For runtime secrets, use GCP Secrets Manager.

1. Go to: https://github.com/fasahat78/startege/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret one by one:

#### Required Secrets:

**For CI/CD (GitHub Secrets - Required):**
- **Name**: `GCP_SA_KEY`
- **Value**: Open the downloaded `startege-gcp-sa-key.json` file, copy ALL contents (entire JSON), paste here
- **Purpose**: Used by GitHub Actions to deploy to Cloud Run
- Click **"Add secret"**

**For Runtime (GCP Secrets Manager - Recommended):**
Create these in GCP Secrets Manager (not GitHub Secrets):
- `startege-database-url` → Maps to `DATABASE_URL`
- `startege-firebase-service-account` → Maps to `FIREBASE_SERVICE_ACCOUNT_KEY`
- `startege-stripe-secret-key` → Maps to `STRIPE_SECRET_KEY`
- etc.

See: [GCP Secrets Manager Setup Guide](./GCP_SECRETS_MANAGER_SETUP.md)

**Firebase (Client - NEXT_PUBLIC_*):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Firebase (Admin):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (full JSON string)

**Stripe:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_ANNUAL`
- `STRIPE_PRICE_LIFETIME`
- `STRIPE_PRICE_CREDITS_SMALL`
- `STRIPE_PRICE_CREDITS_STANDARD`
- `STRIPE_PRICE_CREDITS_LARGE`

**OpenAI/ChatGPT:**
- `OPENAI_API_KEY` (or `CHATGPT_API_KEY`)

**Google Cloud Platform:**
- `GCP_PROJECT_ID` (your project ID)
- `GCP_LOCATION` (e.g., `us-central1`)
- `NEXT_PUBLIC_GCP_PROJECT_ID` (same as GCP_PROJECT_ID)
- `NEXT_PUBLIC_GCP_LOCATION` (same as GCP_LOCATION)
- `GCS_BUCKET_NAME` (if using Cloud Storage, recommended: `startege-storage` or `startege-{project-id}-storage`)
- `CLOUD_SCHEDULER_SECRET_KEY` (if using Cloud Scheduler)

**Note**: Vector Search is NOT required. The app uses keyword search (cost-effective, proven quality). Vertex AI is only used for Gemini LLM, not for vector search.

**Application:**
- `NEXT_PUBLIC_APP_URL` (will be set after deployment, e.g., `https://startege-xxxxx-uc.a.run.app`)

**Optional:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

**Not Required (Vector Search):**
- ❌ `VECTOR_SEARCH_INDEX_ID` - Not used (app uses keyword search)
- ❌ `VECTOR_SEARCH_ENDPOINT_ID` - Not used (app uses keyword search)
- ❌ `VECTOR_SEARCH_DEPLOYMENT_ID` - Not used (app uses keyword search)

## Step 6: Deploy to Cloud Run

### Automatic Deployment (Recommended)

Once GitHub Secrets are configured:

1. **Push to main branch** (if not already done)
   - The workflow will automatically trigger
   - Go to: https://github.com/fasahat78/startege/actions
   - Watch the "Deploy to Google Cloud Run" workflow

2. **Monitor deployment:**
   - Click on the running workflow
   - Watch the logs in real-time
   - Wait for completion (5-10 minutes)

### Manual Deployment Trigger

1. Go to: https://github.com/fasahat78/startege/actions
2. Click **"Deploy to Google Cloud Run"** workflow
3. Click **"Run workflow"** dropdown
4. Select branch: `main`
5. Click **"Run workflow"** button

### First Deployment Notes

- First deployment takes longer (5-10 minutes)
- Cloud Run will build the container
- Service will be created automatically
- URL will be generated: `https://startege-xxxxx-uc.a.run.app`

## Step 7: Get Service URL

### Via Google Cloud Console

1. Go to: https://console.cloud.google.com/run
2. Select your project
3. Find the service: `startege`
4. Click on the service name
5. In the **"General"** tab, find **"URL"**
6. Copy this URL
7. Update GitHub Secret `NEXT_PUBLIC_APP_URL` with this URL

## Step 8: Configure Cloud SQL Connection (If Using)

### Via Google Cloud Console

1. Go to: https://console.cloud.google.com/run
2. Click on your `startege` service
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Connections"** tab
5. Under **"Cloud SQL connections"**, click **"ADD CLOUD SQL CONNECTION"**
6. Select your Cloud SQL instance
7. Click **"SAVE"**
8. Click **"DEPLOY"** (or let GitHub Actions handle it)

## Step 9: Test Deployment

### Health Check

1. Get your service URL from Cloud Run console
2. Visit: `https://YOUR_SERVICE_URL/api/health`
3. Should return JSON with status: `"healthy"`

### Application Test

1. Visit: `https://YOUR_SERVICE_URL`
2. Should see the landing page
3. Test sign-up/sign-in flow
4. Verify database connectivity

## Step 10: Configure Custom Domain (Optional)

### Via Google Cloud Console

1. Go to: https://console.cloud.google.com/run
2. Click on your `startege` service
3. Go to **"Custom domains"** tab
4. Click **"ADD MAPPING"**
5. Enter your domain: `startege.com`
6. Click **"CONTINUE"**
7. Follow DNS configuration instructions
8. Update `NEXT_PUBLIC_APP_URL` GitHub Secret with custom domain

## Monitoring and Logs

### View Logs via Console

1. Go to: https://console.cloud.google.com/run
2. Click on your `startege` service
3. Go to **"Logs"** tab
4. View real-time logs

### View Metrics

1. Go to: https://console.cloud.google.com/run
2. Click on your `startege` service
3. Go to **"Metrics"** tab
4. View:
   - Request count
   - Latency
   - Error rate
   - Instance count

## Troubleshooting

### Deployment Fails

1. **Check GitHub Actions logs:**
   - Go to: https://github.com/fasahat78/startege/actions
   - Click on failed workflow
   - Review error messages

2. **Check Cloud Build logs:**
   - Go to: https://console.cloud.google.com/cloud-build/builds
   - Find the failed build
   - Review logs

3. **Common issues:**
   - Missing GitHub Secrets → Add all required secrets
   - API not enabled → Enable required APIs
   - Service account permissions → Verify roles are correct
   - Database connection → Check DATABASE_URL format

### Service Won't Start

1. **Check Cloud Run logs:**
   - Go to Cloud Run → Your service → Logs tab
   - Look for error messages

2. **Check environment variables:**
   - Go to Cloud Run → Your service → Edit → Variables & Secrets
   - Verify all variables are set

3. **Check health endpoint:**
   - Visit `/api/health`
   - Review response for specific errors

### Database Connection Issues

1. **Verify Cloud SQL connection:**
   - Go to Cloud Run → Your service → Connections
   - Ensure Cloud SQL instance is connected

2. **Check DATABASE_URL format:**
   - Should be: `postgresql://USER:PASS@/DB?host=/cloudsql/CONNECTION_NAME`
   - Connection name format: `PROJECT_ID:REGION:INSTANCE_NAME`

## Scaling Configuration

### Via Google Cloud Console

1. Go to: https://console.cloud.google.com/run
2. Click on your `startege` service
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Container"** tab
5. Under **"Capacity"**:
   - **CPU**: 2 (recommended)
   - **Memory**: 2 GiB (recommended)
   - **Timeout**: 300 seconds
   - **Max instances**: 10 (adjust based on traffic)
   - **Min instances**: 0 (scales to zero for cost savings)
6. Click **"DEPLOY"**

## Cost Optimization

### Recommended Settings

- **Min instances**: 0 (scales to zero when no traffic)
- **Max instances**: 10 (adjust based on expected traffic)
- **CPU**: 2 (sufficient for most workloads)
- **Memory**: 2 GiB (sufficient for Next.js app)

### Monitoring Costs

1. Go to: https://console.cloud.google.com/billing
2. Select your billing account
3. View costs by service
4. Set up billing alerts

## Security Best Practices

1. **Service Account**: Use least privilege (only required roles)
2. **Secrets**: Store all secrets in GitHub Secrets, never in code
3. **HTTPS**: Cloud Run uses HTTPS by default
4. **IAM**: Regularly review service account permissions
5. **Updates**: Keep dependencies updated via Dependabot

## Next Steps

1. ✅ Code pushed to GitHub
2. ⏳ Enable required APIs
3. ⏳ Create service account
4. ⏳ Configure GitHub Secrets
5. ⏳ Deploy to Cloud Run
6. ⏳ Configure custom domain (optional)
7. ⏳ Set up monitoring alerts
8. ⏳ Configure Cloud SQL backups

## Support Resources

- **Cloud Run Documentation**: https://cloud.google.com/run/docs
- **GitHub Actions**: https://github.com/fasahat78/startege/actions
- **Cloud Run Console**: https://console.cloud.google.com/run
- **Cloud Build Console**: https://console.cloud.google.com/cloud-build
