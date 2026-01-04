# Fix "Empty Host in Database URL" Error

## Error: `empty host in database URL`

This error means `DATABASE_URL` is either missing or malformed in Cloud Run.

---

## Quick Fix: Add DATABASE_URL to Cloud Run

### Step 1: Construct Your DATABASE_URL

**Format**: `postgresql://USERNAME:PASSWORD@/DATABASE_NAME?host=/cloudsql/CONNECTION_NAME`

**Your values**:
- **Username**: `postgres`
- **Password**: `Zoya@57Bruce` (URL-encode `@` as `%40`)
- **Database**: `startege`
- **Connection**: `startege:us-central1:startege-db`

**Your DATABASE_URL**:
```
postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
```

**Important**: The `@` in the password must be URL-encoded as `%40`.

---

### Step 2: Add DATABASE_URL to Cloud Run

#### Option A: Direct Environment Variable (Quick Fix)

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your `startege` service
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. Scroll to **"Environment variables"** section
6. Click **"+ ADD VARIABLE"**
7. **Name**: `DATABASE_URL`
8. **Value**: 
   ```
   postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
   ```
9. Click **"DEPLOY"**

#### Option B: Use Secrets Manager (Recommended for Security)

**First, create the secret:**

1. Go to: https://console.cloud.google.com/security/secret-manager
2. Click **"+ CREATE SECRET"**
3. **Name**: `startege-database-url`
4. **Secret value**: Paste your DATABASE_URL:
   ```
   postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
   ```
5. Click **"CREATE SECRET"**

**Then, grant Cloud Run access:**

1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Find: `785373873454-compute@developer.gserviceaccount.com`
3. Click **pencil icon** (Edit)
4. Click **"+ ADD ANOTHER ROLE"**
5. Select: **Secret Manager Secret Accessor** (`roles/secretmanager.secretAccessor`)
6. Click **"SAVE"**

**Finally, add to Cloud Run:**

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your `startege` service → **"EDIT & DEPLOY NEW REVISION"**
3. Go to **"Variables & Secrets"** tab
4. Scroll to **"Secrets"** section
5. Click **"+ REFERENCE A SECRET"**
6. **Name**: `DATABASE_URL`
7. **Secret**: Select `startege-database-url`
8. **Version**: `latest`
9. Click **"DEPLOY"**

---

## Verify DATABASE_URL Format

Your DATABASE_URL should look exactly like this:

```
postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
```

**Key points**:
- ✅ Starts with `postgresql://`
- ✅ Username: `postgres`
- ✅ Password: `Zoya%4057Bruce` (with `%40` instead of `@`)
- ✅ Database: `startege`
- ✅ Connection: `/cloudsql/startege:us-central1:startege-db`

**Common mistakes**:
- ❌ Using `@` instead of `%40` in password
- ❌ Missing `/cloudsql/` prefix
- ❌ Wrong connection name format
- ❌ Extra spaces or quotes

---

## Test the Connection

After adding DATABASE_URL:

1. **Deploy the new revision** (if you used Option A or B)
2. **Wait for deployment** to complete
3. **Test the health endpoint**:
   ```
   curl https://your-cloud-run-url/api/health
   ```
   Should show `"database": { "status": "healthy" }`

4. **Try signing in** - should work now

---

## Debug: Check Current DATABASE_URL

### Check Cloud Run Environment Variables

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on your service
3. Go to **"Variables & Secrets"** tab
4. Look for `DATABASE_URL`
5. Check if it's set and what the value is

### Check via gcloud CLI

```bash
gcloud run services describe startege \
  --project=startege \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

### Check via Debug Endpoint

Visit: `https://your-cloud-run-url/api/debug/firebase`

This will also show database connection status.

---

## Common Issues

### Issue 1: DATABASE_URL Not Set

**Symptom**: Error says "empty host"

**Solution**: Add DATABASE_URL to Cloud Run (see Step 2 above)

### Issue 2: Wrong Password Encoding

**Symptom**: Connection fails with authentication error

**Solution**: Make sure `@` in password is encoded as `%40`

### Issue 3: Wrong Connection Name

**Symptom**: Connection fails with "connection refused"

**Solution**: 
1. Verify connection name: `startege:us-central1:startege-db`
2. Check Cloud SQL instance exists
3. Verify Cloud Run has Cloud SQL connection permission

### Issue 4: Secret Manager Permission Denied

**Symptom**: Error accessing secret

**Solution**: Grant `Secret Manager Secret Accessor` role to Cloud Run service account (see Option B above)

---

## Quick Checklist

- [ ] DATABASE_URL constructed correctly
- [ ] Password `@` encoded as `%40`
- [ ] Connection name format correct: `/cloudsql/startege:us-central1:startege-db`
- [ ] DATABASE_URL added to Cloud Run (direct or via Secrets Manager)
- [ ] Cloud Run service account has Secret Manager access (if using secrets)
- [ ] New revision deployed
- [ ] Health endpoint shows database as healthy
- [ ] Sign-in works

---

## Still Not Working?

1. **Check Cloud Run logs**:
   - Go to Cloud Run → Your service → **"Logs"** tab
   - Look for database connection errors

2. **Verify Cloud SQL connection**:
   - Go to: https://console.cloud.google.com/sql/instances
   - Verify instance `startege-db` exists
   - Check connection name matches

3. **Test connection string locally**:
   ```bash
   # Test if the connection string format is correct
   echo "postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db"
   ```

4. **Share the error details**:
   - Cloud Run logs
   - Health endpoint response
   - Exact DATABASE_URL format you're using (mask password)

