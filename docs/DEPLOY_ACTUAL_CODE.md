# Deploy Your Actual Application Code

## Current Situation

You've successfully created the Cloud Run service and configured all settings, but you're seeing the placeholder page because **no actual code has been deployed yet**.

The logs show:
- ✅ Container started successfully
- ✅ Listening on port 8080
- ❌ But it's showing the placeholder image, not your actual application

## Solution: Deploy via GitHub Actions

The easiest way to deploy your actual code is via GitHub Actions, which will:
1. Build your Next.js application
2. Create a Docker container
3. Deploy to Cloud Run

### Step 1: Verify GitHub Secrets

Make sure you have `GCP_SA_KEY` set in GitHub Secrets:
1. Go to: https://github.com/fasahat78/startege/settings/secrets/actions
2. Verify `GCP_SA_KEY` exists
3. If not, add it (see Step 5 in GCP_COMPLETE_SETUP_GUIDE.md)

### Step 2: Trigger Deployment

**Option A: Push to Main Branch (Automatic)**
1. Make any small change to your code (or just commit existing changes)
2. Push to `main` branch:
   ```bash
   git add .
   git commit -m "Trigger deployment"
   git push origin main
   ```
3. GitHub Actions will automatically trigger deployment

**Option B: Manual Trigger**
1. Go to: https://github.com/fasahat78/startege/actions
2. Click on **"Deploy to Google Cloud Run"** workflow
3. Click **"Run workflow"** dropdown
4. Select branch: `main`
5. Click **"Run workflow"** button

### Step 3: Monitor Deployment

1. Go to: https://github.com/fasahat78/startege/actions
2. Click on the running workflow
3. Watch the build logs:
   - **Build step**: Building your Next.js app
   - **Deploy step**: Deploying to Cloud Run
   - Wait 5-10 minutes for completion

### Step 4: Verify Deployment

After deployment completes:
1. Go to Cloud Run: https://console.cloud.google.com/run
2. Click on your service: `startege`
3. Check **"Logs"** tab - should show your application logs, not placeholder
4. Visit your service URL - should show your actual landing page

## Alternative: Deploy via Cloud Build (Manual)

If you prefer to deploy manually via Cloud Console:

### Step 1: Connect Repository

1. Go to Cloud Run → Your service → Edit
2. **Source** tab
3. **Connect repository** (if not connected)
4. Select your GitHub repository
5. Branch: `main`

### Step 2: Configure Build

1. **Build type**: **Dockerfile** (or **Cloud Build**)
2. **Dockerfile location**: `Dockerfile` (if you have one)
3. Or use **Cloud Build** to build from source

### Step 3: Deploy

1. Click **"DEPLOY"**
2. Wait for build and deployment
3. Monitor build logs

## Troubleshooting

### Issue: Build Fails

**Check**:
1. GitHub Actions logs for errors
2. Verify `GCP_SA_KEY` is correct
3. Check Dockerfile exists (if using Dockerfile)
4. Verify all dependencies in `package.json`

### Issue: Still Shows Placeholder

**Check**:
1. Verify deployment completed successfully
2. Check Cloud Run → Logs - should show your app logs
3. Clear browser cache and reload
4. Verify the correct revision is active

### Issue: Application Errors

**Check**:
1. Cloud Run → Logs tab
2. Verify all environment variables are set
3. Verify secrets are mapped correctly
4. Check database connection

## What Should Happen

After successful deployment:

✅ **Logs should show**:
- Next.js build output
- Application startup messages
- Your application routes

✅ **Website should show**:
- Your actual landing page
- Not the placeholder unicorn

✅ **Health check** (`/api/health`) should return:
```json
{
  "status": "UP",
  "timestamp": "...",
  "application": {...}
}
```

## Quick Checklist

- [ ] GitHub Secret `GCP_SA_KEY` is configured
- [ ] Code is pushed to `main` branch
- [ ] GitHub Actions workflow triggered
- [ ] Build completed successfully
- [ ] Deployment completed successfully
- [ ] Service shows actual application (not placeholder)
- [ ] Health check endpoint works
- [ ] Landing page loads correctly

## Next Steps After Deployment

Once your actual code is deployed:

1. ✅ Update `NEXT_PUBLIC_APP_URL` with your service URL
2. ✅ Test all features (sign up, sign in, etc.)
3. ✅ Verify database connections
4. ✅ Check application logs for any errors
5. ✅ Set up monitoring and alerts

