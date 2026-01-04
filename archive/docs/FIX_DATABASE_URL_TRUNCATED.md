# Fix: DATABASE_URL Truncated in Cloud Run

## The Problem

From your screenshot, I can see:
- **DATABASE_URL value**: `postgresql://postgres:Zoya%4057Bruce@/starteç`
- **Issue 1**: Truncated - missing `?host=/cloudsql/startege:us-central1:startege-db`
- **Issue 2**: Database name shows `starteç` instead of `startege` (encoding issue)

## The Complete DATABASE_URL Should Be:

```
postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
```

**Key parts**:
- `postgresql://` - Protocol
- `postgres` - Username
- `Zoya%4057Bruce` - Password (with `@` encoded as `%40`)
- `/startege` - Database name (NOT `starteç`)
- `?host=/cloudsql/startege:us-central1:startege-db` - Unix socket path

## Fix Steps

### Step 1: Update DATABASE_URL in Cloud Run

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on `startege` service → **"EDIT & DEPLOY NEW REVISION"**
3. Go to **"Variables & Secrets"** tab
4. Find `DATABASE_URL` environment variable
5. **Replace the entire value** with:
   ```
   postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
   ```
6. **Important**: 
   - Copy the entire string above
   - Paste it exactly as shown
   - Make sure there are NO extra spaces
   - Make sure database name is `startege` (not `starteç`)
   - Make sure it includes `?host=/cloudsql/...` at the end
7. Click **"DEPLOY"**

### Step 2: Verify After Deployment

After deployment, check Cloud Run logs for `[PRISMA]` messages. You should see:

```
[PRISMA] DATABASE_URL present: true
[PRISMA] DATABASE_URL length: 89
[PRISMA] Has /cloudsql/: true
[PRISMA] Has host parameter: true
```

### Step 3: Test Connection

Try signing in again. The error should be resolved.

## Why This Happens

Cloud Run's environment variable input might:
1. **Truncate long values** if there's a character limit
2. **Have encoding issues** with special characters
3. **Not save the full value** if you copy/paste incorrectly

## Alternative: Use Secret Manager (Recommended)

Instead of direct environment variable, use Secret Manager:

1. **Update the secret** in Secret Manager:
   - Go to: https://console.cloud.google.com/security/secret-manager/secret/DATABASE_URL/versions?project=startege
   - Create new version with the complete value:
     ```
     postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
     ```

2. **Reference it in Cloud Run**:
   - Remove the direct `DATABASE_URL` environment variable
   - Add it as a secret reference:
     - Name: `DATABASE_URL`
     - Secret: `DATABASE_URL`
     - Version: `latest`

This avoids truncation issues and is more secure.

## Quick Checklist

- [ ] DATABASE_URL includes `?host=/cloudsql/startege:us-central1:startege-db`
- [ ] Database name is `startege` (not `starteç`)
- [ ] Password has `%40` not `@`
- [ ] No extra spaces or quotes
- [ ] Full connection string is 89 characters long
- [ ] New revision deployed
- [ ] Logs show `[PRISMA] DATABASE_URL present: true`

