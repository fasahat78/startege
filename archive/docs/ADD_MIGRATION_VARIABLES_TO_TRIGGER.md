# Add Migration Variables to Cloud Build Trigger

## Required Action

Since migrations are now integrated into the main build, you need to add two new substitution variables to your Cloud Build trigger.

## Steps

1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=startege
2. Click on your trigger (likely named `startege`)
3. Click **"EDIT"**
4. Scroll down to **"Substitution variables"** section
5. Add these two variables:

   **Variable 1:**
   - **Key:** `_CLOUD_SQL_CONNECTION_NAME`
   - **Value:** `startege:us-central1:startege-db`

   **Variable 2:**
   - **Key:** `_DATABASE_URL`
   - **Value:** `postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege`

6. Click **"SAVE"**

## Verify

After saving, the next time you push to your repository, the build will:
1. ✅ Start Cloud SQL Proxy
2. ✅ Run Prisma migrations
3. ✅ Build Docker image
4. ✅ Deploy to Cloud Run

If migrations fail, the build will stop and deployment won't happen (which is good - prevents deploying broken code).

---

## Current Substitution Variables

Your trigger should now have these variables:

- `_NEXT_PUBLIC_FIREBASE_API_KEY`
- `_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `_NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `_NEXT_PUBLIC_FIREBASE_APP_ID`
- `_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `_NEXT_PUBLIC_GCP_PROJECT_ID`
- `_NEXT_PUBLIC_GCP_LOCATION`
- `_NEXT_PUBLIC_APP_URL`
- `_SERVICE_NAME` (defaults to `startege`)
- `_REGION` (defaults to `us-central1`)
- **NEW:** `_CLOUD_SQL_CONNECTION_NAME` ← Add this
- **NEW:** `_DATABASE_URL` ← Add this

---

## Troubleshooting

### Build fails at migration step

**Check:**
1. Cloud Build service account has `Cloud SQL Client` role (you already did this ✅)
2. `_CLOUD_SQL_CONNECTION_NAME` is correct: `startege:us-central1:startege-db`
3. `_DATABASE_URL` uses `127.0.0.1:5432` (not Unix socket) for Cloud SQL Proxy
4. Cloud SQL instance is running

### Migrations run but tables still don't exist

- Check build logs to see if migrations actually succeeded
- Verify `prisma/migrations/` directory is in your repository
- Ensure Prisma schema is up to date

