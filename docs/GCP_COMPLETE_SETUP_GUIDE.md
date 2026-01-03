# GCP Complete Setup Guide - Step-by-Step

**One comprehensive guide for everything you need to deploy Startege to Google Cloud Platform.**

This guide walks you through the entire setup process in order, from enabling APIs to deploying your application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Enable Required APIs](#step-1-enable-required-apis)
3. [Step 2: Create Service Account](#step-2-create-service-account)
4. [Step 3: Set Up Cloud SQL Database](#step-3-set-up-cloud-sql-database)
5. [Step 4: Set Up GCP Secrets Manager](#step-4-set-up-gcp-secrets-manager)
6. [Step 5: Configure GitHub Secrets](#step-5-configure-github-secrets)
7. [Step 6: Create Cloud Run Service](#step-6-create-cloud-run-service)
8. [Step 7: Configure Container Settings](#step-7-configure-container-settings)
9. [Step 8: Configure Variables & Secrets](#step-8-configure-variables--secrets)
10. [Step 9: Configure Networking](#step-9-configure-networking)
11. [Step 10: Deploy and Verify](#step-10-deploy-and-verify)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Google Cloud Project created
- ✅ Billing enabled on project
- ✅ Code pushed to GitHub: https://github.com/fasahat78/startege
- ✅ Access to Google Cloud Console
- ✅ Access to GitHub repository settings

**Project Details:**
- **Project ID**: `startege` (or your project ID)
- **Region**: `us-central1` (Iowa) - recommended

---

## Step 1: Enable Required APIs

**Purpose**: Enable Google Cloud services needed for deployment.

### 1.1 Go to API Library

1. Open: https://console.cloud.google.com/apis/library
2. Make sure your project (`startege`) is selected in the top dropdown

### 1.2 Enable Each API

Enable these APIs one by one:

#### Cloud Run API
1. Search: **"Cloud Run API"**
2. Click on **"Cloud Run API"**
3. Click **"Enable"**
4. Wait for confirmation (~30 seconds)

#### Cloud Build API
1. Search: **"Cloud Build API"**
2. Click on **"Cloud Build API"**
3. Click **"Enable"**
4. Wait for confirmation

#### Cloud SQL Admin API
1. Search: **"Cloud SQL Admin API"**
2. Click on **"Cloud SQL Admin API"**
3. Click **"Enable"**
4. Wait for confirmation

#### Secret Manager API
1. Search: **"Secret Manager API"**
2. Click on **"Secret Manager API"**
3. Click **"Enable"**
4. Wait for confirmation

#### Cloud Resource Manager API
1. Search: **"Cloud Resource Manager API"**
2. Click on **"Cloud Resource Manager API"**
3. Click **"Enable"**
4. Wait for confirmation

**Verification**: All APIs should show "API enabled" status.

---

## Step 2: Create Service Account

**Purpose**: Create a service account for GitHub Actions to deploy to Cloud Run.

### 2.1 Go to Service Accounts

1. Open: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Make sure your project is selected

### 2.2 Create Service Account

1. Click **"+ CREATE SERVICE ACCOUNT"**

2. **Service Account Details**:
   - **Service account name**: `startege-github-actions-deploy`
   - **Service account ID**: `startege-github-actions-deploy` (auto-filled)
   - **Description**: `Service account for GitHub Actions to deploy Startege to Cloud Run`
   - Click **"CREATE AND CONTINUE"**

3. **Grant Roles**:
   - Click **"+ ADD ANOTHER ROLE"** for each role:
     - **Cloud Run Admin** (`roles/run.admin`)
     - **Service Account User** (`roles/iam.serviceAccountUser`)
     - **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)
     - **Storage Admin** (`roles/storage.admin`) - if using Cloud Storage
   - Click **"CONTINUE"**

4. **Grant Access** (Optional):
   - Skip this step (no users need access)
   - Click **"DONE"**

### 2.3 Create Service Account Key

1. Find your service account: `startege-github-actions-deploy`
2. Click on the service account email
3. Go to **"KEYS"** tab
4. Click **"ADD KEY"** → **"Create new key"**
5. Select **JSON** format
6. Click **"CREATE"**
7. **Download the JSON file** - save as `startege-gcp-sa-key.json`
8. **Save securely** - you'll need this for GitHub Secrets

⚠️ **Important**: Keep this file secure. Never commit it to GitHub.

---

## Step 3: Set Up Cloud SQL Database

**Purpose**: Create PostgreSQL database for your application.

### 3.1 Go to Cloud SQL

1. Open: https://console.cloud.google.com/sql/instances
2. Make sure your project is selected

### 3.2 Create PostgreSQL Instance

1. Click **"CREATE INSTANCE"**
2. Select **PostgreSQL**

3. **Instance Configuration**:
   - **Instance ID**: `startege-db`
   - **Password**: Set a strong password (e.g., `Zoya@57Bruce`) - **SAVE THIS!**
   - **Region**: `us-central1` (Iowa)
   - **Database version**: PostgreSQL 15 (or PostgreSQL 17 if available)
   - Click **"NEXT"**

4. **Choose Edition**:
   - Select **Enterprise** (Standard may not be available)
   - **Edition preset**: Select **Development** (most cost-effective)
   - Click **"NEXT"**

5. **Configure Instance**:
   - **Machine type**: `db-custom-1-3840` (1 vCPU, 3.75 GB RAM)
   - **Storage**: **20-50 GB** (not 10 GB - you'll need more space)
   - **Storage type**: SSD
   - Click **"NEXT"**

6. **Configure Networking**:
   - **Public IP**: ❌ **Uncheck** (we'll use Private IP)
   - **Private IP**: ✅ **Check**
   - **Choose a private connection method**: Select **"Private Service Access (PSA)"**
   - **VPC Network**: Select **"default"**
   - **Allocated IP range**: Select **"Automatic"**
   - Click **"Confirm network setup"** button
   - Wait 1-2 minutes for setup to complete
   - Click **"NEXT"**

7. **Configure Backups**:
   - ✅ **Enable automated backups**
   - ✅ **Enable point-in-time recovery**
   - Click **"NEXT"**

8. **Review and Create**:
   - Review all settings
   - Click **"CREATE"**
   - Wait 5-10 minutes for instance creation

### 3.3 Create Database

1. Once instance is created, click on `startege-db`
2. Go to **"DATABASES"** tab
3. Click **"CREATE DATABASE"**
4. **Database name**: `startege`
5. Click **"CREATE"**

### 3.4 Get Connection Details

1. Click on your instance: `startege-db`
2. Go to **"Overview"** tab
3. Find **"Connection name"**: `startege:us-central1:startege-db`
4. **Copy this** - you'll need it for DATABASE_URL

### 3.5 Construct DATABASE_URL

**Format**: `postgresql://USERNAME:PASSWORD@/DATABASE_NAME?host=/cloudsql/CONNECTION_NAME`

**Your values**:
- **Username**: `postgres` (default PostgreSQL username)
- **Password**: `Zoya@57Bruce` (your password - URL-encode `@` as `%40`)
- **Database**: `startege`
- **Connection**: `startege:us-central1:startege-db`

**Your DATABASE_URL**:
```
postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
```

**Save this** - you'll need it for Secrets Manager.

---

## Step 4: Set Up GCP Secrets Manager

**Purpose**: Store sensitive secrets securely for your application.

### 4.1 Verify Secret Manager API Enabled

1. Go to: https://console.cloud.google.com/apis/library
2. Search: **"Secret Manager API"**
3. Verify it shows **"API enabled"**
4. If not, enable it (see Step 1)

### 4.2 Go to Secrets Manager

1. Open: https://console.cloud.google.com/security/secret-manager
2. Make sure your project is selected

### 4.3 Create Secrets

Create each secret one by one:

#### Secret 1: Database URL
1. Click **"CREATE SECRET"**
2. **Name**: `startege-database-url`
3. **Secret value**: Paste your DATABASE_URL
   ```
   postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
   ```
4. Click **"CREATE SECRET"**

#### Secret 2: Firebase Service Account
1. Click **"CREATE SECRET"**
2. **Name**: `startege-firebase-service-account`
3. **Secret value**: Paste your Firebase service account JSON (full JSON object, not wrapped in `[]`)
4. Click **"CREATE SECRET"**

#### Secret 3: Stripe Secret Key
1. Click **"CREATE SECRET"**
2. **Name**: `startege-stripe-secret-key`
3. **Secret value**: Your Stripe secret key (starts with `sk_`)
4. Click **"CREATE SECRET"**

#### Secret 4: Stripe Webhook Secret
1. Click **"CREATE SECRET"**
2. **Name**: `startege-stripe-webhook-secret`
3. **Secret value**: Your Stripe webhook signing secret (starts with `whsec_`)
4. Click **"CREATE SECRET"**

#### Secret 5: OpenAI API Key
1. Click **"CREATE SECRET"**
2. **Name**: `startege-openai-api-key`
3. **Secret value**: Your OpenAI API key
4. Click **"CREATE SECRET"**

#### Optional Secrets (if using):
- `startege-cloud-scheduler-secret` → `CLOUD_SCHEDULER_SECRET_KEY`
- `startege-upstash-redis-url` → `UPSTASH_REDIS_REST_URL`
- `startege-upstash-redis-token` → `UPSTASH_REDIS_REST_TOKEN`

**Verification**: You should see all `startege-*` secrets listed.

---

## Step 5: Configure GitHub Secrets

**Purpose**: Configure GitHub Actions to deploy your application.

### 5.1 Go to GitHub Secrets

1. Open: https://github.com/fasahat78/startege/settings/secrets/actions
2. Make sure you have admin access

### 5.2 Add GCP Service Account Key

1. Click **"New repository secret"**
2. **Name**: `GCP_SA_KEY`
3. **Value**: 
   - Open your downloaded `startege-gcp-sa-key.json` file
   - Copy **ALL** contents (entire JSON object)
   - **Remove** any outer `[` and `]` brackets if present
   - Paste here
4. Click **"Add secret"**

**Verification**: You should see `GCP_SA_KEY` in your secrets list.

---

## Step 6: Create Cloud Run Service

**Purpose**: Create the Cloud Run service that will host your application.

### 6.1 Go to Cloud Run

1. Open: https://console.cloud.google.com/run
2. Make sure your project is selected

### 6.2 Create Service

1. Click **"CREATE SERVICE"**

2. **Service Configuration**:
   - **Service name**: `startege`
   - **Region**: `us-central1` (same as your database)
   - **Deploy one revision from a source repository**: ✅ Checked
   - Click **"NEXT"**

3. **Source Repository**:
   - **Repository**: Select your GitHub repository or connect it
   - **Branch**: `main`
   - **Build type**: **Dockerfile** (or **Cloud Build** if using)
   - Click **"NEXT"**

**Note**: If deploying via GitHub Actions (recommended), you can skip source repository setup and configure manually. We'll configure everything in the next steps.

---

## Step 7: Configure Container Settings

**Purpose**: Configure container resources and settings.

### 7.1 Container Configuration

1. In the **"Containers, Networking, Security"** section
2. Click on **"Edit Container"** (or expand if collapsed)

3. **Container Port**:
   - **Port**: `8080`
   - **Note**: Next.js will use `$PORT` environment variable, but set this to `8080` as default

4. **Container Name**:
   - **Name**: `startege-container` (or leave default)

5. **Container Command**: Leave blank (uses Dockerfile CMD)

6. **Container Arguments**: Leave blank

### 7.2 Resource Configuration

1. **Memory**:
   - Select: **2 GiB** (recommended for Next.js)
   - Minimum: 512 MiB (may not be enough)

2. **CPU**:
   - Select: **2** (recommended)
   - Minimum: 1 (may be slow)

3. **GPU**: Leave unchecked (not needed)

4. **Request timeout**: `300` seconds (5 minutes)

5. **Maximum instances**: `10` (adjust based on traffic)

6. **Minimum instances**: `0` (scales to zero for cost savings)

---

## Step 8: Configure Variables & Secrets

**Purpose**: Set environment variables and map secrets for your application.

### 8.1 Go to Variables & Secrets Tab

1. In the container configuration, click **"Variables & Secrets"** tab

### 8.2 Add Regular Environment Variables

Click **"ADD VARIABLE"** for each:

#### Firebase Client (Public Variables)
- **Name**: `NEXT_PUBLIC_FIREBASE_API_KEY`
- **Value**: Your Firebase API key

- **Name**: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- **Value**: Your Firebase auth domain

- **Name**: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- **Value**: Your Firebase project ID

- **Name**: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- **Value**: Your Firebase storage bucket

- **Name**: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: Your Firebase messaging sender ID

- **Name**: `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Value**: Your Firebase app ID

#### Firebase Admin (Non-Secret Config)
- **Name**: `FIREBASE_PROJECT_ID`
- **Value**: Your Firebase project ID

#### Stripe (Public/Non-Secret)
- **Name**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: Your Stripe publishable key (starts with `pk_`)

- **Name**: `STRIPE_PRICE_MONTHLY`
- **Value**: Your Stripe monthly price ID (e.g., `price_1234567890`)

- **Name**: `STRIPE_PRICE_ANNUAL`
- **Value**: Your Stripe annual price ID

- **Name**: `STRIPE_PRICE_LIFETIME`
- **Value**: Your Stripe lifetime price ID

- **Name**: `STRIPE_PRICE_CREDITS_SMALL`
- **Value**: Your Stripe small credits price ID

- **Name**: `STRIPE_PRICE_CREDITS_STANDARD`
- **Value**: Your Stripe standard credits price ID

- **Name**: `STRIPE_PRICE_CREDITS_LARGE`
- **Value**: Your Stripe large credits price ID

#### Google Cloud Platform
- **Name**: `GCP_PROJECT_ID`
- **Value**: `startege` (or your project ID)

- **Name**: `GCP_LOCATION`
- **Value**: `us-central1`

- **Name**: `NEXT_PUBLIC_GCP_PROJECT_ID`
- **Value**: `startege` (or your project ID)

- **Name**: `NEXT_PUBLIC_GCP_LOCATION`
- **Value**: `us-central1`

#### Application
- **Name**: `NEXT_PUBLIC_APP_URL`
- **Value**: Will be set after deployment (e.g., `https://startege-xxxxx-uc.a.run.app`)

- **Name**: `NODE_ENV`
- **Value**: `production`

#### Optional (if using)
- `GCS_BUCKET_NAME` (if using Cloud Storage)
- `NEXT_PUBLIC_SENTRY_DSN` (if using Sentry)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (if using Google Analytics)
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (if using Plausible)

### 8.3 Map Secrets from Secrets Manager

Click **"ADD SECRET VARIABLE"** for each:

1. **Database URL**:
   - **Name**: `DATABASE_URL`
   - **Secret**: Select `startege-database-url`
   - **Version**: `latest`
   - Click **"ADD"**

2. **Firebase Service Account**:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Secret**: Select `startege-firebase-service-account`
   - **Version**: `latest`
   - Click **"ADD"**

3. **Stripe Secret Key**:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Secret**: Select `startege-stripe-secret-key`
   - **Version**: `latest`
   - Click **"ADD"**

4. **Stripe Webhook Secret**:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Secret**: Select `startege-stripe-webhook-secret`
   - **Version**: `latest`
   - Click **"ADD"**

5. **OpenAI API Key**:
   - **Name**: `OPENAI_API_KEY`
   - **Secret**: Select `startege-openai-api-key`
   - **Version**: `latest`
   - Click **"ADD"**

**Verification**: You should see all variables and secrets listed in the configuration.

---

## Step 9: Configure Networking

**Purpose**: Connect Cloud Run to Cloud SQL via private network.

### 9.1 Go to Connections Tab

1. In the service configuration, click **"Networking"** tab

### 9.2 Add Cloud SQL Connection

1. Under **"Cloud SQL connections"**, click **"ADD CLOUD SQL CONNECTION"**
2. Select your Cloud SQL instance: `startege-db`
3. Click **"SAVE"**

**Verification**: You should see `startege-db` listed under Cloud SQL connections.

### 9.3 Configure VPC Connector (if needed)

If you need to connect to other VPC resources:
1. Under **"VPC connector"**, select or create a VPC connector
2. For most setups, this is not needed

---

## Step 10: Deploy and Verify

**Purpose**: Deploy your service and verify everything works.

### 10.1 Review Configuration

Before deploying, review:
- ✅ Container port: `8080`
- ✅ Memory: `2 GiB`
- ✅ CPU: `2`
- ✅ All environment variables added
- ✅ All secrets mapped
- ✅ Cloud SQL connection added

### 10.2 Deploy Service

1. Click **"CREATE"** (or **"DEPLOY"** if editing existing service)
2. Wait 5-10 minutes for deployment
3. You'll see build logs and deployment progress

### 10.3 Get Service URL

1. Once deployed, go to Cloud Run → Your service: `startege`
2. In **"General"** tab, find **"URL"**
3. Copy the URL (e.g., `https://startege-xxxxx-uc.a.run.app`)

### 10.4 Update NEXT_PUBLIC_APP_URL

1. Go back to Cloud Run → Your service → Edit
2. **Variables & Secrets** tab
3. Find `NEXT_PUBLIC_APP_URL`
4. Update value to your service URL
5. Click **"DEPLOY"** to update

### 10.5 Test Deployment

1. **Health Check**:
   - Visit: `https://YOUR_SERVICE_URL/api/health`
   - Should return JSON with `"status": "UP"`

2. **Landing Page**:
   - Visit: `https://YOUR_SERVICE_URL`
   - Should see your landing page

3. **Database Connection**:
   - Try signing up/signing in
   - Should connect to database successfully

### 10.6 Verify Logs

1. Go to Cloud Run → Your service → **"Logs"** tab
2. Check for any errors
3. Verify application is running correctly

---

## Troubleshooting

### Issue: Service Won't Start

**Symptoms**: Service deployed but returns errors

**Solutions**:
1. Check **Logs** tab in Cloud Run
2. Verify all environment variables are set correctly
3. Verify secrets are mapped correctly
4. Check container port matches (should be `8080` or use `$PORT`)

### Issue: Database Connection Failed

**Symptoms**: Can't connect to Cloud SQL

**Solutions**:
1. Verify Cloud SQL connection is added in **Networking** tab
2. Check DATABASE_URL format is correct
3. Verify Cloud SQL instance is running
4. Check private IP is configured correctly

### Issue: Secrets Not Found

**Symptoms**: Application can't access secrets

**Solutions**:
1. Verify secrets exist in Secrets Manager
2. Check secret names match exactly
3. Verify Cloud Run service account has access to secrets
4. Check secret version is set to `latest`

### Issue: Build Fails

**Symptoms**: GitHub Actions deployment fails

**Solutions**:
1. Check GitHub Actions logs
2. Verify `GCP_SA_KEY` is set correctly in GitHub Secrets
3. Verify service account has correct permissions
4. Check Cloud Build API is enabled

### Issue: Environment Variables Not Working

**Symptoms**: `NEXT_PUBLIC_*` variables not accessible

**Solutions**:
1. Verify variables are set in **Variables** section (not Secrets)
2. Check variable names match exactly (case-sensitive)
3. Redeploy service after adding variables
4. Verify `NEXT_PUBLIC_*` prefix is correct

---

## Quick Reference

### Important URLs

- **APIs**: https://console.cloud.google.com/apis/library
- **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts
- **Cloud SQL**: https://console.cloud.google.com/sql/instances
- **Secrets Manager**: https://console.cloud.google.com/security/secret-manager
- **Cloud Run**: https://console.cloud.google.com/run
- **GitHub Secrets**: https://github.com/fasahat78/startege/settings/secrets/actions

### Key Values to Save

- **Service Account Key**: `startege-gcp-sa-key.json` (for GitHub Secrets)
- **Database Password**: `Zoya@57Bruce` (or your password)
- **Connection Name**: `startege:us-central1:startege-db`
- **DATABASE_URL**: `postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db`
- **Service URL**: `https://startege-xxxxx-uc.a.run.app` (after deployment)

### Cost Estimate

- **Cloud SQL**: ~$45-50/month (Enterprise, 1 vCPU, 3.75 GB RAM, 20-50 GB storage)
- **Cloud Run**: Pay per use (scales to zero)
- **Secrets Manager**: ~$0.36-0.54/month (6-9 secrets)
- **Total**: ~$45-50/month + usage

---

## Next Steps

After successful deployment:

1. ✅ Set up custom domain (optional)
2. ✅ Configure monitoring and alerts
3. ✅ Set up Cloud SQL backups
4. ✅ Configure CDN (if needed)
5. ✅ Review security settings
6. ✅ Set up CI/CD (GitHub Actions should already be configured)

---

## Summary Checklist

Use this checklist to track your progress:

- [ ] Step 1: APIs enabled
- [ ] Step 2: Service account created and key downloaded
- [ ] Step 3: Cloud SQL instance created with Private IP
- [ ] Step 3: Database `startege` created
- [ ] Step 4: All secrets created in Secrets Manager
- [ ] Step 5: GitHub Secret `GCP_SA_KEY` configured
- [ ] Step 6: Cloud Run service created
- [ ] Step 7: Container settings configured (port, memory, CPU)
- [ ] Step 8: All environment variables added
- [ ] Step 8: All secrets mapped from Secrets Manager
- [ ] Step 9: Cloud SQL connection added
- [ ] Step 10: Service deployed successfully
- [ ] Step 10: Health check passes
- [ ] Step 10: Application works correctly

---

**Congratulations!** Your Startege application should now be running on Google Cloud Run! 🎉

