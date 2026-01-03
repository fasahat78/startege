# GitHub Setup and Deployment Guide

**Repository**: https://github.com/fasahat78/startege.git

## Initial Setup

### 1. Initialize Git Repository (if not already done)

```bash
cd /Users/fasahatferoze/Desktop/Startege
git init
git remote add origin https://github.com/fasahat78/startege.git
```

### 2. Configure GitHub Secrets

Go to: https://github.com/fasahat78/startege/settings/secrets/actions

Add the following secrets (Settings → Secrets and variables → Actions → New repository secret):

#### Required Secrets

**Database:**
- `DATABASE_URL` - PostgreSQL connection string

**Firebase (Client):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Firebase (Admin):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Full JSON string

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
- `GCP_PROJECT_ID`
- `GCP_LOCATION`
- `NEXT_PUBLIC_GCP_PROJECT_ID`
- `NEXT_PUBLIC_GCP_LOCATION`
- `GCS_BUCKET_NAME`
- `VECTOR_SEARCH_INDEX_ID`
- `VECTOR_SEARCH_ENDPOINT_ID`
- `VECTOR_SEARCH_DEPLOYMENT_ID`
- `CLOUD_SCHEDULER_SECRET_KEY`

**Application:**
- `NEXT_PUBLIC_APP_URL` - Production URL (e.g., https://startege.com)

#### Optional Secrets

**Rate Limiting:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Error Tracking:**
- `NEXT_PUBLIC_SENTRY_DSN`

**Analytics:**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (Google Analytics)
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (Plausible)

## GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

Actions:
- Lint code
- Generate Prisma client
- Build application

### Deploy Workflow (`.github/workflows/deploy.yml`)

Runs on:
- Push to `main` branch
- Manual trigger (workflow_dispatch)

Actions:
- Install dependencies
- Generate Prisma client
- Run database migrations
- Build application
- Deploy (configure based on hosting platform)

## Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)

1. Connect repository to Vercel
2. Add Vercel secrets to GitHub:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. Uncomment Vercel deployment step in `deploy.yml`

### Option 2: Google Cloud Run

1. Create service account with Cloud Run Admin role
2. Add secret to GitHub:
   - `GCP_SA_KEY` - Service account JSON
3. Uncomment Cloud Run deployment steps in `deploy.yml`

### Option 3: Other Platforms

Modify `deploy.yml` to add your platform's deployment steps.

## First Deployment

1. **Commit and push code:**
   ```bash
   git add .
   git commit -m "Initial commit: Production-ready Startege application"
   git branch -M main
   git push -u origin main
   ```

2. **Configure GitHub Secrets** (see above)

3. **Trigger deployment:**
   - Push to `main` branch, OR
   - Go to Actions → Deploy to Production → Run workflow

## Branch Strategy

- `main` - Production branch (auto-deploys)
- `develop` - Development branch (CI only)

## Monitoring

- GitHub Actions: https://github.com/fasahat78/startege/actions
- Check workflow runs for build/deployment status

## Troubleshooting

### Build Failures
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure DATABASE_URL is accessible from GitHub Actions

### Deployment Failures
- Verify deployment platform credentials
- Check deployment logs in Actions
- Ensure environment variables match production requirements

## Security Notes

⚠️ **Never commit secrets to repository**
- All secrets must be in GitHub Secrets
- `.env.local` is in `.gitignore`
- `.env.example` is safe to commit (no real values)

## Next Steps

1. Set up GitHub Secrets
2. Choose deployment platform
3. Configure deployment step in `deploy.yml`
4. Push to `main` branch
5. Monitor deployment in Actions tab

