# Add Your IP to Cloud SQL Authorized Networks

## The Issue

Connection timeout means your local machine's IP is not authorized to connect to Cloud SQL.

## Quick Fix

1. **Get your current public IP:**
   ```bash
   curl https://api.ipify.org
   ```

2. **Add it to Cloud SQL Authorized Networks:**
   - Go to: https://console.cloud.google.com/sql/instances/startege-db/connections?project=startege
   - Scroll to **"Authorized networks"** section
   - Click **"+ ADD NETWORK"**
   - **Name**: `My Local Machine` (or any name)
   - **Network**: Paste your IP from step 1 (or use `0.0.0.0/0` for testing - **NOT recommended for production**)
   - Click **"SAVE"**

3. **Wait 1-2 minutes** for the change to propagate

4. **Run migrations again:**
   ```bash
   export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@104.154.59.239:5432/startege?sslmode=require"
   npx prisma migrate deploy
   ```

## Alternative: Use Cloud Run Job (No IP Authorization Needed)

If you can't add your IP, use a Cloud Run job instead:

1. Go to: https://console.cloud.google.com/run/jobs?project=startege
2. Click **"CREATE JOB"**
3. **Name**: `startege-migrations`
4. **Container image**: `node:20-alpine`
5. **Command**: 
   ```bash
   sh -c "npm install -g prisma && prisma migrate deploy"
   ```
6. **Environment variables**:
   - `DATABASE_URL`: `postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db`
7. **Cloud SQL connections**: Add `startege-db`
8. Click **"CREATE"** then **"EXECUTE JOB"**

This uses the Unix socket connection (already configured in Cloud Run), so no IP authorization needed.

