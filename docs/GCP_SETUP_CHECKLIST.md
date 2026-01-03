# GCP Setup Checklist (Console-Based)

Use this checklist to ensure all GCP setup steps are completed via the Google Cloud Console.

## ✅ Prerequisites

- [ ] Google Cloud Project created
- [ ] Billing enabled on project
- [ ] Code pushed to GitHub (✅ Done)

## ✅ Step 1: Enable APIs

Go to: https://console.cloud.google.com/apis/library

- [ ] Cloud Run API enabled
- [ ] Cloud Build API enabled
- [ ] Cloud SQL Admin API enabled (if using Cloud SQL)
- [ ] Cloud Resource Manager API enabled

## ✅ Step 2: Create Service Account

Go to: https://console.cloud.google.com/iam-admin/serviceaccounts

- [ ] Service account created: `startege-github-actions-deploy`
- [ ] Role assigned: Cloud Run Admin
- [ ] Role assigned: Service Account User
- [ ] Role assigned: Cloud Build Editor
- [ ] Role assigned: Storage Admin (if using Cloud Storage)

## ✅ Step 3: Create Service Account Key

- [ ] JSON key downloaded
- [ ] Key file saved securely
- [ ] Key content copied for GitHub Secret

## ✅ Step 4: Cloud SQL Setup (If Using)

Go to: https://console.cloud.google.com/sql/instances

- [ ] PostgreSQL instance created
- [ ] Database `startege` created
- [ ] Connection name copied
- [ ] Username and password saved securely

## ✅ Step 5: GitHub Secrets

Go to: https://github.com/fasahat78/startege/settings/secrets/actions

### Required Secrets:

- [ ] `GCP_SA_KEY` (service account JSON)
- [ ] `DATABASE_URL` (Cloud SQL connection string)
- [ ] `GCP_PROJECT_ID`
- [ ] `GCP_LOCATION`
- [ ] `NEXT_PUBLIC_GCP_PROJECT_ID`
- [ ] `NEXT_PUBLIC_GCP_LOCATION`
- [ ] `NEXT_PUBLIC_APP_URL` (set after deployment)

### Firebase Secrets:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY`

### Stripe Secrets:

- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_MONTHLY`
- [ ] `STRIPE_PRICE_ANNUAL`
- [ ] `STRIPE_PRICE_LIFETIME`
- [ ] `STRIPE_PRICE_CREDITS_SMALL`
- [ ] `STRIPE_PRICE_CREDITS_STANDARD`
- [ ] `STRIPE_PRICE_CREDITS_LARGE`

### Other Secrets:

- [ ] `OPENAI_API_KEY` or `CHATGPT_API_KEY`
- [ ] `GCS_BUCKET_NAME` (if using Cloud Storage)
- [ ] `CLOUD_SCHEDULER_SECRET_KEY` (if using Cloud Scheduler)

**Not Required:**
- ❌ `VECTOR_SEARCH_INDEX_ID` - Not used (app uses keyword search, not semantic search)
- ❌ `VECTOR_SEARCH_ENDPOINT_ID` - Not used
- ❌ `VECTOR_SEARCH_DEPLOYMENT_ID` - Not used

## ✅ Step 6: Deploy

- [ ] GitHub Actions workflow triggered
- [ ] Deployment completed successfully
- [ ] Service URL obtained from Cloud Run console

## ✅ Step 7: Post-Deployment

- [ ] Health check tested: `/api/health`
- [ ] Landing page loads correctly
- [ ] Authentication works
- [ ] Database connection verified
- [ ] `NEXT_PUBLIC_APP_URL` updated in GitHub Secrets

## ✅ Step 8: Optional Configuration

- [ ] Custom domain configured (if desired)
- [ ] Cloud SQL connection added to Cloud Run service
- [ ] Scaling configured (min/max instances)
- [ ] Monitoring alerts set up
- [ ] Cloud SQL backups enabled

## Quick Links

- **APIs**: https://console.cloud.google.com/apis/library
- **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts
- **Cloud Run**: https://console.cloud.google.com/run
- **Cloud SQL**: https://console.cloud.google.com/sql/instances
- **GitHub Secrets**: https://github.com/fasahat78/startege/settings/secrets/actions
- **GitHub Actions**: https://github.com/fasahat78/startege/actions

